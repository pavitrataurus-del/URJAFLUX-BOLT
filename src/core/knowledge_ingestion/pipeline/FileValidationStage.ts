import { IngestionStage, PipelineStageContext } from "./stageTypes";

export interface FileValidationOutput {
  isValid: boolean;
  fileHash: string;
  sanitizedName: string;
  detectedExtension: string;
}

export class FileValidationStage implements IngestionStage<PipelineStageContext, FileValidationOutput> {
  readonly stageName = "FILE_VALIDATION";

  async execute(input: PipelineStageContext, context: PipelineStageContext): Promise<FileValidationOutput> {
    if (!context.fileName || context.fileSize <= 0) {
      throw new Error(`[FileValidationStage] Invalid file: Name or size is missing.`);
    }

    const sanitizedName = context.fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const parts = context.fileName.split(".");
    const detectedExtension = parts.length > 1 ? parts.pop()!.toLowerCase() : "pdf";

    if (context.fileSize > 100 * 1024 * 1024) {
      context.warnings.push("File exceeds 100MB standard size limit.");
    }

    // Generate simple hash signature
    let hash = 0;
    const sample = `${context.fileName}_${context.fileSize}_${context.dataUrlOrText.slice(0, 1000)}`;
    for (let i = 0; i < sample.length; i++) {
      hash = (hash << 5) - hash + sample.charCodeAt(i);
      hash |= 0;
    }
    const fileHash = Math.abs(hash).toString(16).padStart(8, "0");

    return {
      isValid: true,
      fileHash,
      sanitizedName,
      detectedExtension
    };
  }
}
