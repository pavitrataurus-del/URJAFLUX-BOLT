// URJAFLUX Enterprise Streaming Import Engine - Text & Markdown Parser

import { IDocumentParser, ParserStreamOptions } from "./IDocumentParser";
import { DocumentMetadata, ParsedPageChunk, FileValidationResult } from "../types";

export class TextMarkdownParser implements IDocumentParser {
  public readonly parserName = "TextMarkdownParser";
  public readonly supportedMimeTypes = ["text/plain", "text/markdown", "text/x-markdown"];
  public readonly supportedExtensions = ["txt", "md", "markdown"];

  public async validateFile(file: File | Blob | ArrayBuffer): Promise<FileValidationResult> {
    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return { isValid: false, error: "Empty text document (0 bytes)", errorCode: "EMPTY_DOCUMENT" };
    }
    return { isValid: true };
  }

  public async extractMetadata(file: File | Blob | ArrayBuffer, fileName: string): Promise<DocumentMetadata> {
    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
    const textDecoder = new TextDecoder("utf-8");
    const fullText = textDecoder.decode(buffer);

    // Calculate pages based on 3000 character page windows
    const totalPages = Math.max(1, Math.ceil(fullText.length / 3000));
    const ext = fileName.split(".").pop()?.toLowerCase() || "txt";

    return {
      title: fileName.replace(/\.[^/.]+$/, ""),
      totalPages,
      fileSizeBytes: buffer.byteLength,
      mimeType: ext === "md" ? "text/markdown" : "text/plain",
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
    const textDecoder = new TextDecoder("utf-8");
    const fullText = textDecoder.decode(buffer);

    const pageSizeChars = 3000;
    const totalPages = Math.max(1, Math.ceil(fullText.length / pageSizeChars));
    const startPage = options?.startPage && options.startPage > 0 ? options.startPage : 1;

    for (let p = startPage; p <= totalPages; p++) {
      if (options?.abortSignal?.aborted) break;

      const startIndex = (p - 1) * pageSizeChars;
      const pageText = fullText.slice(startIndex, startIndex + pageSizeChars);

      const chunk: ParsedPageChunk = {
        pageNumber: p,
        totalPages,
        pageType: "text",
        extractedText: pageText,
        hasImages: false,
        imageCount: 0
      };

      await onPageParsed(chunk);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
