import { ValidatedKnowledgeResult } from '../validation/ValidatedKnowledgeResult';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { CanonicalEntity } from '../canonicalization/CanonicalEntity';
import { KnowledgeRelationship } from '../models/KnowledgeRelationship';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';

import { KnowledgeRepository } from '../repository/KnowledgeRepository';
import { RepositoryQuery } from '../repository/RepositoryQuery';
import { RepositoryResult } from '../repository/RepositoryResult';
import { RepositoryMetrics } from '../repository/RepositoryMetrics';
import { RepositoryTransaction, IsolationLevel } from '../repository/RepositoryTransaction';

import { IndexManager } from '../indexing/IndexManager';
import { KnowledgeCache } from '../cache/KnowledgeCache';

export class KnowledgeRepositoryService {
  private static instance: KnowledgeRepositoryService | null = null;

  private readonly objectRepo = new KnowledgeRepository<KnowledgeObject>();
  private readonly entityRepo = new KnowledgeRepository<CanonicalEntity>();
  private readonly relationshipRepo = new KnowledgeRepository<KnowledgeRelationship>();
  private readonly evidenceRepo = new KnowledgeRepository<KnowledgeEvidence>();

  private readonly indexManager = new IndexManager();
  private readonly cache = new KnowledgeCache<unknown>();
  private readonly activeTransactions = new Map<string, RepositoryTransaction>();

  private serviceMetrics = RepositoryMetrics.empty();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): KnowledgeRepositoryService {
    if (!KnowledgeRepositoryService.instance) {
      KnowledgeRepositoryService.instance = new KnowledgeRepositoryService();
    }
    return KnowledgeRepositoryService.instance;
  }

  public static resetInstance(): void {
    KnowledgeRepositoryService.instance = null;
  }

  public async persistValidatedResult(
    result: ValidatedKnowledgeResult
  ): Promise<RepositoryResult<boolean>> {
    const startTime = Date.now();
    try {
      if (!result) {
        return RepositoryResult.failure<boolean>(
          ['Cannot persist null or undefined ValidatedKnowledgeResult'],
          Date.now() - startTime
        );
      }

      await this.objectRepo.saveBatch(result.validatedObjects);
      await this.entityRepo.saveBatch(result.canonicalEntities);

      // Index persisted entities and objects
      for (const obj of result.validatedObjects) {
        this.indexManager.getIndexer().indexItem(obj);
        this.cache.set(`obj_${obj.knowledgeId}`, obj);
      }

      for (const entity of result.canonicalEntities) {
        this.indexManager.getIndexer().indexItem(entity);
        this.cache.set(`ent_${entity.entityId}`, entity);
      }

      const duration = Date.now() - startTime;
      this.serviceMetrics = this.serviceMetrics
        .recordWrite(result.validatedObjects.length + result.canonicalEntities.length)
        .recordQuery(duration);

      return RepositoryResult.success([true], duration, {
        totalCount: 1,
        warnings: result.warnings
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      return RepositoryResult.failure<boolean>([errorMsg], duration);
    }
  }

  public async queryObjects(query: RepositoryQuery): Promise<RepositoryResult<KnowledgeObject>> {
    const cacheKey = `query_obj_${JSON.stringify(query.toJSON())}`;
    const cached = this.cache.get(cacheKey) as RepositoryResult<KnowledgeObject> | null;
    if (cached) {
      this.serviceMetrics = this.serviceMetrics.recordCacheHit();
      return cached;
    }

    this.serviceMetrics = this.serviceMetrics.recordCacheMiss();
    const result = await this.objectRepo.query(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  public async queryEntities(query: RepositoryQuery): Promise<RepositoryResult<CanonicalEntity>> {
    const cacheKey = `query_ent_${JSON.stringify(query.toJSON())}`;
    const cached = this.cache.get(cacheKey) as RepositoryResult<CanonicalEntity> | null;
    if (cached) {
      this.serviceMetrics = this.serviceMetrics.recordCacheHit();
      return cached;
    }

    this.serviceMetrics = this.serviceMetrics.recordCacheMiss();
    const result = await this.entityRepo.query(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  public async queryRelationships(query: RepositoryQuery): Promise<RepositoryResult<KnowledgeRelationship>> {
    const cacheKey = `query_rel_${JSON.stringify(query.toJSON())}`;
    const cached = this.cache.get(cacheKey) as RepositoryResult<KnowledgeRelationship> | null;
    if (cached) {
      this.serviceMetrics = this.serviceMetrics.recordCacheHit();
      return cached;
    }

    this.serviceMetrics = this.serviceMetrics.recordCacheMiss();
    const result = await this.relationshipRepo.query(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  public async queryEvidence(query: RepositoryQuery): Promise<RepositoryResult<KnowledgeEvidence>> {
    const cacheKey = `query_evi_${JSON.stringify(query.toJSON())}`;
    const cached = this.cache.get(cacheKey) as RepositoryResult<KnowledgeEvidence> | null;
    if (cached) {
      this.serviceMetrics = this.serviceMetrics.recordCacheHit();
      return cached;
    }

    this.serviceMetrics = this.serviceMetrics.recordCacheMiss();
    const result = await this.evidenceRepo.query(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  public async beginTransaction(isolationLevel: IsolationLevel = 'READ_COMMITTED'): Promise<RepositoryTransaction> {
    const tx = new RepositoryTransaction(isolationLevel);
    this.activeTransactions.set(tx.transactionId, tx);
    this.serviceMetrics = this.serviceMetrics.recordTransaction();
    return tx;
  }

  public async commitTransaction(tx: RepositoryTransaction): Promise<void> {
    const existing = this.activeTransactions.get(tx.transactionId);
    if (!existing) {
      throw new Error(`Transaction '${tx.transactionId}' not found or already closed`);
    }
    tx.commit();
    this.activeTransactions.delete(tx.transactionId);
    this.cache.clear(); // Invalidate cache on commit
  }

  public async rollbackTransaction(tx: RepositoryTransaction): Promise<void> {
    const existing = this.activeTransactions.get(tx.transactionId);
    if (!existing) {
      throw new Error(`Transaction '${tx.transactionId}' not found or already closed`);
    }
    tx.rollback();
    this.activeTransactions.delete(tx.transactionId);
  }

  public getMetrics(): RepositoryMetrics {
    const cacheMetrics = this.cache.getMetrics();
    const repoMetrics = this.objectRepo.getMetrics();
    return new RepositoryMetrics({
      readCount: repoMetrics.readCount,
      writeCount: repoMetrics.writeCount,
      updateCount: repoMetrics.updateCount,
      deleteCount: repoMetrics.deleteCount,
      queryCount: repoMetrics.queryCount,
      cacheHitCount: cacheMetrics.hits,
      cacheMissCount: cacheMetrics.misses,
      transactionCount: this.serviceMetrics.transactionCount,
      totalExecutionTimeMs: repoMetrics.totalExecutionTimeMs,
      averageExecutionTimeMs: repoMetrics.averageExecutionTimeMs
    });
  }

  public getIndexManager(): IndexManager {
    return this.indexManager;
  }

  public getCache(): KnowledgeCache<unknown> {
    return this.cache;
  }

  public async clearAll(): Promise<void> {
    await this.objectRepo.clear();
    await this.entityRepo.clear();
    await this.relationshipRepo.clear();
    await this.evidenceRepo.clear();
    this.indexManager.getIndexer().clear();
    this.cache.clear();
    this.activeTransactions.clear();
  }
}
