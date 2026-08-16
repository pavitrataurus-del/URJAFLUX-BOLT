export type IndexedEntityType = 'OBJECT' | 'ENTITY' | 'RELATIONSHIP' | 'EVIDENCE' | 'ALL';

export interface IIndexDefinitionData {
  readonly indexName: string;
  readonly indexKey: string;
  readonly unique: boolean;
  readonly indexedType: IndexedEntityType;
  readonly description?: string;
}

export class IndexDefinition implements IIndexDefinitionData {
  public readonly indexName: string;
  public readonly indexKey: string;
  public readonly unique: boolean;
  public readonly indexedType: IndexedEntityType;
  public readonly description?: string;
  public readonly keyExtractor: (item: unknown) => string | readonly string[];

  constructor(
    data: IIndexDefinitionData,
    keyExtractor?: (item: unknown) => string | readonly string[]
  ) {
    this.indexName = data.indexName;
    this.indexKey = data.indexKey;
    this.unique = data.unique;
    this.indexedType = data.indexedType;
    this.description = data.description;
    this.keyExtractor = keyExtractor || this.defaultExtractor(data.indexKey);
    Object.freeze(this);
  }

  private defaultExtractor(key: string): (item: unknown) => string | readonly string[] {
    return (item: unknown) => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      const val = record[key];
      if (val === undefined || val === null) return [];
      if (Array.isArray(val)) return val.map(String);
      if (typeof val === 'object') return Object.keys(val);
      return String(val);
    };
  }

  public toJSON(): IIndexDefinitionData {
    return {
      indexName: this.indexName,
      indexKey: this.indexKey,
      unique: this.unique,
      indexedType: this.indexedType,
      description: this.description
    };
  }
}
