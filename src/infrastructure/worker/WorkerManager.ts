import { IWorker, WorkerStatus, IWorkerConfig } from "./WorkerTypes";
import { Logger } from "../logging/Logger";

export class WorkerManager {
  private static instance: WorkerManager;
  private workers: Map<string, IWorker> = new Map();

  private constructor() {}

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  public registerWorker(worker: IWorker): void {
    if (this.workers.has(worker.id)) {
      throw new Error(`Worker ${worker.id} is already registered.`);
    }
    this.workers.set(worker.id, worker);
    Logger.getInstance().info(`Registered worker: ${worker.id} of type ${worker.type}`);
  }

  public getWorker(id: string): IWorker | undefined {
    return this.workers.get(id);
  }

  public async startAll(): Promise<void> {
    const logger = Logger.getInstance();
    logger.info("Starting all workers...");
    const promises = Array.from(this.workers.values()).map(worker => worker.start());
    await Promise.all(promises);
    logger.info("All workers started.");
  }

  public async stopAll(): Promise<void> {
    const logger = Logger.getInstance();
    logger.info("Stopping all workers...");
    const promises = Array.from(this.workers.values()).map(worker => worker.stop());
    await Promise.all(promises);
    logger.info("All workers stopped.");
  }
}
