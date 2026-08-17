import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { IResume } from '../models/Resume';

export const generatePDF = async (resume: IResume): Promise<Buffer> => {
  // ... Keep all of your HTML template layout generation code exactly the same ...

  let browser;
  try {
    // Dynamically locate the compressed chromium execution paths
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      executablePath: executablePath,
      args: [
        ...chromium.args, // Bundles all memory reduction flags automatically
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ],
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    
    // Set your content
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    return pdfBuffer as Buffer;
  } catch (error) {
    console.error("PDF RE-ARCHITECTED ENGINE ERROR:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
