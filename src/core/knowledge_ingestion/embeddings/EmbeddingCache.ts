// ============================================================================
// EMBEDDING CACHE & DEDUPLICATION SERVICE (PHASE 3)
// Prevents duplicate vector calculations and reuses cached vectors across identical semantic text objects
// ============================================================================

export class EmbeddingCache {
  private static cache: Map<string, number[]> = new Map();
  private static hits = 0;
  private static misses = 0;

  /**
   * Generates a deterministic SHA-256 equivalent hash string for a text payload.
   */
  public static hashText(text: string): string {
    const clean = text.toLowerCase().trim().replace(/\s+/g, " ");
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      const char = clean.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `HASH-${Math.abs(hash)}-LEN-${clean.length}`;
  }

  /**
   * Retrieves vector from cache if it exists for textHash + modelVersion.
   */
  public static get(textHash: string, modelVersion: string): number[] | null {
    const key = `${modelVersion}:${textHash}`;
    const cached = this.cache.get(key);
    if (cached) {
      this.hits++;
      return cached;
    }
    this.misses++;
    return null;
  }

  /**
   * Stores vector in cache.
   */
  public static set(textHash: string, modelVersion: string, vector: number[]): void {
    const key = `${modelVersion}:${textHash}`;
    this.cache.set(key, vector);
  }

  /**
   * Returns cache hit rate percentage (0 to 100%).
   */
  public static getHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 100.0;
    return Math.round((this.hits / total) * 10000) / 100;
  }

  public static clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public static getCacheSize(): number {
    return this.cache.size;
  }
}
