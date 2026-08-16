// ============================================================================
// EMBEDDING REPOSITORY & INDEX STORAGE (PHASE 3)
// Locks 39 (Indexes Only), 40 (Traceable Linkage), 41 (Retrieval Preserved)
// ============================================================================

import { 
  EmbeddingObject, 
  ReembeddingTargetType, 
  SemanticObjectType 
} from "../types/embeddingKnowledge";

export class EmbeddingRepository {
  private static repository: Map<string, EmbeddingObject> = new Map(); // embeddingId -> EmbeddingObject
  private static documentIndex: Map<string, Set<string>> = new Map(); // documentId -> Set of embeddingIds
  private static domainIndex: Map<string, Set<string>> = new Map(); // domain -> Set of embeddingIds
  private static semanticObjectIndex: Map<string, string> = new Map(); // semanticObjectId -> embeddingId

  /**
   * Saves or updates an EmbeddingObject in the repository.
   */
  public static saveEmbedding(embedding: EmbeddingObject): void {
    this.repository.set(embedding.id, embedding);

    // Document Indexing
    if (!this.documentIndex.has(embedding.documentId)) {
      this.documentIndex.set(embedding.documentId, new Set());
    }
    this.documentIndex.get(embedding.documentId)!.add(embedding.id);

    // Domain Indexing
    if (!this.domainIndex.has(embedding.knowledgeDomain)) {
      this.domainIndex.set(embedding.knowledgeDomain, new Set());
    }
    this.domainIndex.get(embedding.knowledgeDomain)!.add(embedding.id);

    // Semantic Object Indexing
    this.semanticObjectIndex.set(embedding.semanticObjectId, embedding.id);
  }

  public static getEmbeddingById(id: string): EmbeddingObject | undefined {
    return this.repository.get(id);
  }

  public static getEmbeddingBySemanticObjectId(semanticObjectId: string): EmbeddingObject | undefined {
    const id = this.semanticObjectIndex.get(semanticObjectId);
    return id ? this.repository.get(id) : undefined;
  }

  public static getEmbeddingsByDocument(documentId: string): EmbeddingObject[] {
    const ids = this.documentIndex.get(documentId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.repository.get(id)!).filter(Boolean);
  }

  public static getEmbeddingsByDomain(domain: string): EmbeddingObject[] {
    const ids = this.domainIndex.get(domain);
    if (!ids) return [];
    return Array.from(ids).map(id => this.repository.get(id)!).filter(Boolean);
  }

  public static getAllEmbeddings(): EmbeddingObject[] {
    return Array.from(this.repository.values());
  }

  /**
   * Deletes target embeddings for targeted re-embedding without rebuilding entire system.
   */
  public static deleteTargetEmbeddings(targetType: ReembeddingTargetType, targetId: string): number {
    let deletedCount = 0;

    if (targetType === "EVERYTHING") {
      deletedCount = this.repository.size;
      this.repository.clear();
      this.documentIndex.clear();
      this.domainIndex.clear();
      this.semanticObjectIndex.clear();
      return deletedCount;
    }

    if (targetType === "DOCUMENT") {
      const ids = this.documentIndex.get(targetId);
      if (ids) {
        for (const id of ids) {
          const emb = this.repository.get(id);
          if (emb) {
            this.semanticObjectIndex.delete(emb.semanticObjectId);
            this.repository.delete(id);
            deletedCount++;
          }
        }
        this.documentIndex.delete(targetId);
      }
    } else if (targetType === "DOMAIN") {
      const ids = this.domainIndex.get(targetId);
      if (ids) {
        for (const id of ids) {
          const emb = this.repository.get(id);
          if (emb) {
            this.semanticObjectIndex.delete(emb.semanticObjectId);
            this.repository.delete(id);
            deletedCount++;
          }
        }
        this.domainIndex.delete(targetId);
      }
    } else if (targetType === "SEMANTIC_OBJECT" || targetType === "CONCEPT") {
      const id = this.semanticObjectIndex.get(targetId);
      if (id) {
        const emb = this.repository.get(id);
        if (emb) {
          this.repository.delete(id);
          this.semanticObjectIndex.delete(targetId);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Model version distribution stats.
   */
  public static getModelVersionDistribution(): Record<string, number> {
    const dist: Record<string, number> = {};
    for (const emb of this.repository.values()) {
      dist[emb.embeddingModelVersion] = (dist[emb.embeddingModelVersion] || 0) + 1;
    }
    return dist;
  }

  public static getTotalCount(): number {
    return this.repository.size;
  }

  public static getAverageVectorSize(): number {
    if (this.repository.size === 0) return 0;
    let totalDim = 0;
    for (const emb of this.repository.values()) {
      totalDim += emb.vector.length;
    }
    return Math.round(totalDim / this.repository.size);
  }
}
