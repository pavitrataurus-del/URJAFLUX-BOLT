// URJAFLUX Enterprise Streaming Import Engine - Image Document Parser
// Handles PNG, JPG, JPEG, WEBP image file ingestion

import { IDocumentParser, ParserStreamOptions } from "./IDocumentParser";
import { DocumentMetadata, ParsedPageChunk, FileValidationResult } from "../types";

export class ImageDocumentParser implements IDocumentParser {
  public readonly parserName = "ImageDocumentParser";
  public readonly supportedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  public readonly supportedExtensions = ["png", "jpg", "jpeg", "webp"];

  public async validateFile(file: File | Blob | ArrayBuffer): Promise<FileValidationResult> {
    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return { isValid: false, error: "Empty image document (0 bytes)", errorCode: "EMPTY_DOCUMENT" };
    }
    return { isValid: true };
  }

  public async extractMetadata(file: File | Blob | ArrayBuffer, fileName: string): Promise<DocumentMetadata> {
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(`Image Metadata extraction failed: ${validation.error}`);
    }

    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";

    return {
      title: fileName.replace(/\.[^/.]+$/, ""),
      totalPages: 1,
      fileSizeBytes: buffer.byteLength,
      mimeType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      checksumSha256: "",
      isEncrypted: false,
      format: ext.toUpperCase()
    };
  }

  public async streamPages(
    file: File | Blob | ArrayBuffer,
    onPageParsed: (page: ParsedPageChunk) => Promise<void>,
    options?: ParserStreamOptions
  ): Promise<void> {
    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();

    const chunk: ParsedPageChunk = {
      pageNumber: 1,
      totalPages: 1,
      pageType: "image",
      rawBuffer: buffer,
      hasImages: true,
      imageCount: 1
    };

    await onPageParsed(chunk);
  }
}
