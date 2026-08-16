import { KnowledgeSource } from '../models/KnowledgeSource';
import { KnowledgeSourceMetadata } from '../models/KnowledgeSourceMetadata';
import { KnowledgeSourceSearch, ISearchQueryOptions, ISearchResultData } from './KnowledgeSourceSearch';

export class KnowledgeSourceRegistry {
  private static instance: KnowledgeSourceRegistry | null = null;
  private readonly sourcesMap = new Map<string, KnowledgeSource>();
  private readonly versionHistoryMap = new Map<string, KnowledgeSource[]>();

  private constructor() {}

  public static getInstance(): KnowledgeSourceRegistry {
    if (!KnowledgeSourceRegistry.instance) {
      KnowledgeSourceRegistry.instance = new KnowledgeSourceRegistry();
    }
    return KnowledgeSourceRegistry.instance;
  }

  public registerSource(source: KnowledgeSource): void {
    this.sourcesMap.set(source.sourceId, source);

    const history = this.versionHistoryMap.get(source.sourceId) || [];
    this.versionHistoryMap.set(source.sourceId, [...history, source]);
  }

  public removeSource(sourceId: string): boolean {
    const existed = this.sourcesMap.has(sourceId);
    this.sourcesMap.delete(sourceId);
    this.versionHistoryMap.delete(sourceId);
    return existed;
  }

  public getSourceById(sourceId: string): KnowledgeSource | null {
    return this.sourcesMap.get(sourceId) || null;
  }

  public getSourceByChecksum(checksum: string): KnowledgeSource | null {
    for (const source of this.sourcesMap.values()) {
      if (source.checksum === checksum) {
        return source;
      }
    }
    return null;
  }

  public updateMetadata(sourceId: string, metadata: KnowledgeSourceMetadata): KnowledgeSource | null {
    const existing = this.getSourceById(sourceId);
    if (!existing) return null;

    const updated = existing.withMetadata(metadata);
    this.registerSource(updated);
    return updated;
  }

  public getVersionHistory(sourceId: string): readonly KnowledgeSource[] {
    return Object.freeze([...(this.versionHistoryMap.get(sourceId) || [])]);
  }

  public getAllSources(): readonly KnowledgeSource[] {
    return Object.freeze(Array.from(this.sourcesMap.values()));
  }

  public search(options?: ISearchQueryOptions): ISearchResultData {
    return KnowledgeSourceSearch.search(this.getAllSources(), options);
  }

  public count(): number {
    return this.sourcesMap.size;
  }

  public clear(): void {
    this.sourcesMap.clear();
    this.versionHistoryMap.clear();
  }
}

export const knowledgeSourceRegistry = KnowledgeSourceRegistry.getInstance();
