import { storageService } from "../../services/EnterpriseKnowledgeStorageService";

export class KnowledgeInvalidationEngine {
  public static async invalidateBook(bookId: string): Promise<void> {
    console.log(`[KnowledgeInvalidation] Invalidating existing knowledge nodes for Book ID: ${bookId}...`);
    
    // 1. Delete all Embeddings for this book
    try {
      const allEmbeddings = await storageService.embeddingRepo.getAll();
      const affectedEmbeddings = allEmbeddings.filter(e => e.bookId === bookId);
      for (const e of affectedEmbeddings) {
         await storageService.embeddingRepo.delete(e.id);
      }
      console.log(`[KnowledgeInvalidation] Removed ${affectedEmbeddings.length} obsolete embeddings.`);
      
      // 2. Delete all Search Indexes for this book
      const allSearch = await storageService.searchRepo.getAll();
      const affectedSearch = allSearch.filter(s => s.bookId === bookId);
      for (const s of affectedSearch) {
         await storageService.searchRepo.delete(s.id);
      }
      console.log(`[KnowledgeInvalidation] Removed ${affectedSearch.length} obsolete search indexes.`);
      
      // Additional entities (chapters, sections, rules, etc.) would be invalidated here if fully mapped.
    } catch (e) {
      console.error("[KnowledgeInvalidation] Failed to invalidate old nodes:", e);
    }
  }
}
