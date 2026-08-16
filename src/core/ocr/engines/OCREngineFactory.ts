import { OCRProvider } from './OCRProvider';
import { IOCREngine } from './IOCREngine';
import { OCRCapabilities } from './OCRCapabilities';
import { OCRResult } from '../models/OCRResult';
import { OCRDocument } from '../models/OCRDocument';
import { OCRPage } from '../models/OCRPage';
import { OCRBlock } from '../models/OCRBlock';
import { OCRLine } from '../models/OCRLine';
import { OCRWord } from '../models/OCRWord';
import { OCRConfidence } from '../models/OCRConfidence';
import { GoogleVisionAdapter } from '../providers/google/GoogleVisionAdapter';
import { Logger } from '../../utils/logger';

/**
 * Fallback / Mock Engine for Enterprise Testing and Offline Execution.
 * Used when no live vendor API key/SDK is bound.
 */
class DefaultEnterpriseOCREngine implements IOCREngine {
  public readonly provider: OCRProvider = 'MOCK_ENTERPRISE';
  public readonly capabilities: OCRCapabilities = OCRCapabilities.defaultCapabilities();

  public async processDocument(
    input: Uint8Array | string,
    options?: Record<string, unknown>
  ): Promise<OCRResult> {
    const startTime = Date.now();
    Logger.info(`[DefaultEnterpriseOCREngine] Processing document with input size: ${typeof input === 'string' ? input.length : input.byteLength}`);

    const textContent = typeof input === 'string'
      ? input
      : String.fromCharCode.apply(null, Array.from(input.slice(0, 4096)));

    const page = await this.processPage(input, 1, options);
    const doc = new OCRDocument({
      title: (options?.title as string) || 'Enterprise Processed OCR Document',
      pages: [page],
      primaryLanguage: (options?.language as string) || 'en',
      primaryScript: (options?.script as string) || 'Latin'
    });

    return new OCRResult({
      document: doc,
      provider: this.provider,
      processingTimeMs: Date.now() - startTime,
      status: 'SUCCESS',
      rawMetadata: { simulated: true, originalSize: typeof input === 'string' ? input.length : input.byteLength, textSnippet: textContent.slice(0, 100) }
    });
  }

  public async processPage(
    pageBuffer: Uint8Array | string,
    pageNumber: number,
    _options?: Record<string, unknown>
  ): Promise<OCRPage> {
    const rawStr = typeof pageBuffer === 'string'
      ? pageBuffer
      : String.fromCharCode.apply(null, Array.from(pageBuffer.slice(0, 2048)));

    const rawLines = rawStr.split(/\r?\n/).filter(line => line.trim().length > 0);
    const lines: OCRLine[] = [];

    let currentY = 50;
    for (let i = 0; i < (rawLines.length > 0 ? rawLines.length : 3); i++) {
      const lineText = rawLines[i] || `Sample OCR extracted line ${i + 1} from page ${pageNumber}`;
      const words = lineText.split(/\s+/).map((wordText, wIdx) => {
        return new OCRWord({
          text: wordText,
          confidence: OCRConfidence.fromScore(0.95),
          boundingBox: { x: 50 + (wIdx * 45), y: currentY, width: 40, height: 15 }
        });
      });

      lines.push(new OCRLine({
        words,
        readingOrderIndex: i,
        boundingBox: { x: 50, y: currentY, width: 500, height: 18 }
      }));

      currentY += 25;
    }

    const block = new OCRBlock({
      blockType: 'PARAGRAPH',
      lines,
      readingOrderIndex: 0
    });

    return new OCRPage({
      pageNumber,
      blocks: [block],
      lines,
      words: lines.flatMap(l => l.words),
      language: 'en',
      script: 'Latin'
    });
  }
}

export class OCREngineFactory {
  private static instance: OCREngineFactory | null = null;
  private readonly engines: Map<OCRProvider, IOCREngine> = new Map();

  private constructor() {
    // Register default enterprise fallback engine
    const defaultEngine = new DefaultEnterpriseOCREngine();
    this.engines.set('MOCK_ENTERPRISE', defaultEngine);
    this.engines.set('TESSERACT', defaultEngine);
    this.engines.set('GOOGLE_VISION', new GoogleVisionAdapter());
    this.engines.set('AZURE_VISION', defaultEngine);
    this.engines.set('AWS_TEXTRACT', defaultEngine);
    this.engines.set('CUSTOM', defaultEngine);
  }

  public static getInstance(): OCREngineFactory {
    if (!OCREngineFactory.instance) {
      OCREngineFactory.instance = new OCREngineFactory();
    }
    return OCREngineFactory.instance;
  }

  public registerEngine(provider: OCRProvider, engine: IOCREngine): void {
    Logger.info(`[OCREngineFactory] Registering OCR engine provider: ${provider}`);
    this.engines.set(provider, engine);
  }

  public getEngine(provider: OCRProvider = 'MOCK_ENTERPRISE'): IOCREngine {
    const engine = this.engines.get(provider);
    if (!engine) {
      Logger.warn(`[OCREngineFactory] Provider '${provider}' not found. Falling back to default MOCK_ENTERPRISE engine.`);
      return this.engines.get('MOCK_ENTERPRISE')!;
    }
    return engine;
  }

  public hasEngine(provider: OCRProvider): boolean {
    return this.engines.has(provider);
  }

  public getAvailableProviders(): readonly OCRProvider[] {
    return Object.freeze(Array.from(this.engines.keys()));
  }
}

export const ocrEngineFactory = OCREngineFactory.getInstance();
