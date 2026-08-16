import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(async () => {
    console.log("Evaluating inside browser...");
    // Just simple fetch test to firestore to see if CORS or something fails
    try {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/urjaflux-ai-os/databases/(default)/documents/test/ping`);
      console.log("Fetch status:", res.status);
    } catch (err) {
      console.log("Fetch error:", err.message);
    }
  });

  await browser.close();
  process.exit(0);
}
run();
