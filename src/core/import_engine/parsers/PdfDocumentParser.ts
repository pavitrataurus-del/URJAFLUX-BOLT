import { IDocumentParser, ParserStreamOptions } from "./IDocumentParser";
import { DocumentMetadata, ParsedPageChunk, FileValidationResult } from "../types";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

function ensurePdfWorker() {
  if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/legacy/build/pdf.worker.min.mjs`;
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs`;
    }
  }
}

// Initialize worker on module load
ensurePdfWorker();

async function toArrayBuffer(file: File | Blob | ArrayBuffer | Uint8Array): Promise<ArrayBuffer> {
  if (file instanceof ArrayBuffer) return file;
  if (ArrayBuffer.isView(file)) {
    return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
  }
  if (file && typeof (file as any).arrayBuffer === 'function') {
    return await (file as Blob).arrayBuffer();
  }
  throw new Error("Invalid file payload: Expected ArrayBuffer, Uint8Array, Buffer, or Blob/File.");
}

export class PdfDocumentParser implements IDocumentParser {
  public readonly parserName = "PdfDocumentParser";
  public readonly supportedMimeTypes = ["application/pdf"];
  public readonly supportedExtensions = ["pdf"];

  public async validateFile(file: File | Blob | ArrayBuffer | Uint8Array): Promise<FileValidationResult> {
    const buffer = await toArrayBuffer(file);
    if (!buffer || buffer.byteLength === 0) {
      return { isValid: false, error: "Empty PDF document", errorCode: "EMPTY_DOCUMENT" };
    }
    const headerBytes = new Uint8Array(buffer.slice(0, 8));
    const headerStr = String.fromCharCode(...headerBytes);
    if (!headerStr.startsWith("%PDF-")) {
      return { isValid: false, error: "Invalid PDF signature. Header must start with %PDF-", errorCode: "CORRUPTED_FILE" };
    }
    return { isValid: true };
  }

  public async extractMetadata(file: File | Blob | ArrayBuffer | Uint8Array, fileName: string): Promise<DocumentMetadata> {
    ensurePdfWorker();
    const validation = await this.validateFile(file);
    if (!validation.isValid) throw new Error(validation.error);
    const buffer = await toArrayBuffer(file);
    
    let totalPages = 1;
    let isEncrypted = false;
    
    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      totalPages = pdf.numPages;
      if (typeof (pdf as any).destroy === "function") {
        await (pdf as any).destroy();
      }
    } catch (err: any) {
      if (err?.name === 'PasswordException') {
        isEncrypted = true;
      }
    }

    return {
      title: fileName.replace(/\.pdf$/i, ""),
      totalPages,
      fileSizeBytes: buffer.byteLength,
      mimeType: "application/pdf",
      checksumSha256: "",
      isEncrypted,
      format: "PDF"
    };
  }

  public async streamPages(
    file: File | Blob | ArrayBuffer | Uint8Array,
    onPageParsed: (page: ParsedPageChunk) => Promise<void>,
    options?: ParserStreamOptions
  ): Promise<void> {
    ensurePdfWorker();
    const buffer = await toArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
    
    const totalPages = pdf.numPages;
    const startPage = options?.startPage && options.startPage > 0 ? options.startPage : 1;

    console.log(`[PdfDocumentParser] Streaming ${totalPages} pages starting from page ${startPage}...`);

    for (let p = startPage; p <= totalPages; p++) {
      if (options?.abortSignal?.aborted) break;

      try {
        const page = await pdf.getPage(p);
        const textContent = await page.getTextContent();
        let extractedText = textContent.items
          .map((item: any) => item.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        
        let usedOcr = false;

        // OCR Policy: If extracted native text is empty or insufficient (< 10 chars per page), trigger Vision OCR
        if (extractedText.length <= 10) {
          usedOcr = true;
        }

        const viewport = page.getViewport({ scale: 1.0 });

        const chunk: ParsedPageChunk = {
          pageNumber: p,
          totalPages,
          pageType: "pdf_page",
          extractedText,
          dimensions: { width: viewport.width, height: viewport.height },
          hasImages: usedOcr,
          imageCount: usedOcr ? 1 : 0
        };

        await onPageParsed(chunk);
        page.cleanup();
      } catch (pageErr: any) {
        console.error(`[PdfDocumentParser] Error parsing page ${p} of ${totalPages}:`, pageErr?.message || pageErr);
        if (pageErr && typeof pageErr === "object") {
          pageErr.pageNumber = p;
        }
        throw pageErr;
      }
      // Yield execution on every page to keep event loop responsive and UI smooth
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (typeof (pdf as any).destroy === "function") {
      await (pdf as any).destroy();
    }
  }
}

