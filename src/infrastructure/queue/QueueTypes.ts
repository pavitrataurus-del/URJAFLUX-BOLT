import { RetryPolicy } from "../error/ErrorTypes";

export enum JobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface IJobContext {
  tenantId?: string;
  correlationId?: string;
  [key: string]: any;
}

export interface IJob<T = any> {
  id: string;
  type: string;
  payload: T;
  status: JobStatus;
  priority: number;
  retryPolicy: RetryPolicy;
  maxRetries: number;
  attemptCount: number;
  context: IJobContext;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: Error;
}

export interface IQueueProvider {
  enqueue<T>(job: Omit<IJob<T>, "id" | "status" | "attemptCount" | "createdAt">): Promise<string>;
  dequeue(queueName: string): Promise<IJob | null>;
  completeJob(jobId: string): Promise<void>;
  failJob(jobId: string, error: Error): Promise<void>;
  cancelJob(jobId: string): Promise<void>;
  getJob(jobId: string): Promise<IJob | null>;
}
