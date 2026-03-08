const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  // Use a local Chrome installation path for macOS.
  // In CI, you would need to adjust this to where Chrome is installed.
  const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  
  if (!fs.existsSync(executablePath)) {
    console.error('Error: Google Chrome not found at ' + executablePath);
    console.error('Please update the executablePath in scripts/generate-pdf.js or install Chrome.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Point to the built summary page.
  // Assumes you've run `npm run build` and `docusaurus serve` or are pointing to the static file.
  // For simplicity, we can point to the local file if it's served, or use a local server.
  const buildDir = path.join(__dirname, '../build');
  const summaryHtml = path.join(buildDir, 'role-reference/index.html');
  
  if (!fs.existsSync(summaryHtml)) {
    console.error('Error: Built summary page not found at ' + summaryHtml);
    console.error('Please run `npm run build` first.');
    await browser.close();
    process.exit(1);
  }

  // Use a file:// URL to open the local built HTML.
  const url = 'file://' + summaryHtml;
  
  console.log('Generating PDF from ' + url);
  
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Optional: Add custom styles for PDF (e.g., hide navbar/footer)
  await page.addStyleTag({
    content: `
      nav.navbar, footer.footer, .pagination-nav, .theme-doc-footer-edit-meta-row { display: none !important; }
      .container { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
      body { background-color: white !important; color: black !important; }
    `
  });

  const pdfPath = path.join(__dirname, '../static/role-reference-sheet.pdf');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    printBackground: true
  });

  console.log('PDF generated at ' + pdfPath);
  await browser.close();
}

generatePDF().catch(err => {
  console.error(err);
  process.exit(1);
});
