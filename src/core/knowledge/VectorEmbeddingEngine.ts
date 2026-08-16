// Module 3: Vector Embedding & Indexing Engine
import { DocumentChunk } from "../../types/knowledgeIntelligence";

export class VectorEmbeddingEngineStore {
  private chunksIndex: Map<string, DocumentChunk> = new Map();

  // Generate deterministic dense vector embedding (32 dimensions) for offline/local execution
  public generateLocalEmbedding(text: string): number[] {
    const dim = 32;
    const vec = new Array(dim).fill(0);
    const normalized = text.toLowerCase().replace(/[^\w\s]/g, "");
    const words = normalized.split(/\s+/).filter(Boolean);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let charIdx = 0; charIdx < word.length; charIdx++) {
        const charCode = word.charCodeAt(charIdx);
        const index = (charCode + i * 7) % dim;
        vec[index] += Math.sin(charCode * 0.1) * (i + 1);
      }
    }

    // Normalize to unit vector L2 norm
    let norm = 0;
    for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1.0;

    for (let i = 0; i < dim; i++) vec[i] /= norm;
    return vec;
  }

  // Generate BM25 sparse term frequency mapping
  public generateSparseTokens(text: string): Record<string, number> {
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2);

    const freqs: Record<string, number> = {};
    tokens.forEach(tok => {
      freqs[tok] = (freqs[tok] || 0) + 1;
    });
    return freqs;
  }

  public indexChunk(chunk: DocumentChunk): DocumentChunk {
    if (!chunk.denseVector || chunk.denseVector.length === 0) {
      chunk.denseVector = this.generateLocalEmbedding(chunk.content);
    }
    if (!chunk.sparseTokens) {
      chunk.sparseTokens = this.generateSparseTokens(chunk.content);
    }

    this.chunksIndex.set(chunk.id, chunk);
    return chunk;
  }

  public indexAllChunks(chunks: DocumentChunk[]): DocumentChunk[] {
    return chunks.map(c => this.indexChunk(c));
  }

  public computeCosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      normA += v1[i] * v1[i];
      normB += v2[i] * v2[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public computeBM25Score(queryTokens: string[], docSparse: Record<string, number>): number {
    let score = 0;
    queryTokens.forEach(tok => {
      if (docSparse[tok]) {
        score += docSparse[tok] * 1.5;
      }
    });
    return score;
  }

  public searchDenseVector(
    queryVector: number[],
    tenantId: string,
    topK: number = 20
  ): { chunk: DocumentChunk; score: number }[] {
    const results: { chunk: DocumentChunk; score: number }[] = [];

    this.chunksIndex.forEach(chunk => {
      if (chunk.tenantId === tenantId || chunk.tenantId === "global_tenant") {
        if (chunk.denseVector) {
          const score = this.computeCosineSimilarity(queryVector, chunk.denseVector);
          if (score > 0) results.push({ chunk, score });
        }
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  public getAllIndexedChunks(tenantId: string): DocumentChunk[] {
    return Array.from(this.chunksIndex.values()).filter(
      c => c.tenantId === tenantId || c.tenantId === "global_tenant"
    );
  }
}

export const VectorEmbeddingEngine = new VectorEmbeddingEngineStore();
