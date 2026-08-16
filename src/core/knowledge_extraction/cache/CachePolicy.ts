export type EvictionStrategy = 'LRU' | 'FIFO' | 'TTL_ONLY';

export interface ICachePolicyData {
  readonly maxEntries: number;
  readonly ttlMs: number;
  readonly evictionStrategy: EvictionStrategy;
  readonly enabled: boolean;
}

export class CachePolicy implements ICachePolicyData {
  public readonly maxEntries: number;
  public readonly ttlMs: number;
  public readonly evictionStrategy: EvictionStrategy;
  public readonly enabled: boolean;

  constructor(data?: Partial<ICachePolicyData>) {
    this.maxEntries = data?.maxEntries ?? 1000;
    this.ttlMs = data?.ttlMs ?? 300000; // 5 minutes
    this.evictionStrategy = data?.evictionStrategy ?? 'LRU';
    this.enabled = data?.enabled ?? true;
    Object.freeze(this);
  }

  public static defaultPolicy(): CachePolicy {
    return new CachePolicy();
  }

  public toJSON(): ICachePolicyData {
    return {
      maxEntries: this.maxEntries,
      ttlMs: this.ttlMs,
      evictionStrategy: this.evictionStrategy,
      enabled: this.enabled
    };
  }
}
