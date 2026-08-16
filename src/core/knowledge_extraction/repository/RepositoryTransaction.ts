export type TransactionStatus = 'ACTIVE' | 'COMMITTED' | 'ROLLED_BACK';
export type IsolationLevel = 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';

export type TransactionOperationType = 'SAVE' | 'UPDATE' | 'DELETE' | 'SAVE_BATCH';

export interface ITransactionOperation {
  readonly type: TransactionOperationType;
  readonly entityType: string;
  readonly entityId: string;
  readonly payload?: unknown;
  readonly timestamp: number;
}

export interface IRepositoryTransactionData {
  readonly transactionId: string;
  readonly status: TransactionStatus;
  readonly isolationLevel: IsolationLevel;
  readonly startTime: number;
  readonly endTime?: number;
  readonly operations: readonly ITransactionOperation[];
}

export class RepositoryTransaction {
  private readonly _transactionId: string;
  private _status: TransactionStatus;
  private readonly _isolationLevel: IsolationLevel;
  private readonly _startTime: number;
  private _endTime?: number;
  private readonly _operations: ITransactionOperation[] = [];

  constructor(isolationLevel: IsolationLevel = 'READ_COMMITTED') {
    this._transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this._status = 'ACTIVE';
    this._isolationLevel = isolationLevel;
    this._startTime = Date.now();
  }

  public get transactionId(): string {
    return this._transactionId;
  }

  public get status(): TransactionStatus {
    return this._status;
  }

  public get isolationLevel(): IsolationLevel {
    return this._isolationLevel;
  }

  public get startTime(): number {
    return this._startTime;
  }

  public get endTime(): number | undefined {
    return this._endTime;
  }

  public get operations(): readonly ITransactionOperation[] {
    return Object.freeze([...this._operations]);
  }

  public get executionTimeMs(): number {
    return (this._endTime || Date.now()) - this._startTime;
  }

  public addOperation(operation: Omit<ITransactionOperation, 'timestamp'>): void {
    if (this._status !== 'ACTIVE') {
      throw new Error(`Cannot add operation to transaction ${this._transactionId} with status ${this._status}`);
    }
    this._operations.push({
      ...operation,
      timestamp: Date.now()
    });
  }

  public commit(): void {
    if (this._status !== 'ACTIVE') {
      throw new Error(`Cannot commit transaction ${this._transactionId} with status ${this._status}`);
    }
    this._status = 'COMMITTED';
    this._endTime = Date.now();
  }

  public rollback(): void {
    if (this._status !== 'ACTIVE') {
      throw new Error(`Cannot rollback transaction ${this._transactionId} with status ${this._status}`);
    }
    this._status = 'ROLLED_BACK';
    this._endTime = Date.now();
  }

  public toJSON(): IRepositoryTransactionData {
    return {
      transactionId: this._transactionId,
      status: this._status,
      isolationLevel: this._isolationLevel,
      startTime: this._startTime,
      endTime: this._endTime,
      operations: this.operations
    };
  }
}
