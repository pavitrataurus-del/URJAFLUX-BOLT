export interface IRepositoryMetricsData {
  readonly readCount: number;
  readonly writeCount: number;
  readonly updateCount: number;
  readonly deleteCount: number;
  readonly queryCount: number;
  readonly cacheHitCount: number;
  readonly cacheMissCount: number;
  readonly transactionCount: number;
  readonly totalExecutionTimeMs: number;
  readonly averageExecutionTimeMs: number;
}

export class RepositoryMetrics implements IRepositoryMetricsData {
  public readonly readCount: number;
  public readonly writeCount: number;
  public readonly updateCount: number;
  public readonly deleteCount: number;
  public readonly queryCount: number;
  public readonly cacheHitCount: number;
  public readonly cacheMissCount: number;
  public readonly transactionCount: number;
  public readonly totalExecutionTimeMs: number;
  public readonly averageExecutionTimeMs: number;

  constructor(data?: Partial<IRepositoryMetricsData>) {
    this.readCount = data?.readCount ?? 0;
    this.writeCount = data?.writeCount ?? 0;
    this.updateCount = data?.updateCount ?? 0;
    this.deleteCount = data?.deleteCount ?? 0;
    this.queryCount = data?.queryCount ?? 0;
    this.cacheHitCount = data?.cacheHitCount ?? 0;
    this.cacheMissCount = data?.cacheMissCount ?? 0;
    this.transactionCount = data?.transactionCount ?? 0;
    this.totalExecutionTimeMs = data?.totalExecutionTimeMs ?? 0;
    this.averageExecutionTimeMs =
      this.queryCount + this.readCount + this.writeCount > 0
        ? this.totalExecutionTimeMs / (this.queryCount + this.readCount + this.writeCount)
        : 0;
    Object.freeze(this);
  }

  public recordRead(): RepositoryMetrics {
    return new RepositoryMetrics({
      ...this.toJSON(),
      readCount: this.readCount + 1
    });
  }

  public recordWrite(count = 1): RepositoryMetrics {
    return new RepositoryMetrics({
      ...this.toJSON(),
      writeCount: this.writeCount + count
    });
  }

  public recordUpdate(): RepositoryMetrics {
    return new RepositoryMetrics({
      ...this.toJSON(),
      updateCount: this.updateCount + 1
    });
  }

  public recordDelete(): RepositoryMetrics {
    return new RepositoryMetrics({
      ...this.toJSON(),
      deleteCount: this.deleteCount + 1
    });
  }

  public recordQuery(executionTimeMs: number): RepositoryMetrics {
    const newQueryCount = this.queryCount + 1;
    const newTotalTime = this.totalExecutionTimeMs + executionTimeMs;
    return new RepositoryMetrics({
      ...this.toJSON(),
      queryCount: newQueryCount,
      totalExecutionTimeMs: newTotalTime
    });
  }

  public recordCacheHit(): RepositoryMetrics {
    return new RepositoryMetrics({
      ...this.toJSON(),
      cacheHitCount: this.cacheHitCount + 1
    });
  }

  public recordCacheMiss(): RepositoryMetrics {
    return new RepositoryMetrics({
      ...this.toJSON(),
      cacheMissCount: this.cacheMissCount + 1
    });
  }

  public recordTransaction(): RepositoryMetrics {
    return new RepositoryMetrics({
      ...this.toJSON(),
      transactionCount: this.transactionCount + 1
    });
  }

  public toJSON(): IRepositoryMetricsData {
    return {
      readCount: this.readCount,
      writeCount: this.writeCount,
      updateCount: this.updateCount,
      deleteCount: this.deleteCount,
      queryCount: this.queryCount,
      cacheHitCount: this.cacheHitCount,
      cacheMissCount: this.cacheMissCount,
      transactionCount: this.transactionCount,
      totalExecutionTimeMs: this.totalExecutionTimeMs,
      averageExecutionTimeMs: this.averageExecutionTimeMs
    };
  }

  public static empty(): RepositoryMetrics {
    return new RepositoryMetrics();
  }
}
