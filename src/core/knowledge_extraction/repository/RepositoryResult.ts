export interface IRepositoryResultData<T> {
  readonly records: readonly T[];
  readonly totalCount: number;
  readonly executionTimeMs: number;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

export class RepositoryResult<T> implements IRepositoryResultData<T> {
  public readonly records: readonly T[];
  public readonly totalCount: number;
  public readonly executionTimeMs: number;
  public readonly warnings: readonly string[];
  public readonly errors: readonly string[];
  public readonly metadata: Record<string, unknown>;

  constructor(data: IRepositoryResultData<T>) {
    this.records = Object.freeze([...data.records]);
    this.totalCount = data.totalCount;
    this.executionTimeMs = data.executionTimeMs;
    this.warnings = Object.freeze([...(data.warnings || [])]);
    this.errors = Object.freeze([...(data.errors || [])]);
    this.metadata = Object.freeze({ ...(data.metadata || {}) });
    Object.freeze(this);
  }

  public get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  public get hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  public static success<U>(
    records: readonly U[],
    executionTimeMs: number,
    options?: {
      totalCount?: number;
      warnings?: readonly string[];
      metadata?: Record<string, unknown>;
    }
  ): RepositoryResult<U> {
    return new RepositoryResult<U>({
      records,
      totalCount: options?.totalCount ?? records.length,
      executionTimeMs,
      warnings: options?.warnings ?? [],
      errors: [],
      metadata: options?.metadata
    });
  }

  public static failure<U>(
    errors: readonly string[],
    executionTimeMs: number,
    options?: {
      warnings?: readonly string[];
      metadata?: Record<string, unknown>;
    }
  ): RepositoryResult<U> {
    return new RepositoryResult<U>({
      records: [],
      totalCount: 0,
      executionTimeMs,
      warnings: options?.warnings ?? [],
      errors,
      metadata: options?.metadata
    });
  }

  public toJSON(): IRepositoryResultData<T> {
    return {
      records: this.records,
      totalCount: this.totalCount,
      executionTimeMs: this.executionTimeMs,
      warnings: this.warnings,
      errors: this.errors,
      metadata: this.metadata
    };
  }
}
