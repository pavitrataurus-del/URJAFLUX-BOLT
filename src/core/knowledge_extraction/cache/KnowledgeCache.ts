import { CachePolicy } from './CachePolicy';
import { CacheEntry } from './CacheEntry';

export interface ICacheMetrics {
  readonly hits: number;
  readonly misses: number;
  readonly size: number;
  readonly evictions: number;
  readonly hitRatio: number;
}

export class KnowledgeCache<T = unknown> {
  private readonly map = new Map<string, CacheEntry<T>>();
  private policy: CachePolicy;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(policy?: CachePolicy) {
    this.policy = policy || CachePolicy.defaultPolicy();
  }

  public get(key: string): T | null {
    if (!this.policy.enabled) {
      this.misses++;
      return null;
    }

    const entry = this.map.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (entry.isExpired()) {
      this.map.delete(key);
      this.misses++;
      return null;
    }

    const updated = entry.touch();
    this.map.delete(key);
    this.map.set(key, updated);
    this.hits++;
    return updated.value;
  }

  public set(key: string, value: T, customTtlMs?: number): void {
    if (!this.policy.enabled) return;

    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.policy.maxEntries) {
      this.evict();
    }

    const ttl = customTtlMs ?? this.policy.ttlMs;
    const entry = new CacheEntry<T>(key, value, ttl);
    this.map.set(key, entry);
  }

  public has(key: string): boolean {
    if (!this.policy.enabled) return false;
    const entry = this.map.get(key);
    if (!entry) return false;
    if (entry.isExpired()) {
      this.map.delete(key);
      return false;
    }
    return true;
  }

  public invalidate(key: string): boolean {
    return this.map.delete(key);
  }

  public invalidatePattern(pattern: RegExp | string): number {
    let count = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of Array.from(this.map.keys())) {
      if (regex.test(key)) {
        this.map.delete(key);
        count++;
      }
    }
    return count;
  }

  public clear(): void {
    this.map.clear();
  }

  private evict(): void {
    if (this.map.size === 0) return;

    if (this.policy.evictionStrategy === 'LRU') {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey) {
        this.map.delete(oldestKey);
        this.evictions++;
      }
    } else {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey) {
        this.map.delete(oldestKey);
        this.evictions++;
      }
    }
  }

  public getMetrics(): ICacheMetrics {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.map.size,
      evictions: this.evictions,
      hitRatio: total > 0 ? this.hits / total : 0
    };
  }

  public getPolicy(): CachePolicy {
    return this.policy;
  }

  public updatePolicy(newPolicy: CachePolicy): void {
    this.policy = newPolicy;
  }
}
