import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(async () => {
    console.log("Evaluating inside browser...");
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js');
    const { getFirestore, doc, getDoc, initializeFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js');
    const app = initializeApp({
      projectId: "urjaflux-ai-os",
      appId: "1:407931415113:web:25a94382a60aa807192d98",
      apiKey: "AIzaSyBRAwXtebrkq2CqHv7AgKEzrSrS4NQ0spM",
      authDomain: "urjaflux-ai-os.firebaseapp.com",
    }, "puppeteer-app");
    
    // Test with force long polling
    const db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false
    });
    
    try {
      const snap = await getDoc(doc(db, "test", "ping"));
      console.log("Success getDoc data:", snap.data());
    } catch (err) {
      console.log("Firebase error:", err.message);
    }
  });

  await browser.close();
  process.exit(0);
}
run();
