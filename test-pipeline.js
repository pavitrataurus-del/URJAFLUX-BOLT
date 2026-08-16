import "fake-indexeddb/auto";
import { KnowledgeExtractionEngine } from "./src/core/import_engine/KnowledgeExtractionEngine.js";
import { storageService } from "./src/services/EnterpriseKnowledgeStorageService.js";

// Polyfill fetch
global.fetch = async (url, options) => {
  const fullUrl = url.startsWith('/') ? 'http://localhost:3000' + url : url;
  const http = await import('http');
  return new Promise((resolve, reject) => {
    const { URL } = await import('url');
    const parsedUrl = new URL(fullUrl);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: async () => JSON.parse(data),
          text: async () => data
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
};

async function main() {
  try {
    console.log("Starting pipeline...");
    const rawText = "Vastu Shastra states that the entrance of a house should ideally face East or North. This is a fundamental rule for positive energy.";
    console.log("Input:", rawText);
    
    await storageService.initialize();
    
    const units = await KnowledgeExtractionEngine.processAndStore(rawText, "test-book-123", 1);
    console.log("\nExtracted Units:", JSON.stringify(units, null, 2));
    
    const allEmbeddings = await storageService.embeddingRepo.getAll();
    console.log(`\nStored Embeddings Count: ${allEmbeddings.length}`);
    if (allEmbeddings.length > 0) {
      console.log(`Dimension of first embedding: ${allEmbeddings[0].dimensions}`);
      console.log(`Sample vector slice:`, allEmbeddings[0].vector.slice(0, 5));
    }
    
    const allSearch = await storageService.searchRepo.getAll();
    console.log(`\nStored Search Items Count: ${allSearch.length}`);
    if (allSearch.length > 0) {
      console.log(`Sample search item token:`, allSearch[0].token);
    }
    
  } catch (error) {
    console.error("Pipeline Error:", error);
  }
}
main();
