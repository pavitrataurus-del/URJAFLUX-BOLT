import { IngestionStage, PipelineStageContext } from "./stageTypes";
import { OcrAndExtractionOutput } from "./OcrAndExtractionStage";

export interface DocumentCleaningOutput {
  cleanText: string;
  originalText: string;
  ocrText?: string;
  correctedOcrText?: string;
  isScanned: boolean;
  usedOcr: boolean;
  ocrConfidence: number;
}

export class DocumentCleaningStage implements IngestionStage<OcrAndExtractionOutput, DocumentCleaningOutput> {
  readonly stageName = "DOCUMENT_CLEANING";

  async execute(input: OcrAndExtractionOutput, context: PipelineStageContext): Promise<DocumentCleaningOutput> {
    const raw = input.rawText || "";

    // Normalize unicode spaces, remove page header noise, standardize line breaks
    let clean = raw
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\t/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Strip repetitive running header / footer page numbers if detected
    clean = clean.replace(/Page \d+ of \d+/gi, "");

    return {
      cleanText: clean,
      originalText: raw,
      ocrText: input.ocrText,
      correctedOcrText: input.correctedOcrText,
      isScanned: input.isScanned,
      usedOcr: input.usedOcr,
      ocrConfidence: input.ocrConfidence
    };
  }
}
