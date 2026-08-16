import { storageService } from "../../services/EnterpriseKnowledgeStorageService";
import { EmbeddingClient } from "./EmbeddingClient";

export interface SearchResult {
  content: string;
  score: number;
}

export class HybridSearchEngine {
  private static instance: HybridSearchEngine;
  
  public static getInstance(): HybridSearchEngine {
    if (!HybridSearchEngine.instance) {
      HybridSearchEngine.instance = new HybridSearchEngine();
    }
    return HybridSearchEngine.instance;
  }

  // Cosine Similarity
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    // 1. Get embedding for the query
    let queryVector: number[] = [];
    try {
      const embs = await EmbeddingClient.getEmbeddings([query]);
      queryVector = embs[0];
    } catch (e) {
      console.error("[HybridSearchEngine] Failed to get query embedding:", e);
    }
    
    const allEmbeddings = await storageService.embeddingRepo.getAll();
    const results: SearchResult[] = [];
    
    // 2. Vector Search (if embedding available)
    if (queryVector && queryVector.length > 0) {
      for (const emb of allEmbeddings) {
        const score = this.cosineSimilarity(queryVector, emb.vector);
        if (score > 0.5) { // Minimum threshold
          results.push({ content: emb.textChunk, score });
        }
      }
    }
    
    // 3. TF-IDF / Keyword Search fallback or hybrid combination
    const qTerms = query.toLowerCase().split(/\s+/);
    // Let's do a simple keyword scan on all chunks for simplicity
    for (const emb of allEmbeddings) {
       const content = emb.textChunk.toLowerCase();
       let matchCount = 0;
       for (const term of qTerms) {
         if (term.length > 3 && content.includes(term)) {
            matchCount++;
         }
       }
       
       if (matchCount > 0) {
          const keywordScore = Math.min(matchCount * 0.1, 0.5); // Boost
          const existing = results.find(r => r.content === emb.textChunk);
          if (existing) {
             existing.score += keywordScore;
          } else {
             results.push({ content: emb.textChunk, score: keywordScore });
          }
       }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
