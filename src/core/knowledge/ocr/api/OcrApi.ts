import { OcrPipeline, IOcrPipelineConfig, IOcrJob } from "../pipeline/OcrPipeline";
import { OcrProviderFactory } from "../providers/OcrProviderFactory";
import { IOcrProvider } from "../providers/IOcrProvider";
import { ImagePreprocessor, PreprocessingPlugin } from "../preprocessing/ImagePreprocessor";
import { OcrValidationEngine, IValidationOptions } from "../validation/OcrValidationEngine";
import { IOcrResult } from "../models/OcrModels";

export class OcrApi {
  private static instance: OcrApi;

  private constructor() {}

  public static getInstance(): OcrApi {
    if (!OcrApi.instance) {
      OcrApi.instance = new OcrApi();
    }
    return OcrApi.instance;
  }

  // Provider Registration
  public registerProvider(provider: IOcrProvider, isDefault = false): void {
    OcrProviderFactory.getInstance().registerProvider(provider, isDefault);
  }

  // Preprocessing
  public registerPreprocessingPlugin(plugin: PreprocessingPlugin): void {
    ImagePreprocessor.getInstance().registerPlugin(plugin);
  }

  // Pipeline execution
  public async startOcr(documentId: string, imageBuffers: Buffer[], config?: IOcrPipelineConfig): Promise<string> {
    return OcrPipeline.getInstance().startOcr(documentId, imageBuffers, config);
  }

  public cancelOcr(jobId: string): void {
    OcrPipeline.getInstance().cancelJob(jobId);
  }

  public pauseOcr(jobId: string): void {
    OcrPipeline.getInstance().pauseJob(jobId);
  }

  public resumeOcr(jobId: string): void {
    OcrPipeline.getInstance().resumeJob(jobId);
  }

  public getOcrStatus(jobId: string): string | undefined {
    return OcrPipeline.getInstance().getJob(jobId)?.status;
  }

  public getOcrResult(jobId: string): IOcrResult | undefined {
    return OcrPipeline.getInstance().getJob(jobId)?.result;
  }

  public listOcrJobs(): IOcrJob[] {
    return OcrPipeline.getInstance().listJobs();
  }

  public getOcrMetadata(jobId: string): Record<string, any> | undefined {
    return OcrPipeline.getInstance().getJob(jobId)?.metadata;
  }

  public validateOcrOutput(result: IOcrResult, options?: IValidationOptions): boolean {
    return OcrValidationEngine.getInstance().validate(result, options);
  }
}
