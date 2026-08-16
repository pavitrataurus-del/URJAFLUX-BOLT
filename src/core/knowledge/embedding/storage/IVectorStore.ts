import { IEmbeddingRecord } from "../models/EmbeddingModels";

export interface IVectorStoreConfig {
  storeId: string;
  options?: Record<string, any>;
}

export interface IVectorStore {
  getStoreId(): string;
  isAvailable(): Promise<boolean>;
  store(record: IEmbeddingRecord): Promise<void>;
  storeBatch(records: IEmbeddingRecord[]): Promise<void>;
  deleteByDocumentId(documentId: string): Promise<void>;
  deleteByChunkId(chunkId: string): Promise<void>;
  deleteByNamespace(namespaceId: string): Promise<void>;
  
  // Minimal read operations to support index manager
  getRecord(chunkId: string): Promise<IEmbeddingRecord | null>;
  getRecordsByDocument(documentId: string): Promise<IEmbeddingRecord[]>;
}
