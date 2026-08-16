import { IJob } from "../queue/QueueTypes";

export enum WorkerStatus {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  STOPPING = "STOPPING",
  STOPPED = "STOPPED",
  ERROR = "ERROR",
}

export interface IWorkerConfig {
  id: string;
  type: string;
  concurrency: number;
  pollIntervalMs: number;
}

export interface IWorker {
  id: string;
  type: string;
  status: WorkerStatus;
  start(): Promise<void>;
  stop(): Promise<void>;
  processJob(job: IJob): Promise<void>;
}
