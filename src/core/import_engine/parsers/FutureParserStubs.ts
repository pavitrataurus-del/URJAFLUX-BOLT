// URJAFLUX Enterprise Streaming Import Engine - Future Parser Architecture Stubs
// Future-ready parser abstractions for DOCX, CSV, XLSX, DXF, DWG CAD formats

import { IDocumentParser, ParserStreamOptions } from "./IDocumentParser";
import { DocumentMetadata, ParsedPageChunk, FileValidationResult } from "../types";

export abstract class BaseFutureDocumentParser implements IDocumentParser {
  abstract readonly parserName: string;
  abstract readonly supportedMimeTypes: string[];
  abstract readonly supportedExtensions: string[];

  public async validateFile(file: File | Blob | ArrayBuffer): Promise<FileValidationResult> {
    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return { isValid: false, error: "Empty document (0 bytes)", errorCode: "EMPTY_DOCUMENT" };
    }
    return { isValid: true };
  }

  public async extractMetadata(file: File | Blob | ArrayBuffer, fileName: string): Promise<DocumentMetadata> {
    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
    const ext = fileName.split(".").pop()?.toLowerCase() || "unknown";

    return {
      title: fileName.replace(/\.[^/.]+$/, ""),
      totalPages: 1,
      fileSizeBytes: buffer.byteLength,
      mimeType: this.supportedMimeTypes[0] || "application/octet-stream",
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
      pageType: "structured",
      rawBuffer: buffer
    };
    await onPageParsed(chunk);
  }
}

export class DocxDocumentParser extends BaseFutureDocumentParser {
  public readonly parserName = "DocxDocumentParser";
  public readonly supportedMimeTypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  public readonly supportedExtensions = ["docx", "doc"];
}

export class CsvXlsxDocumentParser extends BaseFutureDocumentParser {
  public readonly parserName = "CsvXlsxDocumentParser";
  public readonly supportedMimeTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  public readonly supportedExtensions = ["csv", "xlsx", "xls"];
}

export class CadDxfDwgDocumentParser extends BaseFutureDocumentParser {
  public readonly parserName = "CadDxfDwgDocumentParser";
  public readonly supportedMimeTypes = ["image/vnd.dxf", "application/acad", "application/dwg"];
  public readonly supportedExtensions = ["dxf", "dwg"];
}
