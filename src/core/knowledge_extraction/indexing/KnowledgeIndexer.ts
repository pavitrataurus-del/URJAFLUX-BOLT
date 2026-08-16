import { IndexDefinition } from './IndexDefinition';

export interface IIndexStats {
  readonly indexName: string;
  readonly totalKeys: number;
  readonly totalEntries: number;
}

export class KnowledgeIndexer {
  private readonly indexes = new Map<string, { definition: IndexDefinition; map: Map<string, Set<unknown>> }>();

  constructor(defaultDefinitions?: readonly IndexDefinition[]) {
    if (defaultDefinitions) {
      for (const def of defaultDefinitions) {
        this.addIndexDefinition(def);
      }
    } else {
      this.initDefaultIndexes();
    }
  }

  private initDefaultIndexes(): void {
    const defaults: IndexDefinition[] = [
      new IndexDefinition(
        { indexName: 'idx_knowledge_id', indexKey: 'knowledgeId', unique: true, indexedType: 'OBJECT' },
        (item) => (item as { knowledgeId?: string })?.knowledgeId || []
      ),
      new IndexDefinition(
        { indexName: 'idx_canonical_entity', indexKey: 'normalizedKey', unique: false, indexedType: 'ENTITY' },
        (item) => {
          const rec = item as { entity?: string; canonicalName?: string; normalizedKey?: string };
          return rec.normalizedKey || rec.entity || rec.canonicalName || [];
        }
      ),
      new IndexDefinition(
        { indexName: 'idx_category', indexKey: 'category', unique: false, indexedType: 'ALL' },
        (item) => (item as { category?: string })?.category || []
      ),
      new IndexDefinition(
        { indexName: 'idx_relationship_type', indexKey: 'relationshipType', unique: false, indexedType: 'RELATIONSHIP' },
        (item) => (item as { relationshipType?: string })?.relationshipType || []
      ),
      new IndexDefinition(
        { indexName: 'idx_document', indexKey: 'sourceDocumentId', unique: false, indexedType: 'ALL' },
        (item) => {
          const rec = item as { sourceDocumentId?: string; documentId?: string };
          return rec.sourceDocumentId || rec.documentId || [];
        }
      ),
      new IndexDefinition(
        { indexName: 'idx_version', indexKey: 'version', unique: false, indexedType: 'ALL' },
        (item) => (item as { version?: string })?.version || []
      ),
      new IndexDefinition(
        { indexName: 'idx_metadata_keys', indexKey: 'metadata', unique: false, indexedType: 'ALL' },
        (item) => {
          const meta = (item as { metadata?: Record<string, unknown> })?.metadata;
          return meta ? Object.keys(meta) : [];
        }
      )
    ];

    for (const def of defaults) {
      this.addIndexDefinition(def);
    }
  }

  public addIndexDefinition(definition: IndexDefinition): void {
    if (this.indexes.has(definition.indexName)) {
      this.indexes.delete(definition.indexName);
    }
    this.indexes.set(definition.indexName, {
      definition,
      map: new Map<string, Set<unknown>>()
    });
  }

  public removeIndexDefinition(indexName: string): boolean {
    return this.indexes.delete(indexName);
  }

  public indexItem(item: unknown): void {
    if (!item) return;
    for (const entry of this.indexes.values()) {
      const keys = entry.definition.keyExtractor(item);
      const keyList = Array.isArray(keys) ? keys : [keys];
      for (const k of keyList) {
        if (!k) continue;
        if (!entry.map.has(k)) {
          entry.map.set(k, new Set());
        }
        entry.map.get(k)!.add(item);
      }
    }
  }

  public indexBatch(items: readonly unknown[]): void {
    for (const item of items) {
      this.indexItem(item);
    }
  }

  public unindexItem(item: unknown): void {
    if (!item) return;
    for (const entry of this.indexes.values()) {
      const keys = entry.definition.keyExtractor(item);
      const keyList = Array.isArray(keys) ? keys : [keys];
      for (const k of keyList) {
        if (!k || !entry.map.has(k)) continue;
        const set = entry.map.get(k)!;
        set.delete(item);
        if (set.size === 0) {
          entry.map.delete(k);
        }
      }
    }
  }

  public lookup(indexName: string, key: string): readonly unknown[] {
    const entry = this.indexes.get(indexName);
    if (!entry) return [];
    const set = entry.map.get(key);
    if (!set) return [];
    return Object.freeze(Array.from(set));
  }

  public clear(): void {
    for (const entry of this.indexes.values()) {
      entry.map.clear();
    }
  }

  public getStats(): readonly IIndexStats[] {
    const stats: IIndexStats[] = [];
    for (const [name, entry] of this.indexes.entries()) {
      let entries = 0;
      for (const set of entry.map.values()) {
        entries += set.size;
      }
      stats.push({
        indexName: name,
        totalKeys: entry.map.size,
        totalEntries: entries
      });
    }
    return Object.freeze(stats);
  }
}
