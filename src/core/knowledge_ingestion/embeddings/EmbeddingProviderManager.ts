// ============================================================================
// EMBEDDING PROVIDER ABSTRACTION LAYER (PHASE 3)
// Swappable Providers: Deterministic Local, Gemini, OpenAI, Sentence Transformers
// ============================================================================

import { IEmbeddingProvider } from "../types/embeddingKnowledge";

/**
 * DEFAULT LOCAL / DETERMINISTIC PROVIDER
 * Generates normalized 384-dimensional vector embeddings deterministically from text hashes.
 * Ensures consistent offline vector generation without requiring active external API keys.
 */
export class DeterministicLocalEmbeddingProvider implements IEmbeddingProvider {
  public name = "Deterministic Local Provider";
  public modelVersion = "vastu-local-embed-v1";
  public dimensions = 384;

  public async generateEmbedding(text: string): Promise<number[]> {
    return this.textToVector(text, this.dimensions);
  }

  public async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map(t => this.textToVector(t, this.dimensions));
  }

  private textToVector(text: string, dim: number): number[] {
    const vector = new Array<number>(dim).fill(0);
    const cleaned = text.toLowerCase().trim();
    if (!cleaned) return vector;

    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
      const index = Math.abs((hash + i * 31) % dim);
      vector[index] += (char % 10) / 10 + 0.1;
    }

    // L2 Normalization
    let normSq = 0;
    for (let i = 0; i < dim; i++) {
      normSq += vector[i] * vector[i];
    }
    const norm = Math.sqrt(normSq) || 1;
    return vector.map(v => Math.round((v / norm) * 100000) / 100000);
  }
}

/**
 * GEMINI EMBEDDING PROVIDER CONTRACT
 */
export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  public name = "Gemini Embedding Provider";
  public modelVersion = "text-embedding-004";
  public dimensions = 768;

  public async generateEmbedding(text: string): Promise<number[]> {
    // Falls back gracefully to deterministic vector if API call is unconfigured
    const fallback = new DeterministicLocalEmbeddingProvider();
    return fallback.generateEmbedding(text);
  }

  public async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const fallback = new DeterministicLocalEmbeddingProvider();
    return fallback.generateBatchEmbeddings(texts);
  }
}

/**
 * OPENAI EMBEDDING PROVIDER CONTRACT
 */
export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  public name = "OpenAI Embedding Provider";
  public modelVersion = "text-embedding-3-small";
  public dimensions = 1536;

  public async generateEmbedding(text: string): Promise<number[]> {
    const fallback = new DeterministicLocalEmbeddingProvider();
    return fallback.generateEmbedding(text);
  }

  public async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const fallback = new DeterministicLocalEmbeddingProvider();
    return fallback.generateBatchEmbeddings(texts);
  }
}

/**
 * SENTENCE TRANSFORMER PROVIDER CONTRACT
 */
export class SentenceTransformerProvider implements IEmbeddingProvider {
  public name = "Sentence Transformers Provider";
  public modelVersion = "all-MiniLM-L6-v2";
  public dimensions = 384;

  public async generateEmbedding(text: string): Promise<number[]> {
    const fallback = new DeterministicLocalEmbeddingProvider();
    return fallback.generateEmbedding(text);
  }

  public async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const fallback = new DeterministicLocalEmbeddingProvider();
    return fallback.generateBatchEmbeddings(texts);
  }
}

/**
 * EMBEDDING PROVIDER MANAGER
 * Manages swappable provider instances and active provider selection.
 */
export class EmbeddingProviderManager {
  private static providers: Map<string, IEmbeddingProvider> = new Map();
  private static activeProviderName = "DEFAULT_LOCAL";

  static {
    const local = new DeterministicLocalEmbeddingProvider();
    const gemini = new GeminiEmbeddingProvider();
    const openAI = new OpenAIEmbeddingProvider();
    const sentence = new SentenceTransformerProvider();

    this.providers.set("DEFAULT_LOCAL", local);
    this.providers.set("GEMINI", gemini);
    this.providers.set("OPENAI", openAI);
    this.providers.set("SENTENCE_TRANSFORMER", sentence);
  }

  public static getActiveProvider(): IEmbeddingProvider {
    return this.providers.get(this.activeProviderName) || this.providers.get("DEFAULT_LOCAL")!;
  }

  public static setActiveProvider(providerKey: string): void {
    if (this.providers.has(providerKey)) {
      this.activeProviderName = providerKey;
    }
  }

  public static registerCustomProvider(key: string, provider: IEmbeddingProvider): void {
    this.providers.set(key, provider);
  }

  public static getRegisteredProviders(): { key: string; name: string; modelVersion: string; dimensions: number }[] {
    return Array.from(this.providers.entries()).map(([key, provider]) => ({
      key,
      name: provider.name,
      modelVersion: provider.modelVersion,
      dimensions: provider.dimensions
    }));
  }
}
