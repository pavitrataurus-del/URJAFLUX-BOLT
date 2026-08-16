import { OCRProvider } from '../engines/OCRProvider';
import { OCREngineFactory, ocrEngineFactory } from '../engines/OCREngineFactory';
import { OCRResult } from '../models/OCRResult';
import { OCRDocument } from '../models/OCRDocument';
import { OCRPage } from '../models/OCRPage';
import { LayoutAnalyzer } from '../analysis/LayoutAnalyzer';
import { ReadingOrderAnalyzer } from '../analysis/ReadingOrderAnalyzer';
import { LanguageDetector } from '../analysis/LanguageDetector';
import { ScriptDetector } from '../analysis/ScriptDetector';
import { DocumentReconstructor } from '../reconstruction/DocumentReconstructor';
import { StructuredDocument } from '../reconstruction/StructuredDocument';
import { OCRQualityValidator } from '../validation/OCRQualityValidator';
import { OCRQualityReport } from '../validation/OCRQualityReport';
import { Logger } from '../../utils/logger';

export interface IOCRServiceOptions {
  readonly provider?: OCRProvider;
  readonly title?: string;
  readonly language?: string;
  readonly script?: string;
  readonly options?: Record<string, unknown>;
}

export interface IOCRServiceExecutionResultData {
  readonly structuredDocument: StructuredDocument;
  readonly ocrResult: OCRResult;
  readonly qualityReport: OCRQualityReport;
}

export class OCRService {
  private static instance: OCRService | null = null;
  private readonly engineFactory: OCREngineFactory;

  private constructor() {
    this.engineFactory = ocrEngineFactory;
  }

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  public async processAndReconstruct(
    input: Uint8Array | string,
    options?: IOCRServiceOptions
  ): Promise<IOCRServiceExecutionResultData> {
    const selectedProvider: OCRProvider = options?.provider || 'MOCK_ENTERPRISE';
    Logger.info(`[OCRService] Executing OCR workflow with provider: ${selectedProvider}`);

    // Step 1: Select OCR provider & run raw engine OCR
    const engine = this.engineFactory.getEngine(selectedProvider);
    const rawResult = await engine.processDocument(input, {
      title: options?.title,
      language: options?.language,
      script: options?.script,
      ...(options?.options || {})
    });

    const rawDoc = rawResult.document;

    // Step 2, 3, 4, 5: Layout Analysis, Reading Order, Language & Script Detection per Page
    const processedPages: OCRPage[] = [];

    for (const rawPage of rawDoc.pages) {
      // 1. Layout Analysis
      const layout = LayoutAnalyzer.analyzePageLayout(rawPage);

      // 2. Reading Order Analysis
      const orderedBlocks = ReadingOrderAnalyzer.sortBlocksByReadingOrder(layout.blocks, layout.columnCount);

      // 3. Language & Script Detection across page text
      const fullText = orderedBlocks.map(b => b.text).join('\n');
      const langRes = LanguageDetector.detectLanguage(fullText);
      const scriptRes = ScriptDetector.detectScript(fullText);

      processedPages.push(new OCRPage({
        ...rawPage.toJSON(),
        blocks: orderedBlocks,
        language: langRes.primaryLanguage,
        script: scriptRes.primaryScript
      }));
    }

    const enhancedDoc = new OCRDocument({
      ...rawDoc.toJSON(),
      pages: processedPages,
      primaryLanguage: processedPages[0]?.language ?? 'en',
      primaryScript: processedPages[0]?.script ?? 'Latin'
    });

    const finalResult = new OCRResult({
      ...rawResult.toJSON(),
      document: enhancedDoc
    });

    // Step 6: Document Reconstruction -> StructuredDocument
    const structuredDocument = DocumentReconstructor.reconstructDocument(enhancedDoc);

    // Step 7: OCR Quality Validation -> OCRQualityReport
    const qualityReport = OCRQualityValidator.validateDocument(enhancedDoc);

    Logger.info(`[OCRService] Workflow complete. Pages: ${enhancedDoc.totalPages}, Avg Conf: ${qualityReport.averageConfidence}, Acceptable: ${qualityReport.isAcceptable}`);

    return Object.freeze({
      structuredDocument,
      ocrResult: finalResult,
      qualityReport
    });
  }

  public getEngineFactory(): OCREngineFactory {
    return this.engineFactory;
  }
}

export const ocrService = OCRService.getInstance();
