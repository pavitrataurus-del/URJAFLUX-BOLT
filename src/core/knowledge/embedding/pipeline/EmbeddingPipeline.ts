import { ISemanticChunk, IEmbeddingRecord, IEmbeddingConfig } from "../models/EmbeddingModels";
import { EmbeddingProviderFactory } from "../providers/EmbeddingProviderFactory";
import { VectorStoreFactory } from "../storage/VectorStoreFactory";
import { EmbeddingValidationEngine } from "../validation/EmbeddingValidationEngine";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { EmbeddingEventType, createEmbeddingEvent } from "../events/EmbeddingEvents";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export enum EmbeddingJobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export interface IEmbeddingJob {
  id: string;
  documentId: string;
  status: EmbeddingJobStatus;
  progress: number; // 0-100
  chunksProcessed: number;
  totalChunks: number;
  config: IEmbeddingConfig;
  error?: string;
  storeId?: string;
}



export class EmbeddingPipeline {
  private static instance: EmbeddingPipeline;
  private jobs: Map<string, IEmbeddingJob> = new Map();

  private constructor() {}

  public static getInstance(): EmbeddingPipeline {
    if (!EmbeddingPipeline.instance) {
      EmbeddingPipeline.instance = new EmbeddingPipeline();
    }
    return EmbeddingPipeline.instance;
  }

  public async startEmbeddingJob(documentId: string, chunks: ISemanticChunk[], config: any = {}, storeId?: string): Promise<string> {
    const jobId = `emb_${documentId}_${Date.now()}`;
    const job: IEmbeddingJob = {
      id: jobId,
      documentId,
      status: EmbeddingJobStatus.PENDING,
      progress: 0,
      chunksProcessed: 0,
      totalChunks: chunks.length,
      config,
      storeId
    };
    
    this.jobs.set(jobId, job);
    EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.EMBEDDING_STARTED, { jobId, documentId, totalChunks: chunks.length }));

    this.processJob(job, chunks).catch(e => {
      console.error(`Embedding Job ${jobId} failed:`, e);
    });

    return jobId;
  }

  private async processJob(job: IEmbeddingJob, chunks: ISemanticChunk[]): Promise<void> {
    job.status = EmbeddingJobStatus.PROCESSING;
    const provider = EmbeddingProviderFactory.getInstance().getProvider(job.config.providerId);
    const store = VectorStoreFactory.getInstance().getStore(job.storeId);
    const validator = EmbeddingValidationEngine.getInstance();
    const expectedDimensions = provider.getDimensions();
    
    // Set version if not provided
    const version = job.config.version || "1.0";

    try {
      const recordsToStore: IEmbeddingRecord[] = [];
      const batchSize = 100;

      for (let i = job.chunksProcessed; i < chunks.length; i++) {
        // @ts-ignore
          if (job.status === EmbeddingJobStatus.CANCELLED) return;
        // @ts-ignore
          while (job.status === EmbeddingJobStatus.PAUSED) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          // @ts-ignore
          if (job.status === EmbeddingJobStatus.CANCELLED) return;
        }

        const chunk = chunks[i];
        
        // 1. Validate chunk
        chunk.embeddingVersion = version;
        validator.validateChunk(chunk);

        // 2. Generate embedding
        const vector = await provider.generateEmbedding(chunk.normalizedText, job.config);
        
        // 3. Attach metadata
        vector.id = chunk.id;
        EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.EMBEDDING_GENERATED, { chunkId: chunk.id, documentId: job.documentId }));

        // 4. Validate vector
        const record: IEmbeddingRecord = { semanticChunk: chunk, embedding: vector };
        validator.validateRecord(record, expectedDimensions);

        recordsToStore.push(record);

        // 5. Batch store
        if (recordsToStore.length >= batchSize || i === chunks.length - 1) {
           await store.storeBatch(recordsToStore);
           EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.EMBEDDING_STORED, { 
             documentId: job.documentId, 
             count: recordsToStore.length 
           }));
           recordsToStore.length = 0; // clear array
        }

        job.chunksProcessed++;
        job.progress = Math.floor((job.chunksProcessed / job.totalChunks) * 100);
      }
      
      job.status = EmbeddingJobStatus.COMPLETED;
      EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.SEMANTIC_INDEX_UPDATED, { 
        action: "ADD_DOCUMENT",
        documentId: job.documentId 
      }));

    } catch (error: any) {
      job.status = EmbeddingJobStatus.FAILED;
      job.error = error.message;
      EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.EMBEDDING_FAILED, { 
        jobId: job.id, 
        documentId: job.documentId, 
        error: error.message 
      }));
    }
  }

  public getJob(jobId: string): IEmbeddingJob | undefined {
    return this.jobs.get(jobId);
  }
  
  public listJobs(): IEmbeddingJob[] {
    return Array.from(this.jobs.values());
  }

  public cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && (job.status === EmbeddingJobStatus.PENDING || job.status === EmbeddingJobStatus.PROCESSING || job.status === EmbeddingJobStatus.PAUSED)) {
      job.status = EmbeddingJobStatus.CANCELLED;
    }
  }

  public pauseJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === EmbeddingJobStatus.PROCESSING) {
      job.status = EmbeddingJobStatus.PAUSED;
    }
  }

  public resumeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === EmbeddingJobStatus.PAUSED) {
      job.status = EmbeddingJobStatus.PROCESSING;
    }
  }

  public clear(): void {
    this.jobs.clear();
  }
}
