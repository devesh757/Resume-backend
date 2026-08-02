import puppeteer from 'puppeteer';
import { IResume } from '../models/Resume';

export const generatePDF = async (resume: IResume): Promise<Buffer> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: '${resume.theme.font}', sans-serif; }
          .primary-color { color: ${resume.theme.primaryColor}; }
          .border-primary { border-color: ${resume.theme.primaryColor}; }
        </style>
      </head>
      <body>
        <div class="max-w-4xl mx-auto p-8 bg-white shadow-lg">
          <!-- Personal Info -->
          <div class="text-center mb-6">
            <h1 class="text-4xl font-bold">${resume.personalInfo.firstName} ${resume.personalInfo.lastName}</h1>
            <p class="text-gray-600">${resume.personalInfo.email} | ${resume.personalInfo.phone}</p>
          </div>
          <!-- Work Experience -->
          ${resume.workExperience.map(exp => `
            <div class="mb-4">
              <h2 class="text-xl font-semibold primary-color">${exp.role} at ${exp.company}</h2>
              <p class="text-sm text-gray-500">${exp.startDate} - ${exp.endDate || 'Present'}</p>
              <ul class="list-disc ml-6">
                ${exp.description.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          <!-- Education -->
          ${resume.education.map(edu => `
            <div class="mb-4">
              <h2 class="text-xl font-semibold primary-color">${edu.institution}</h2>
              <p>${edu.degree} ${edu.major ? `- ${edu.major}` : ''}</p>
              <p class="text-sm text-gray-500">${edu.graduationDate}</p>
            </div>
          `).join('')}
          <!-- Skills -->
          ${resume.skills.map(skillGroup => `
            <div class="mb-4">
              <h3 class="font-semibold">${skillGroup.category}</h3>
              <div class="flex flex-wrap gap-2">
                ${skillGroup.items.map(item => `<span class="bg-gray-100 px-2 py-1 rounded">${item.name}</span>`).join('')}
              </div>
            </div>
          `).join('')}
          <!-- Projects -->
          ${resume.projects.map(proj => `
            <div class="mb-4">
              <h3 class="font-semibold">${proj.title}</h3>
              <p class="text-sm">${proj.technologies.join(', ')}</p>
              <p>${proj.description}</p>
              ${proj.link ? `<a href="${proj.link}" class="text-blue-500">Link</a>` : ''}
            </div>
          `).join('')}
          ${resume.customSections.map(section => `
            <div class="mb-4">
              <h3 class="font-semibold">${section.title}</h3>
              <ul class="list-disc ml-6">
                ${section.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 1000));
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
};
