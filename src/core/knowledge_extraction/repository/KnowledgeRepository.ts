import { IKnowledgeRepository } from './IKnowledgeRepository';
import { RepositoryQuery } from './RepositoryQuery';
import { RepositoryResult } from './RepositoryResult';
import { RepositoryMetrics } from './RepositoryMetrics';
import { RepositoryTransaction } from './RepositoryTransaction';

import { KnowledgeObject } from '../models/KnowledgeObject';
import { CanonicalEntity } from '../canonicalization/CanonicalEntity';
import { KnowledgeRelationship } from '../models/KnowledgeRelationship';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';
import { ValidatedKnowledgeResult } from '../validation/ValidatedKnowledgeResult';

export class KnowledgeRepository<T extends { readonly knowledgeId?: string; readonly entityId?: string; readonly relationshipId?: string; readonly evidenceId?: string; readonly version?: string; readonly category?: string; readonly metadata?: Record<string, unknown> }>
  implements IKnowledgeRepository<T>
{
  private readonly itemsMap = new Map<string, T>();
  private metrics = RepositoryMetrics.empty();

  public async save(item: T): Promise<void> {
    const startTime = Date.now();
    const id = this.extractId(item);
    if (!id) {
      throw new Error('Cannot save item without a valid primary identifier');
    }
    this.itemsMap.set(id, item);
    this.metrics = this.metrics.recordWrite(1).recordQuery(Date.now() - startTime);
  }

  public async saveBatch(items: readonly T[]): Promise<void> {
    const startTime = Date.now();
    for (const item of items) {
      const id = this.extractId(item);
      if (id) {
        this.itemsMap.set(id, item);
      }
    }
    this.metrics = this.metrics.recordWrite(items.length).recordQuery(Date.now() - startTime);
  }

  public async update(item: T): Promise<void> {
    const startTime = Date.now();
    const id = this.extractId(item);
    if (!id || !this.itemsMap.has(id)) {
      throw new Error(`Item with id '${id}' does not exist for update`);
    }
    this.itemsMap.set(id, item);
    this.metrics = this.metrics.recordUpdate().recordQuery(Date.now() - startTime);
  }

  public async delete(id: string): Promise<boolean> {
    const startTime = Date.now();
    const existed = this.itemsMap.delete(id);
    if (existed) {
      this.metrics = this.metrics.recordDelete().recordQuery(Date.now() - startTime);
    }
    return existed;
  }

  public async findById(id: string): Promise<T | null> {
    const startTime = Date.now();
    const item = this.itemsMap.get(id) || null;
    this.metrics = this.metrics.recordRead().recordQuery(Date.now() - startTime);
    return item;
  }

  public async findMany(ids: readonly string[]): Promise<readonly T[]> {
    const startTime = Date.now();
    const result: T[] = [];
    for (const id of ids) {
      const item = this.itemsMap.get(id);
      if (item) {
        result.push(item);
      }
    }
    this.metrics = this.metrics.recordRead().recordQuery(Date.now() - startTime);
    return Object.freeze(result);
  }

  public async exists(id: string): Promise<boolean> {
    const startTime = Date.now();
    const has = this.itemsMap.has(id);
    this.metrics = this.metrics.recordRead().recordQuery(Date.now() - startTime);
    return has;
  }

  public async count(query?: RepositoryQuery): Promise<number> {
    const startTime = Date.now();
    if (!query) {
      this.metrics = this.metrics.recordRead().recordQuery(Date.now() - startTime);
      return this.itemsMap.size;
    }
    const res = await this.query(query);
    return res.totalCount;
  }

  public async query(query: RepositoryQuery): Promise<RepositoryResult<T>> {
    const startTime = Date.now();
    let records = Array.from(this.itemsMap.values());

    const filters = query.filters;

    if (filters.id) {
      const ids = Array.isArray(filters.id) ? new Set(filters.id) : new Set([filters.id]);
      records = records.filter((item) => {
        const id = this.extractId(item);
        return id ? ids.has(id) : false;
      });
    }

    if (filters.category) {
      records = records.filter((item) => item.category === filters.category);
    }

    if (filters.entity) {
      records = records.filter((item) => (item as unknown as KnowledgeObject).entity === filters.entity);
    }

    if (filters.attribute) {
      records = records.filter((item) => (item as unknown as KnowledgeObject).attribute === filters.attribute);
    }

    if (filters.sourceDocumentId) {
      records = records.filter(
        (item) =>
          (item as unknown as KnowledgeObject).sourceDocumentId === filters.sourceDocumentId ||
          (item as unknown as KnowledgeEvidence).documentId === filters.sourceDocumentId
      );
    }

    if (filters.version) {
      records = records.filter((item) => item.version === filters.version);
    }

    if (filters.status) {
      records = records.filter((item) => (item as unknown as KnowledgeObject).status === filters.status);
    }

    if (filters.relationshipType) {
      records = records.filter(
        (item) => (item as unknown as KnowledgeRelationship).relationshipType === filters.relationshipType
      );
    }

    if (filters.confidenceMin !== undefined) {
      records = records.filter((item) => {
        const conf = (item as unknown as { confidence?: number }).confidence;
        return conf !== undefined && conf >= filters.confidenceMin!;
      });
    }

    if (filters.metadataFilters) {
      records = records.filter((item) => {
        if (!item.metadata) return false;
        return Object.entries(filters.metadataFilters!).every(
          ([k, v]) => item.metadata![k] === v
        );
      });
    }

    const totalCount = records.length;

    if (query.sort && query.sort.length > 0) {
      records.sort((a, b) => {
        for (const criterion of query.sort!) {
          const valA = (a as Record<string, unknown>)[criterion.field];
          const valB = (b as Record<string, unknown>)[criterion.field];
          if (valA !== valB) {
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;
            const comp = valA < valB ? -1 : 1;
            return criterion.direction === 'ASC' ? comp : -comp;
          }
        }
        return 0;
      });
    }

    if (query.offset !== undefined || query.limit !== undefined) {
      const offset = query.offset ?? 0;
      const limit = query.limit ?? records.length;
      records = records.slice(offset, offset + limit);
    }

    const duration = Date.now() - startTime;
    this.metrics = this.metrics.recordRead().recordQuery(duration);

    return RepositoryResult.success(records, duration, { totalCount });
  }

  public async findByVersion(version: string): Promise<readonly T[]> {
    const startTime = Date.now();
    const matches = Array.from(this.itemsMap.values()).filter((item) => item.version === version);
    this.metrics = this.metrics.recordRead().recordQuery(Date.now() - startTime);
    return Object.freeze(matches);
  }

  public async clear(): Promise<void> {
    const startTime = Date.now();
    this.itemsMap.clear();
    this.metrics = this.metrics.recordDelete().recordQuery(Date.now() - startTime);
  }

  public getMetrics(): RepositoryMetrics {
    return this.metrics;
  }

  private extractId(item: T): string | null {
    if (item.knowledgeId) return item.knowledgeId;
    if (item.entityId) return item.entityId;
    if (item.relationshipId) return item.relationshipId;
    if (item.evidenceId) return item.evidenceId;
    return null;
  }
}
