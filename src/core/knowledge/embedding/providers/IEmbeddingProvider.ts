import { IEmbeddingVector } from "../models/EmbeddingModels";

export interface IEmbeddingProviderConfig {
  providerId: string;
  version?: string;
  options?: Record<string, any>;
}

export interface IEmbeddingProvider {
  getProviderId(): string;
  isAvailable(): Promise<boolean>;
  getDimensions(): number;
  generateEmbedding(text: string, config?: IEmbeddingProviderConfig): Promise<IEmbeddingVector>;
  generateEmbeddings(texts: string[], config?: IEmbeddingProviderConfig): Promise<IEmbeddingVector[]>;
}
