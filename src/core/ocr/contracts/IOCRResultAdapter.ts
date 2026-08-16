import { OCRResult } from '../models/OCRResult';
import { OCRProvider } from '../engines/OCRProvider';
import { OCRDocument } from '../models/OCRDocument';
import { OCRPage } from '../models/OCRPage';
import { OCRBlock } from '../models/OCRBlock';
import { OCRLine } from '../models/OCRLine';
import { OCRWord } from '../models/OCRWord';
import { OCRConfidence } from '../models/OCRConfidence';
import { Logger } from '../../utils/logger';

import { OCRBlockType } from '../models/OCRBlock';
import { IOCRBoundingBox } from '../models/OCRWord';

export interface IOCRAdapterOptions {
  readonly documentId?: string;
  readonly title?: string;
  readonly provider?: OCRProvider;
  readonly defaultLanguage?: string;
}

export interface IOCRResultAdapter {
  readonly provider: OCRProvider;
  canAdapt(payload: unknown): boolean;
  adapt(payload: unknown, options?: IOCRAdapterOptions): OCRResult;
}

export class StandardOCRResultAdapter implements IOCRResultAdapter {
  public readonly provider: OCRProvider;

  constructor(provider: OCRProvider = 'MOCK_ENTERPRISE') {
    this.provider = provider;
  }

  public canAdapt(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const obj = payload as Record<string, unknown>;
    if (obj instanceof OCRResult) return true;
    if (obj.document && (obj.provider || obj.resultId)) return true;
    if (Array.isArray(obj.pages) || Array.isArray(obj.blocks) || typeof obj.text === 'string') return true;

    return false;
  }

  public adapt(payload: unknown, options?: IOCRAdapterOptions): OCRResult {
    const startTime = Date.now();
    Logger.info(`[StandardOCRResultAdapter] Adapting payload for provider: ${this.provider}`);

    if (!payload || typeof payload !== 'object') {
      throw new Error('[StandardOCRResultAdapter] Invalid payload: Expected object input');
    }

    // Direct instance match
    if (payload instanceof OCRResult) {
      return payload;
    }

    const obj = payload as Record<string, unknown>;

    // Existing OCRDocument or nested document
    if (obj.document instanceof OCRDocument) {
      return new OCRResult({
        resultId: typeof obj.resultId === 'string' ? obj.resultId : undefined,
        document: obj.document,
        provider: (obj.provider as OCRProvider) || options?.provider || this.provider,
        processingTimeMs: typeof obj.processingTimeMs === 'number' ? obj.processingTimeMs : Date.now() - startTime,
        status: obj.status === 'FAILED' ? 'FAILED' : obj.status === 'PARTIAL_SUCCESS' ? 'PARTIAL_SUCCESS' : 'SUCCESS',
        errors: Array.isArray(obj.errors) ? obj.errors.map(String) : [],
        warnings: Array.isArray(obj.warnings) ? obj.warnings.map(String) : []
      });
    }

    // Raw text or pages object adaptation
    const docId = options?.documentId || (typeof obj.documentId === 'string' ? obj.documentId : `doc_adapted_${Date.now()}`);
    const docTitle = options?.title || (typeof obj.title === 'string' ? obj.title : 'Adapted OCR Document');
    const lang = options?.defaultLanguage || (typeof obj.language === 'string' ? obj.language : 'en');

    const pagesData = Array.isArray(obj.pages) ? obj.pages : [obj];
    const adaptedPages: OCRPage[] = [];

    pagesData.forEach((pageObj, pIdx) => {
      const pageRecord = (pageObj && typeof pageObj === 'object') ? (pageObj as Record<string, unknown>) : {};
      const pageNum = typeof pageRecord.pageNumber === 'number' ? pageRecord.pageNumber : pIdx + 1;
      const width = typeof pageRecord.width === 'number' ? pageRecord.width : 612;
      const height = typeof pageRecord.height === 'number' ? pageRecord.height : 792;

      const rawBlocks = Array.isArray(pageRecord.blocks) ? pageRecord.blocks : [];
      const adaptedBlocks: OCRBlock[] = rawBlocks.map((bObj, bIdx) => {
        const bRec = (bObj && typeof bObj === 'object') ? (bObj as Record<string, unknown>) : {};
        const rawLines = Array.isArray(bRec.lines) ? bRec.lines : [];

        const adaptedLines: OCRLine[] = rawLines.map((lObj, lIdx) => {
          const lRec = (lObj && typeof lObj === 'object') ? (lObj as Record<string, unknown>) : {};
          const rawWords = Array.isArray(lRec.words) ? lRec.words : [];

          const adaptedWords: OCRWord[] = rawWords.map((wObj, wIdx) => {
            const wRec = (wObj && typeof wObj === 'object') ? (wObj as Record<string, unknown>) : {};
            return new OCRWord({
              wordId: typeof wRec.wordId === 'string' ? wRec.wordId : `w_${pIdx}_${bIdx}_${lIdx}_${wIdx}`,
              text: typeof wRec.text === 'string' ? wRec.text : '',
              confidence: typeof wRec.confidence === 'number' ? wRec.confidence : 0.9,
              boundingBox: (wRec.boundingBox as IOCRBoundingBox) || { x: 0, y: 0, width: 50, height: 12 },
              isBold: Boolean(wRec.isBold),
              isItalic: Boolean(wRec.isItalic)
            });
          });

          return new OCRLine({
            lineId: typeof lRec.lineId === 'string' ? lRec.lineId : `l_${pIdx}_${bIdx}_${lIdx}`,
            text: typeof lRec.text === 'string' ? lRec.text : adaptedWords.map(w => w.text).join(' '),
            confidence: typeof lRec.confidence === 'number' ? OCRConfidence.fromScore(lRec.confidence) : undefined,
            boundingBox: (lRec.boundingBox as IOCRBoundingBox) || { x: 0, y: 0, width: 200, height: 14 },
            words: adaptedWords
          });
        });

        return new OCRBlock({
          blockId: typeof bRec.blockId === 'string' ? bRec.blockId : `b_${pIdx}_${bIdx}`,
          blockType: typeof bRec.blockType === 'string' ? (bRec.blockType as OCRBlockType) : 'PARAGRAPH',
          boundingBox: (bRec.boundingBox as IOCRBoundingBox) || { x: 0, y: 0, width: 400, height: 50 },
          confidence: typeof bRec.confidence === 'number' ? OCRConfidence.fromScore(bRec.confidence) : undefined,
          readingOrderIndex: typeof bRec.readingOrderIndex === 'number' ? bRec.readingOrderIndex : bIdx,
          lines: adaptedLines
        });
      });

      adaptedPages.push(new OCRPage({
        pageNumber: pageNum,
        width,
        height,
        blocks: adaptedBlocks,
        language: lang
      }));
    });

    const doc = new OCRDocument({
      documentId: docId,
      title: docTitle,
      totalPages: adaptedPages.length,
      pages: adaptedPages,
      primaryLanguage: lang
    });

    return new OCRResult({
      resultId: typeof obj.resultId === 'string' ? obj.resultId : `res_adapted_${Date.now()}`,
      document: doc,
      provider: options?.provider || this.provider,
      processingTimeMs: Date.now() - startTime,
      status: 'SUCCESS'
    });
  }
}
