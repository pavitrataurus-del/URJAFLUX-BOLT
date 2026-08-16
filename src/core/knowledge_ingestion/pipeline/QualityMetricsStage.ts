import { IngestionStage, PipelineStageContext } from "./stageTypes";
import { StructureDetectionResult } from "./DocumentStructureDetectionStage";
import { IngestionQualityMetrics } from "../../../types/documentStructure";

export interface QualityMetricsOutput {
  structuredModel: StructureDetectionResult["structuredModel"];
  qualityMetrics: IngestionQualityMetrics;
}

export class QualityMetricsStage implements IngestionStage<StructureDetectionResult, QualityMetricsOutput> {
  readonly stageName = "QUALITY_METRICS";

  async execute(input: StructureDetectionResult, context: PipelineStageContext): Promise<QualityMetricsOutput> {
    const processingTimeMs = Date.now() - context.startTime;

    const qualityMetrics: IngestionQualityMetrics = {
      documentId: context.documentId,
      ocrConfidence: context.metadata.ocrConfidence || 100.0,
      isScanned: !!context.metadata.isScanned,
      usedOcr: !!context.metadata.usedOcr,
      detectedChaptersCount: input.detectedChaptersCount,
      detectedSectionsCount: input.detectedSectionsCount,
      detectedParagraphsCount: input.detectedParagraphsCount,
      detectedTablesCount: input.detectedTablesCount,
      detectedFormulaeCount: input.detectedFormulaeCount,
      detectedImagesCount: input.detectedImagesCount,
      processingTimeMs,
      warnings: [...context.warnings],
      errors: [...context.errors],
      timestamp: new Date().toISOString()
    };

    return {
      structuredModel: input.structuredModel,
      qualityMetrics
    };
  }
}
