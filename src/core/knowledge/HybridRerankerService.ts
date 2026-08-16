// Module 11: Real-time Hybrid Search & Re-ranking Engine
import { SearchResultChunk, DocumentChunk, VectorSearchParams } from "../../types/knowledgeIntelligence";
import { VectorEmbeddingEngine } from "./VectorEmbeddingEngine";

export class HybridRerankerServiceStore {
  /**
   * Reciprocal Rank Fusion (RRF) algorithm:
   * RRF_score = (1 / (K + rank_dense)) + (1 / (K + rank_sparse))
   * Default K = 60
   */
  public performHybridSearch(params: VectorSearchParams): SearchResultChunk[] {
    const { query, tenantId, topK = 10, rrfK = 60, minScoreThreshold = 0.05 } = params;

    const queryVector = VectorEmbeddingEngine.generateLocalEmbedding(query);
    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2);

    const allChunks = VectorEmbeddingEngine.getAllIndexedChunks(tenantId);

    // 1. Dense Vector Rank
    const denseRanked = allChunks
      .map(chunk => ({
        chunk,
        score: chunk.denseVector ? VectorEmbeddingEngine.computeCosineSimilarity(queryVector, chunk.denseVector) : 0
      }))
      .sort((a, b) => b.score - a.score);

    const denseRankMap = new Map<string, { rank: number; score: number }>();
    denseRanked.forEach((item, idx) => {
      denseRankMap.set(item.chunk.id, { rank: idx + 1, score: item.score });
    });

    // 2. Sparse BM25 Rank
    const sparseRanked = allChunks
      .map(chunk => {
        const bm25 = chunk.sparseTokens ? VectorEmbeddingEngine.computeBM25Score(queryTokens, chunk.sparseTokens) : 0;
        return { chunk, score: bm25 };
      })
      .sort((a, b) => b.score - a.score);

    const sparseRankMap = new Map<string, { rank: number; score: number }>();
    sparseRanked.forEach((item, idx) => {
      sparseRankMap.set(item.chunk.id, { rank: idx + 1, score: item.score });
    });

    // 3. Reciprocal Rank Fusion Calculation
    const combinedResults: SearchResultChunk[] = allChunks.map(chunk => {
      const d = denseRankMap.get(chunk.id) || { rank: 999, score: 0 };
      const s = sparseRankMap.get(chunk.id) || { rank: 999, score: 0 };

      const rrfScore = (1.0 / (rrfK + d.rank)) + (1.0 / (rrfK + s.rank));

      // Matched keywords
      const matched = queryTokens.filter(tok => chunk.content.toLowerCase().includes(tok));

      // Final rerank score (weighted multi-factor)
      const rerankScore = (rrfScore * 100) + (d.score * 0.4) + (matched.length * 0.1);

      return {
        chunk,
        documentTitle: (chunk.headingPath && chunk.headingPath[0]) ? chunk.headingPath[0] : "Knowledge Source",
        denseScore: d.score,
        sparseScore: s.score,
        rrfScore,
        rerankScore,
        matchedKeywords: matched
      };
    });

    return combinedResults
      .filter(item => item.rerankScore >= minScoreThreshold)
      .sort((a, b) => b.rerankScore - a.rerankScore)
      .slice(0, topK);
  }
}

export const HybridRerankerService = new HybridRerankerServiceStore();
