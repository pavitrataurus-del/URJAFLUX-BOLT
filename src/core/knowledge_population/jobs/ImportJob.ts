import { ImportContext, IImportContextData } from '../orchestrator/ImportContext';
import { ImportResult, IImportResultData } from '../orchestrator/ImportResult';

export type JobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IImportJobData {
  readonly jobId: string;
  readonly bookId: string;
  readonly fileName: string;
  readonly status: JobStatus;
  readonly priority: JobPriority;
  readonly createdTime: number;
  readonly startedTime?: number;
  readonly finishedTime?: number;
  readonly retries: number;
  readonly maxRetries: number;
  readonly error?: string;
  readonly context?: IImportContextData;
  readonly result?: IImportResultData;
}

export class ImportJob implements IImportJobData {
  public readonly jobId: string;
  public readonly bookId: string;
  public readonly fileName: string;
  public readonly file: File | Uint8Array;
  public readonly status: JobStatus;
  public readonly priority: JobPriority;
  public readonly createdTime: number;
  public readonly startedTime?: number;
  public readonly finishedTime?: number;
  public readonly retries: number;
  public readonly maxRetries: number;
  public readonly error?: string;
  public readonly context?: ImportContext;
  public readonly result?: ImportResult;

  constructor(data: {
    jobId?: string;
    bookId: string;
    fileName: string;
    file: File | Uint8Array;
    status?: JobStatus;
    priority?: JobPriority;
    createdTime?: number;
    startedTime?: number;
    finishedTime?: number;
    retries?: number;
    maxRetries?: number;
    error?: string;
    context?: ImportContext;
    result?: ImportResult;
  }) {
    this.jobId = data.jobId || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.bookId = data.bookId;
    this.fileName = data.fileName;
    this.file = data.file;
    this.status = data.status || 'PENDING';
    this.priority = data.priority || 'MEDIUM';
    this.createdTime = data.createdTime ?? Date.now();
    this.startedTime = data.startedTime;
    this.finishedTime = data.finishedTime;
    this.retries = data.retries ?? 0;
    this.maxRetries = data.maxRetries ?? 3;
    this.error = data.error;
    this.context = data.context;
    this.result = data.result;
    Object.freeze(this);
  }

  public withStatus(status: JobStatus, error?: string): ImportJob {
    return new ImportJob({
      ...this,
      file: this.file,
      status,
      error: error !== undefined ? error : this.error,
      finishedTime: status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED' ? Date.now() : this.finishedTime
    });
  }

  public withStarted(): ImportJob {
    return new ImportJob({
      ...this,
      file: this.file,
      status: 'RUNNING',
      startedTime: Date.now()
    });
  }

  public withContext(context: ImportContext): ImportJob {
    return new ImportJob({
      ...this,
      file: this.file,
      context
    });
  }

  public withResult(result: ImportResult): ImportJob {
    return new ImportJob({
      ...this,
      file: this.file,
      status: result.success ? 'COMPLETED' : 'FAILED',
      finishedTime: Date.now(),
      result,
      error: result.errors.length > 0 ? result.errors[0] : this.error
    });
  }

  public withRetry(): ImportJob {
    return new ImportJob({
      ...this,
      file: this.file,
      status: 'PENDING',
      retries: this.retries + 1,
      startedTime: undefined,
      finishedTime: undefined
    });
  }

  public get priorityWeight(): number {
    switch (this.priority) {
      case 'CRITICAL':
        return 4;
      case 'HIGH':
        return 3;
      case 'MEDIUM':
        return 2;
      case 'LOW':
        return 1;
      default:
        return 0;
    }
  }

  public toJSON(): IImportJobData {
    return {
      jobId: this.jobId,
      bookId: this.bookId,
      fileName: this.fileName,
      status: this.status,
      priority: this.priority,
      createdTime: this.createdTime,
      startedTime: this.startedTime,
      finishedTime: this.finishedTime,
      retries: this.retries,
      maxRetries: this.maxRetries,
      error: this.error,
      context: this.context?.toJSON(),
      result: this.result?.toJSON()
    };
  }
}
