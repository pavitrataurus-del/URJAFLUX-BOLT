// URJAFLUX Enterprise Streaming Import Engine - Document Parser Interface

import { DocumentMetadata, ParsedPageChunk, FileValidationResult } from "../types";

export interface ParserStreamOptions {
  startPage?: number;
  maxPages?: number;
  chunkSizeBytes?: number;
  abortSignal?: AbortSignal;
}

export interface IDocumentParser {
  readonly parserName: string;
  readonly supportedMimeTypes: string[];
  readonly supportedExtensions: string[];

  /**
   * Fast file structure and integrity validation
   */
  validateFile(file: File | Blob | ArrayBuffer): Promise<FileValidationResult>;

  /**
   * Extracts top-level document metadata without parsing full page content
   */
  extractMetadata(file: File | Blob | ArrayBuffer, fileName: string): Promise<DocumentMetadata>;

  /**
   * Streams pages incrementally page-by-page. Yields memory after each callback to keep memory usage under 100MB.
   */
  streamPages(
    file: File | Blob | ArrayBuffer,
    onPageParsed: (page: ParsedPageChunk) => Promise<void>,
    options?: ParserStreamOptions
  ): Promise<void>;
}
