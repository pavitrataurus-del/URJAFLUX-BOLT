import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
      const location = msg.location();
      console.log(`URL: ${location.url}, Line: ${location.lineNumber}`);
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR (Uncaught Exception):', err.message);
    console.log('STACK:', err.stack);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Page loaded successfully.');
  } catch (err) {
    console.log('Error loading page:', err);
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await browser.close();
})();
