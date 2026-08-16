import puppeteer from 'puppeteer';

async function main() {
  console.log("Launching Puppeteer for Stress Test...");
  const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--js-flags="--max-old-space-size=4096"'] 
  });
  
  try {
      const page = await browser.newPage();
      
      console.log("Navigating to app...");
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      
      console.log("Running Phase 3: Runtime Stress Test...");
      
      const testResult = await page.evaluate(async () => {
          try {
              const storage = window.storageService;
              const extractor = window.KnowledgeExtractionEngine;
              
              await storage.initialize();
              
              const baseText = "Vastu Shastra principle ";
              let extractedTotal = 0;
              
              // 1. Multiple imports & embeddings
              for(let i = 0; i < 5; i++) {
                 const text = baseText + i + ": Ensure proper ventilation and natural light.";
                 const units = await extractor.processAndStore(text, "STRESS-BOOK-" + i, 1);
                 extractedTotal += units.length;
              }
              
              // 2. Repeated searches
              let searchSuccesses = 0;
              for(let i = 0; i < 10; i++) {
                 const results = await storage.searchRepo.findByToken("ensure proper ventilation and natural light.");
                 if(results.length > 0) searchSuccesses++;
              }
              
              // 3. Check for duplicates / corruption
              const allEmbeddings = await storage.embeddingRepo.getAll();
              const uniqueIds = new Set(allEmbeddings.map(e => e.id));
              const hasDuplicates = uniqueIds.size !== allEmbeddings.length;
              
              return { 
                  success: true, 
                  importsProcessed: 5,
                  totalExtracted: extractedTotal,
                  searchesPerformed: 10,
                  successfulSearches: searchSuccesses,
                  totalStoredEmbeddings: allEmbeddings.length,
                  hasDuplicates: hasDuplicates,
                  stableApi: extractedTotal > 0 && searchSuccesses === 10
              };
          } catch (e) {
              return { success: false, error: e.toString() };
          }
      });
      
      console.log("\nStress Test Result:", testResult);
      
      if (!testResult.success) {
          throw new Error(testResult.error);
      }
      
  } catch (error) {
      console.error("Puppeteer Error:", error);
  } finally {
      await browser.close();
  }
}

main();
