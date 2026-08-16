import puppeteer from 'puppeteer';

async function main() {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
      const page = await browser.newPage();
      
      console.log("Navigating to app...");
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      
      console.log("Running Phase 1: Native IndexedDB Persistence Verification...");
      
      const testResult = await page.evaluate(async () => {
          try {
              if (!window.storageService || !window.KnowledgeExtractionEngine) {
                  return { success: false, error: "Engines not exposed to window." };
              }
              
              const storage = window.storageService;
              const extractor = window.KnowledgeExtractionEngine;
              
              // 1. Initialize native IDB
              await storage.initialize();
              
              // 2. Generate unique bookId
              const bookId = "IDB-TEST-BOOK-" + Date.now();
              const testText = "The north-east corner is considered the Ishanya zone, the source of supreme positive energy and water element.";
              
              // 3. Process and Store
              const units = await extractor.processAndStore(testText, bookId, 1);
              
              // 4. Verify in DB
              const embeddings = await storage.embeddingRepo.getAll();
              const testEmbeddings = embeddings.filter(e => e.bookId === bookId);
              
              const searches = await storage.searchRepo.getAll();
              const testSearches = searches.filter(s => s.bookId === bookId);
              
              return { 
                  success: true, 
                  bookId,
                  extractedUnits: units.length,
                  storedEmbeddings: testEmbeddings.length,
                  storedSearchItems: testSearches.length,
                  sampleVectorDim: testEmbeddings[0]?.dimensions,
                  sampleSearchToken: testSearches[0]?.token
              };
          } catch (e) {
              return { success: false, error: e.toString() };
          }
      });
      
      console.log("\nPhase 1 Result:", testResult);
      
      if (!testResult.success) {
          throw new Error(testResult.error);
      }
      
      console.log("\nSimulating browser restart to verify persistence...");
      
      // Close page and open a new one to simulate restart
      await page.close();
      const newPage = await browser.newPage();
      await newPage.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      
      const reloadResult = await newPage.evaluate(async (bookId, tokenToSearch) => {
          try {
              const storage = window.storageService;
              await storage.initialize();
              
              const embeddings = await storage.embeddingRepo.getAll();
              const testEmbeddings = embeddings.filter(e => e.bookId === bookId);
              
              const searches = await storage.searchRepo.getAll();
              const testSearches = searches.filter(s => s.bookId === bookId);
              
              // Use findByBookId to verify indexed access
              const resultsByBook = await storage.searchRepo.findByBookId(bookId);
              // Use findByToken to verify search by token works
              const resultsByToken = await storage.searchRepo.findByToken(tokenToSearch);
              
              return { 
                  success: true, 
                  survivedEmbeddings: testEmbeddings.length,
                  survivedSearchItems: testSearches.length,
                  searchResultsCountByBook: resultsByBook.length,
                  searchResultsCountByToken: resultsByToken.length
              };
          } catch (e) {
              return { success: false, error: e.toString() };
          }
      }, testResult.bookId, testResult.sampleSearchToken);
      
      console.log("\nPersistence After Restart:", reloadResult);
      
  } catch (error) {
      console.error("Puppeteer Error:", error);
  } finally {
      await browser.close();
  }
}

main();
