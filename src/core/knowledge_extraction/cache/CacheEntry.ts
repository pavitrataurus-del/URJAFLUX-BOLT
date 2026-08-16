export interface ICacheEntryData<T> {
  readonly key: string;
  readonly value: T;
  readonly createdAt: number;
  readonly lastAccessedAt: number;
  readonly accessCount: number;
  readonly ttlMs: number;
}

export class CacheEntry<T> implements ICacheEntryData<T> {
  public readonly key: string;
  public readonly value: T;
  public readonly createdAt: number;
  public readonly lastAccessedAt: number;
  public readonly accessCount: number;
  public readonly ttlMs: number;

  constructor(
    key: string,
    value: T,
    ttlMs: number,
    createdAt?: number,
    lastAccessedAt?: number,
    accessCount?: number
  ) {
    this.key = key;
    this.value = value;
    this.ttlMs = ttlMs;
    this.createdAt = createdAt ?? Date.now();
    this.lastAccessedAt = lastAccessedAt ?? this.createdAt;
    this.accessCount = accessCount ?? 0;
    Object.freeze(this);
  }

  public isExpired(now = Date.now()): boolean {
    if (this.ttlMs <= 0) return false;
    return now - this.createdAt > this.ttlMs;
  }

  public touch(): CacheEntry<T> {
    return new CacheEntry<T>(
      this.key,
      this.value,
      this.ttlMs,
      this.createdAt,
      Date.now(),
      this.accessCount + 1
    );
  }

  public toJSON(): ICacheEntryData<T> {
    return {
      key: this.key,
      value: this.value,
      createdAt: this.createdAt,
      lastAccessedAt: this.lastAccessedAt,
      accessCount: this.accessCount,
      ttlMs: this.ttlMs
    };
  }
}
