import { PipelineStageContext } from "./stageTypes";
import { FileValidationStage } from "./FileValidationStage";
import { OcrAndExtractionStage } from "./OcrAndExtractionStage";
import { DocumentCleaningStage } from "./DocumentCleaningStage";
import { DocumentStructureDetectionStage } from "./DocumentStructureDetectionStage";
import { QualityMetricsStage, QualityMetricsOutput } from "./QualityMetricsStage";

export class DocumentStructurePipelineRunner {
  private fileValidationStage = new FileValidationStage();
  private ocrAndExtractionStage = new OcrAndExtractionStage();
  private documentCleaningStage = new DocumentCleaningStage();
  private documentStructureDetectionStage = new DocumentStructureDetectionStage();
  private qualityMetricsStage = new QualityMetricsStage();

  /**
   * Executes the 5-stage modular document structure ingestion pipeline (LOCK 27).
   */
  public async runPipeline(
    file: { name: string; size: number; type: string; dataUrlOrText: string; extractedNativeText?: string },
    documentId: string,
    category: string,
    onProgress?: (step: string, percent: number) => void
  ): Promise<QualityMetricsOutput> {
    const startTime = Date.now();
    const context: PipelineStageContext = {
      documentId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "pdf",
      category: category || "Vastu Shastra",
      startTime,
      warnings: [],
      errors: [],
      metadata: {},
      dataUrlOrText: file.dataUrlOrText,
      extractedNativeText: file.extractedNativeText
    };

    // Stage 1: File Validation
    onProgress?.("FILE_VALIDATION", 20);
    const validationResult = await this.fileValidationStage.execute(context, context);
    context.metadata.fileHash = validationResult.fileHash;

    // Stage 2: OCR and Extraction
    onProgress?.("OCR_AND_EXTRACTION", 40);
    const ocrResult = await this.ocrAndExtractionStage.execute(context, context);
    context.metadata.isScanned = ocrResult.isScanned;
    context.metadata.usedOcr = ocrResult.usedOcr;
    context.metadata.ocrConfidence = ocrResult.ocrConfidence;

    // Stage 3: Document Cleaning
    onProgress?.("DOCUMENT_CLEANING", 60);
    const cleaningResult = await this.documentCleaningStage.execute(ocrResult, context);

    // Stage 4: Structure Detection (Chapters, Sections, Subsections, Paragraphs, Tables, Formulas, Page Anchors)
    onProgress?.("STRUCTURE_DETECTION", 85);
    const structureResult = await this.documentStructureDetectionStage.execute(cleaningResult, context);

    // Stage 5: Quality Metrics Generation (LOCK 28)
    onProgress?.("QUALITY_METRICS", 100);
    const finalOutput = await this.qualityMetricsStage.execute(structureResult, context);

    return finalOutput;
  }
}
