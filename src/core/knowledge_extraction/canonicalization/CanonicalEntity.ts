export interface ICanonicalEntityData {
  readonly entityId: string;
  readonly canonicalName: string;
  readonly displayName: string;
  readonly aliases: readonly string[];
  readonly normalizedKey: string;
  readonly category: string;
  readonly version: string;
  readonly metadata: Record<string, unknown>;
}

export class CanonicalEntity implements ICanonicalEntityData {
  public readonly entityId: string;
  public readonly canonicalName: string;
  public readonly displayName: string;
  public readonly aliases: readonly string[];
  public readonly normalizedKey: string;
  public readonly category: string;
  public readonly version: string;
  public readonly metadata: Record<string, unknown>;

  constructor(data: ICanonicalEntityData) {
    this.entityId = data.entityId;
    this.canonicalName = data.canonicalName;
    this.displayName = data.displayName;
    this.aliases = Object.freeze([...data.aliases]);
    this.normalizedKey = data.normalizedKey;
    this.category = data.category;
    this.version = data.version;
    this.metadata = Object.freeze({ ...data.metadata });
    Object.freeze(this);
  }

  public static normalizeKey(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  public static create(
    entityId: string,
    canonicalName: string,
    options?: {
      displayName?: string;
      aliases?: string[];
      category?: string;
      version?: string;
      metadata?: Record<string, unknown>;
    }
  ): CanonicalEntity {
    const normKey = CanonicalEntity.normalizeKey(canonicalName);
    return new CanonicalEntity({
      entityId,
      canonicalName,
      displayName: options?.displayName || canonicalName,
      aliases: options?.aliases || [],
      normalizedKey: normKey,
      category: options?.category || 'GENERAL',
      version: options?.version || '1.0.0',
      metadata: options?.metadata || {}
    });
  }

  public matchesAlias(term: string): boolean {
    if (!term) return false;
    const norm = CanonicalEntity.normalizeKey(term);
    if (norm === this.normalizedKey) return true;
    return this.aliases.some((alias) => CanonicalEntity.normalizeKey(alias) === norm);
  }

  public toJSON(): ICanonicalEntityData {
    return {
      entityId: this.entityId,
      canonicalName: this.canonicalName,
      displayName: this.displayName,
      aliases: this.aliases,
      normalizedKey: this.normalizedKey,
      category: this.category,
      version: this.version,
      metadata: this.metadata
    };
  }
}
