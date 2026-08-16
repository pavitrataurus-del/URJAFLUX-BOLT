import { CanonicalEntity } from './CanonicalEntity';

export interface IAliasDictionaryConfig {
  readonly mappings?: Record<string, string>;
  readonly caseSensitive?: boolean;
}

export class AliasDictionary {
  private readonly mappings: Map<string, string> = new Map();
  private readonly caseSensitive: boolean;

  constructor(config?: IAliasDictionaryConfig) {
    this.caseSensitive = config?.caseSensitive ?? false;
    
    // Default configurable entries (can be overridden or cleared)
    const initialMappings: Record<string, string> = config?.mappings || {
      'Kitchen': 'Cooking Area',
      'Rasoi': 'Kitchen',
      'Toilet': 'Washroom',
      'WC': 'Toilet'
    };

    this.registerMappings(initialMappings);
  }

  private normalizeTerm(term: string): string {
    if (!term) return '';
    const trimmed = term.trim();
    return this.caseSensitive ? trimmed : trimmed.toLowerCase();
  }

  public registerAlias(alias: string, canonicalName: string): void {
    if (!alias || !canonicalName) return;
    const key = this.normalizeTerm(alias);
    const target = canonicalName.trim();
    this.mappings.set(key, target);
  }

  public registerMappings(mappings: Record<string, string>): void {
    for (const [alias, canonical] of Object.entries(mappings)) {
      this.registerAlias(alias, canonical);
    }
  }

  public getCanonicalName(term: string): string {
    if (!term) return '';
    const key = this.normalizeTerm(term);
    const mapped = this.mappings.get(key);
    if (!mapped) {
      return term.trim();
    }
    // Resolve transitive aliases safely without infinite loops (max depth 5)
    let depth = 0;
    let currentKey = key;
    let currentVal = mapped;

    while (depth < 5) {
      const nextKey = this.normalizeTerm(currentVal);
      const nextVal = this.mappings.get(nextKey);
      if (!nextVal || nextKey === currentKey) {
        break;
      }
      currentVal = nextVal;
      currentKey = nextKey;
      depth++;
    }

    return currentVal;
  }

  public resolveEntityCanonicalName(rawEntityName: string): string {
    return this.getCanonicalName(rawEntityName);
  }

  public hasAlias(alias: string): boolean {
    const key = this.normalizeTerm(alias);
    return this.mappings.has(key);
  }

  public removeAlias(alias: string): boolean {
    const key = this.normalizeTerm(alias);
    return this.mappings.delete(key);
  }

  public clear(): void {
    this.mappings.clear();
  }

  public getMappingsCount(): number {
    return this.mappings.size;
  }

  public toJSON(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, val] of this.mappings.entries()) {
      result[key] = val;
    }
    return result;
  }
}
