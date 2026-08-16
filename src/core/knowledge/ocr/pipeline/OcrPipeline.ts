import { IOcrResult, IOcrPage } from "../models/OcrModels";
import { OcrProviderFactory } from "../providers/OcrProviderFactory";
import { ImagePreprocessor, IPreprocessingConfig } from "../preprocessing/ImagePreprocessor";
import { OcrValidationEngine, IValidationOptions } from "../validation/OcrValidationEngine";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { OcrEventType, createOcrEvent } from "../events/OcrEvents";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export enum OcrJobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export interface IOcrJob {
  id: string;
  documentId: string;
  status: OcrJobStatus;
  progress: number;
  result?: IOcrResult;
  error?: string;
  metadata: Record<string, any>;
}

export interface IOcrPipelineConfig {
  providerId?: string;
  preprocessing?: IPreprocessingConfig;
  validation?: IValidationOptions;
  languages?: string[]; // Multilingual support hooks
}

export class OcrPipeline {
  private static instance: OcrPipeline;
  private jobs: Map<string, IOcrJob> = new Map();

  private constructor() {}

  public static getInstance(): OcrPipeline {
    if (!OcrPipeline.instance) {
      OcrPipeline.instance = new OcrPipeline();
    }
    return OcrPipeline.instance;
  }

  public async startOcr(documentId: string, imageBuffers: Buffer[], config: IOcrPipelineConfig = {}): Promise<string> {
    const jobId = `ocr_${documentId}_${Date.now()}`;
    const job: IOcrJob = {
      id: jobId,
      documentId,
      status: OcrJobStatus.PENDING,
      progress: 0,
      metadata: { config }
    };
    
    this.jobs.set(jobId, job);
    EventBus.getInstance().publish(createOcrEvent(OcrEventType.OCR_STARTED, { jobId, documentId }));

    // Run async processing
    this.processJob(job, imageBuffers, config).catch(e => {
      console.error(`OCR Job ${jobId} failed:`, e);
    });

    return jobId;
  }

  private async processJob(job: IOcrJob, imageBuffers: Buffer[], config: IOcrPipelineConfig): Promise<void> {
    job.status = OcrJobStatus.PROCESSING;
    
    try {
      const provider = OcrProviderFactory.getInstance().getProvider(config.providerId);
      const preprocessor = ImagePreprocessor.getInstance();
      const validator = OcrValidationEngine.getInstance();
      
      const pages: IOcrPage[] = [];
      let fullText = "";
      let totalConfidence = 0;

      for (let i = 0; i < imageBuffers.length; i++) {
        // @ts-ignore
          if (job.status === OcrJobStatus.CANCELLED) return;
        // @ts-ignore
          while (job.status === OcrJobStatus.PAUSED) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          // @ts-ignore
          if (job.status === OcrJobStatus.CANCELLED) return;
        }

        const buffer = imageBuffers[i];
        
        // 1. Preprocessing
        const processedBuffer = await preprocessor.preprocess(buffer, config.preprocessing || {});
        
        // 2. OCR Provider processing
        const pageResult = await provider.processImage(processedBuffer, { providerId: provider.getProviderId(), options: { languages: config.languages } });
        
        // Merge results
        if (pageResult.pages && pageResult.pages.length > 0) {
          const page = pageResult.pages[0];
          page.pageNumber = i + 1; // Enforce page number
          pages.push(page);
          fullText += pageResult.fullText + "\n";
          totalConfidence += pageResult.overallConfidence;
          
          EventBus.getInstance().publish(createOcrEvent(OcrEventType.PAGE_PROCESSED, { 
            jobId: job.id, 
            documentId: job.documentId,
            pageNumber: page.pageNumber 
          }));
          
          if (pageResult.fullText) {
             EventBus.getInstance().publish(createOcrEvent(OcrEventType.TEXT_EXTRACTED, {
               documentId: job.documentId,
               pageNumber: page.pageNumber,
               textLength: pageResult.fullText.length
             }));
          }
        }
        
        job.progress = Math.floor(((i + 1) / imageBuffers.length) * 100);
        EventBus.getInstance().publish(createOcrEvent(OcrEventType.OCR_PROGRESS, { jobId: job.id, progress: job.progress }));
      }
      
      const overallConfidence = pages.length > 0 ? totalConfidence / pages.length : 0;
      
      const finalResult: IOcrResult = {
        id: `res_${job.id}`,
        documentId: job.documentId,
        pages,
        fullText: fullText.trim(),
        providerMetadata: { source: provider.getProviderId() },
        overallConfidence,
        languageDetected: config.languages ? config.languages[0] : undefined
      };

      // 3. Validation
      validator.validate(finalResult, config.validation);
      
      job.result = finalResult;
      job.status = OcrJobStatus.COMPLETED;
      job.progress = 100;
      
      EventBus.getInstance().publish(createOcrEvent(OcrEventType.OCR_COMPLETED, { jobId: job.id, documentId: job.documentId }));
      
    } catch (error: any) {
      job.status = OcrJobStatus.FAILED;
      job.error = error.message;
      EventBus.getInstance().publish(createOcrEvent(OcrEventType.OCR_FAILED, { jobId: job.id, documentId: job.documentId, error: error.message }));
    }
  }

  public getJob(jobId: string): IOcrJob | undefined {
    return this.jobs.get(jobId);
  }
  
  public listJobs(): IOcrJob[] {
    return Array.from(this.jobs.values());
  }

  public cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && (job.status === OcrJobStatus.PENDING || job.status === OcrJobStatus.PROCESSING || job.status === OcrJobStatus.PAUSED)) {
      job.status = OcrJobStatus.CANCELLED;
    }
  }

  public pauseJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === OcrJobStatus.PROCESSING) {
      job.status = OcrJobStatus.PAUSED;
    }
  }

  public resumeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === OcrJobStatus.PAUSED) {
      job.status = OcrJobStatus.PROCESSING;
    }
  }

  public clear(): void {
    this.jobs.clear();
  }
}
