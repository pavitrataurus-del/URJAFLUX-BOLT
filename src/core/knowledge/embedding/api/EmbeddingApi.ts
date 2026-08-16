import { EmbeddingPipeline } from "../pipeline/EmbeddingPipeline";
import { IEmbeddingConfig, ISemanticChunk } from "../models/EmbeddingModels";

export class EmbeddingApi {
  private static instance: EmbeddingApi;

  private constructor() {}

  public static getInstance(): EmbeddingApi {
    if (!EmbeddingApi.instance) {
      EmbeddingApi.instance = new EmbeddingApi();
    }
    return EmbeddingApi.instance;
  }

  public async startPipeline(documentId: string, chunks: ISemanticChunk[], config?: any, storeId?: string): Promise<string> {
    return EmbeddingPipeline.getInstance().startEmbeddingJob(documentId, chunks, config, storeId);
  }

  public getPipelineStatus(jobId: string): string | undefined {
    return EmbeddingPipeline.getInstance().getJob(jobId)?.status;
  }

  public cancelPipeline(jobId: string): void {
    EmbeddingPipeline.getInstance().cancelJob(jobId);
  }
}
