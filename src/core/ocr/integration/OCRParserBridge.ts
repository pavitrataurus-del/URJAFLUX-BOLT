import { StructuredDocument } from '../reconstruction/StructuredDocument';
import { OCRDocument } from '../models/OCRDocument';
import { ParsedDocument } from '../../knowledge_parsing/types/document.types';
import { SupportedFileExtension } from '../../knowledge_ingestion/types/ingestion.types';
import { OCRContractValidator } from '../contracts/OCRContractValidator';
import { OCRCompatibilityReport } from '../contracts/OCRCompatibilityReport';
import { StructuredDocumentMapper } from './StructuredDocumentMapper';
import { Logger } from '../../utils/logger';

export interface IOCRParserBridgeResult {
  readonly success: boolean;
  readonly documentId: string;
  readonly parsedDocument: ParsedDocument;
  readonly compatibilityReport: OCRCompatibilityReport;
  readonly bridgeTimeMs: number;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

export class OCRParserBridge {
  private static instance: OCRParserBridge | null = null;

  private constructor() {}

  public static getInstance(): OCRParserBridge {
    if (!OCRParserBridge.instance) {
      OCRParserBridge.instance = new OCRParserBridge();
    }
    return OCRParserBridge.instance;
  }

  public async bridgeToParser(inputDoc: StructuredDocument | ParsedDocument | unknown): Promise<IOCRParserBridgeResult> {
    const startTime = Date.now();
    Logger.info('[OCRParserBridge] Initiating OCR-to-Parser document bridging');

    // Step 1: Validate contract compatibility
    const compatibilityReport = OCRContractValidator.validateContract(inputDoc);

    // Step 2: Map to ParsedDocument contract
    let parsedDoc: ParsedDocument;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const v of compatibilityReport.violations) {
      if (v.severity === 'CRITICAL') {
        errors.push(`[${v.type}] ${v.message}`);
      } else {
        warnings.push(`[${v.type}] ${v.message}`);
      }
    }

    try {
      if (inputDoc instanceof StructuredDocument || inputDoc instanceof OCRDocument) {
        parsedDoc = StructuredDocumentMapper.mapToParsedDocument(inputDoc);
      } else {
        parsedDoc = StructuredDocumentMapper.mapToParsedDocument(inputDoc as StructuredDocument);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Mapping failed: ${errMsg}`);

      // Emergency fallback structure
      parsedDoc = Object.freeze({
        documentId: 'fallback_doc_id',
        packageHash: `hash_fallback_${Date.now()}`,
        fileName: 'unparsed_fallback.pdf',
        parsedAt: Date.now(),
        metadata: Object.freeze({
          title: 'Unparsed Document Fallback',
          fileSize: 0,
          extension: 'pdf' as SupportedFileExtension
        }),
        structure: Object.freeze({
          chapters: [],
          unassignedSections: [],
          pages: []
        }),
        statistics: Object.freeze({
          totalCharacters: 0,
          totalWords: 0,
          totalParagraphs: 0,
          totalHeadings: 0,
          totalTables: 0,
          totalImages: 0,
          totalFootnotes: 0
        })
      });
    }

    const bridgeTimeMs = Date.now() - startTime;
    const isSuccess = compatibilityReport.isCompatible && errors.length === 0;

    Logger.info(`[OCRParserBridge] Document bridging completed in ${bridgeTimeMs}ms. Success: ${isSuccess}, Score: ${compatibilityReport.compatibilityScore}`);

    return Object.freeze({
      success: isSuccess,
      documentId: parsedDoc.documentId,
      parsedDocument: parsedDoc,
      compatibilityReport,
      bridgeTimeMs,
      warnings: Object.freeze(warnings),
      errors: Object.freeze(errors)
    });
  }
}

export const ocrParserBridge = OCRParserBridge.getInstance();
