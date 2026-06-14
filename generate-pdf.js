const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR = __dirname;

async function generatePDF(htmlFile, outputFile, opts = {}) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754 });

  const url = 'file://' + path.join(DIR, htmlFile);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Attendre les webfonts Satoshi
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 2000));

  const pdfOptions = {
    path: path.join(DIR, outputFile),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: opts.margin || { top: '0', right: '0', bottom: '0', left: '0' },
    ...opts.extra,
  };

  await page.pdf(pdfOptions);
  await browser.close();
  console.log('✓ ' + outputFile);
}

(async () => {
  console.log('Génération des PDFs…');

  // Dossier institutionnel — A4 strict, marges 0 (géré par le HTML)
  await generatePDF(
    'aide-federation-water-mayotte.html',
    'AIDE-Federation-Water-Dossier-Institutionnel.pdf',
    { margin: { top: '0', right: '0', bottom: '0', left: '0' } }
  );

  // Landing Ngannou — version print dédiée A4
  await generatePDF(
    'ngannou-partnership-print.html',
    'AIDE-Federation-Water-Ngannou-Partnership.pdf',
    { margin: { top: '0', right: '0', bottom: '0', left: '0' } }
  );

  console.log('Terminé.');
})();
