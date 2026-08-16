import { IOcrResult } from "../models/OcrModels";

export interface IOcrProviderConfig {
  providerId: string;
  options?: Record<string, any>;
}

export interface IOcrProvider {
  getProviderId(): string;
  isAvailable(): Promise<boolean>;
  processImage(imageBuffer: Buffer, config?: IOcrProviderConfig): Promise<IOcrResult>;
}
