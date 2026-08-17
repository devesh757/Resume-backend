import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { IResume } from '../models/Resume';

export const generatePDF = async (resume: IResume): Promise<Buffer> => {
  // Safe fallbacks to prevent undefined mapping crashes
  const workExperience = resume.workExperience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];
  const projects = resume.projects || [];
  const customSections = resume.customSections || [];
  
  const fontName = resume.theme?.font || 'sans-serif';
  const primaryColor = resume.theme?.primaryColor || '#3b82f6';

  // 1. GENERATE THE HTML STRING INSIDE THE FUNCTION
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://tailwindcss.com"></script>
        <style>
          body { font-family: '${fontName}', sans-serif; }
          .primary-color { color: ${primaryColor}; }
          .border-primary { border-color: ${primaryColor}; }
        </style>
      </head>
      <body class="bg-white">
        <div class="max-w-4xl mx-auto p-8 bg-white">
          <div class="text-center mb-6">
            <h1 class="text-4xl font-bold">${resume.personalInfo?.firstName || ''} ${resume.personalInfo?.lastName || ''}</h1>
            <p class="text-gray-600">${resume.personalInfo?.email || ''} | ${resume.personalInfo?.phone || ''}</p>
          </div>
          
          ${workExperience.map(exp => `
            <div class="mb-4">
              <h2 class="text-xl font-semibold primary-color">${exp.role || ''} at ${exp.company || ''}</h2>
              <p class="text-sm text-gray-500">${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
              <ul class="list-disc ml-6">
                ${(exp.description || []).map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          
          ${education.map(edu => `
            <div class="mb-4">
              <h2 class="text-xl font-semibold primary-color">${edu.institution || ''}</h2>
              <p>${edu.degree || ''} ${edu.major ? `- ${edu.major}` : ''}</p>
              <p class="text-sm text-gray-500">${edu.graduationDate || ''}</p>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;

  let browser;
  try {
    // 2. CONFIGURE THE LITE EXECUTABLE PATH
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      executablePath: executablePath,
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ],
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // 3. PASS THE CORRECT VARIABLE NAME HERE
    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    return pdfBuffer as Buffer;
  } catch (error) {
    console.error("PDF GENERATION ERROR:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
