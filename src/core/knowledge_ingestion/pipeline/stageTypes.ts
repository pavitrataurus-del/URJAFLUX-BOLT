// ============================================================================
// MODULAR INGESTION PIPELINE STAGE INTERFACES (LOCK 27)
// ============================================================================

import { StructuredDocumentModel, IngestionQualityMetrics } from "../../../types/documentStructure";

export interface PipelineStageContext {
  documentId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  startTime: number;
  warnings: string[];
  errors: string[];
  metadata: Record<string, any>;
  dataUrlOrText: string;
  extractedNativeText?: string;
}

export interface IngestionStage<TInput, TOutput> {
  readonly stageName: string;
  execute(input: TInput, context: PipelineStageContext): Promise<TOutput>;
}
