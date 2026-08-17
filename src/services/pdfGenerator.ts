import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const GOOGLE_FONT_URLS: Record<string, string> = {
  Inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  Poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap',
  Roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  Lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
};

const fontLinks = (html: string): string => {
  const urls = new Set<string>();
  const re = /font-family\s*:\s*(?:'|")?([^;'"}]+?)(?:'|")?/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const name = match[1].trim().split(',')[0].trim();
    const url = GOOGLE_FONT_URLS[name];
    if (url) urls.add(url);
  }
  return [...urls].map((url) => `<link rel="stylesheet" href="${url}">`).join('');
};

export const generatePDF = async (html: string, css: string): Promise<Buffer> => {
  // Strip scripts and print-only shadow classes before rendering
  const safeHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\bshadow(-[a-z0-9]+)?\b/g, '');

  const htmlTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    ${fontLinks(safeHtml)}
    <style>${css}</style>
  </head>
  <body>${safeHtml}</body>
</html>`;

  let browser;
  try {
    const executablePath = process.env.CHROME_PATH || (await chromium.executablePath());

    browser = await puppeteer.launch({
      executablePath: executablePath,
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
      ],
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, {
      waitUntil: ['load', 'domcontentloaded'],
      timeout: 30000,
    });
    await page.evaluate(
      () => (globalThis as unknown as { document: { fonts: { ready: Promise<unknown> } } }).document.fonts.ready
    );

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });

    return pdfBuffer as Buffer;
  } catch (error) {
    console.error('PDF GENERATION ERROR:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};