import { FileMetadata } from './ingestion.types';

export type ImportSourceType = 
  | 'LOCAL_FILE' 
  | 'CLOUD_STORAGE' 
  | 'API' 
  | 'KNOWLEDGE_PACKAGE' 
  | 'ZIP_ARCHIVE';

export interface ImportSourceContext {
  readonly sourceType: ImportSourceType;
  readonly uriOrPath: string;
  readonly fileRef?: File;
  readonly headers?: Record<string, string>;
  readonly credentials?: Record<string, string>;
}

export interface ImportStrategy {
  readonly strategyName: string;
  supports(sourceType: ImportSourceType): boolean;
  prepareImport(context: ImportSourceContext): Promise<FileMetadata>;
}
