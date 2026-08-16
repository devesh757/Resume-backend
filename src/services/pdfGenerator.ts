import puppeteer from 'puppeteer';
import { IResume } from '../models/Resume';

export const generatePDF = async (resume: IResume): Promise<Buffer> => {
  // Safe Fallback Fallbacks to prevent "undefined .map()" crashes
  const workExperience = resume.workExperience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];
  const projects = resume.projects || [];
  const customSections = resume.customSections || [];
  
  // Theme Fallbacks
  const fontName = resume.theme?.font || 'sans-serif';
  const primaryColor = resume.theme?.primaryColor || '#3b82f6';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: '${fontName}', sans-serif; }
          .primary-color { color: ${primaryColor}; }
          .border-primary { border-color: ${primaryColor}; }
        </style>
      </head>
      <body class="bg-white">
        <div class="max-w-4xl mx-auto p-8 bg-white">
          <!-- Personal Info -->
          <div class="text-center mb-6">
            <h1 class="text-4xl font-bold">${resume.personalInfo?.firstName || ''} ${resume.personalInfo?.lastName || ''}</h1>
            <p class="text-gray-600">${resume.personalInfo?.email || ''} | ${resume.personalInfo?.phone || ''}</p>
          </div>
          
          <!-- Work Experience -->
          ${workExperience.map(exp => `
            <div class="mb-4">
              <h2 class="text-xl font-semibold primary-color">${exp.role || ''} at ${exp.company || ''}</h2>
              <p class="text-sm text-gray-500">${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
              <ul class="list-disc ml-6">
                ${(exp.description || []).map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          
          <!-- Education -->
          ${education.map(edu => `
            <div class="mb-4">
              <h2 class="text-xl font-semibold primary-color">${edu.institution || ''}</h2>
              <p>${edu.degree || ''} ${edu.major ? `- ${edu.major}` : ''}</p>
              <p class="text-sm text-gray-500">${edu.graduationDate || ''}</p>
            </div>
          `).join('')}
          
          <!-- Skills -->
          ${skills.map(skillGroup => `
            <div class="mb-4">
              <h3 class="font-semibold">${skillGroup.category || ''}</h3>
              <div class="flex flex-wrap gap-2">
                ${(skillGroup.items || []).map(item => `<span class="bg-gray-100 px-2 py-1 rounded">${item.name || ''}</span>`).join('')}
              </div>
            </div>
          `).join('')}
          
          <!-- Projects -->
          ${projects.map(proj => `
            <div class="mb-4">
              <h3 class="font-semibold">${proj.title || ''}</h3>
              <p class="text-sm">${(proj.technologies || []).join(', ')}</p>
              <p>${proj.description || ''}</p>
              ${proj.link ? `<a href="${proj.link}" class="text-blue-500">Link</a>` : ''}
            </div>
          `).join('')}
          
          <!-- Custom Sections -->
          ${customSections.map(section => `
            <div class="mb-4">
              <h3 class="font-semibold">${section.title || ''}</h3>
              <ul class="list-disc ml-6">
                ${(section.items || []).map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      // Uses Render's native chrome binary environment variable route if configured
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process', // Crucial to save RAM inside Render Free 512MB Limits
        '--no-zygote'
      ],
      headless: true,
    });

    const page = await browser.newPage();
    
    // Use networkidle0 to guarantee CDN Tailwind loaded completely before taking snapshot
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    return pdfBuffer as Buffer;
  } catch (error) {
    console.error("CRITICAL PDF GENERATION ERROR:", error);
    throw error; // Let your express route capture this error cleanly
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

