import { IndexDefinition } from './IndexDefinition';
import { KnowledgeIndexer, IIndexStats } from './KnowledgeIndexer';

export class IndexManager {
  private readonly indexer: KnowledgeIndexer;
  private readonly definitions = new Map<string, IndexDefinition>();

  constructor(indexer?: KnowledgeIndexer) {
    this.indexer = indexer || new KnowledgeIndexer();
  }

  public registerIndex(definition: IndexDefinition): void {
    this.definitions.set(definition.indexName, definition);
    this.indexer.addIndexDefinition(definition);
  }

  public removeIndex(indexName: string): boolean {
    this.definitions.delete(indexName);
    return this.indexer.removeIndexDefinition(indexName);
  }

  public rebuildIndex(indexName: string, items: readonly unknown[]): void {
    const def = this.definitions.get(indexName);
    if (!def) {
      throw new Error(`Cannot rebuild unregistered index '${indexName}'`);
    }
    this.indexer.addIndexDefinition(def);
    for (const item of items) {
      this.indexer.indexItem(item);
    }
  }

  public refreshIndexes(itemsMap: readonly unknown[]): void {
    this.indexer.clear();
    this.indexer.indexBatch(itemsMap);
  }

  public getIndexMetadata(): readonly IndexDefinition[] {
    return Object.freeze(Array.from(this.definitions.values()));
  }

  public getIndexStats(): readonly IIndexStats[] {
    return this.indexer.getStats();
  }

  public getIndexer(): KnowledgeIndexer {
    return this.indexer;
  }
}
