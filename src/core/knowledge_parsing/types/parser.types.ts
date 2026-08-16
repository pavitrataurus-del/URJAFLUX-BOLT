import { SupportedFileExtension } from '../../knowledge_ingestion/types/ingestion.types';
import { ParsedDocument, DocumentMetadata, DocumentStructure } from './document.types';

export interface ParserConfig {
  readonly maxPages: number;
  readonly maxMemoryMB: number;
  readonly maxParsingTimeMs: number;
  readonly supportedLanguages: readonly string[];
  readonly extractImages: boolean;
  readonly extractTables: boolean;
  readonly extractBookmarks: boolean;
  readonly futureOcrEnabled: boolean;
}

export interface ParsingWarning {
  readonly code: string;
  readonly message: string;
  readonly lineOrOffset?: number;
}

export interface ParsingError {
  readonly code: string;
  readonly message: string;
  readonly isFatal: boolean;
  readonly cause?: unknown;
}

export interface ParsingMetrics {
  readonly processingTimeMs: number;
  readonly elapsedTimeMs: number;
  readonly bytesProcessed: number;
  readonly pagesParsed: number;
  readonly chaptersFound: number;
  readonly sectionsFound: number;
  readonly tablesFound: number;
  readonly imagesFound: number;
  readonly warnings: readonly ParsingWarning[];
  readonly errors: readonly ParsingError[];
  readonly warningsCount: number;
  readonly recoverableErrorCount: number;
  readonly fatalErrorCount: number;
  readonly skippedObjectsCount: number;
  readonly memoryEstimateBytes: number;
  readonly parserBackendId: string;
  readonly parserVersion: string;
  readonly pipelineVersion: string;
}

export interface ParserCapabilities {
  readonly supportedExtensions: readonly SupportedFileExtension[];
  readonly hasTextExtraction: boolean;
  readonly hasMetadataExtraction: boolean;
  readonly hasTableExtraction: boolean;
  readonly hasImageExtraction: boolean;
  readonly hasBookmarkExtraction: boolean;
  readonly hasFootnoteExtraction: boolean;
  readonly hasCrossReferenceExtraction: boolean;
  readonly hasLanguageDetection: boolean;
  readonly hasEncryptedDocumentHandling: boolean;
}

export interface IDocumentParser {
  readonly parserId: string;
  readonly parserVersion: string;
  readonly capabilities: ParserCapabilities;

  supports(extension: SupportedFileExtension): boolean;
  validate(file: File | Uint8Array): Promise<boolean>;
  extractMetadata(file: File | Uint8Array, fileName: string): Promise<DocumentMetadata>;
  extractStructure(file: File | Uint8Array, config: ParserConfig): Promise<DocumentStructure>;
  parse(file: File | Uint8Array, fileName: string, config: ParserConfig): Promise<{
    document: ParsedDocument;
    metrics: ParsingMetrics;
  }>;
}
