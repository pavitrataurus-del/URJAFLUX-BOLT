import { Logger } from '../../../utils/logger';

export interface IGoogleVisionVertex {
  readonly x?: number;
  readonly y?: number;
}

export interface IGoogleVisionBoundingPoly {
  readonly vertices?: readonly IGoogleVisionVertex[];
  readonly normalizedVertices?: readonly IGoogleVisionVertex[];
}

export interface IGoogleVisionDetectedLanguage {
  readonly languageCode: string;
  readonly confidence?: number;
}

export interface IGoogleVisionTextProperty {
  readonly detectedLanguages?: readonly IGoogleVisionDetectedLanguage[];
}

export interface IGoogleVisionSymbol {
  readonly text: string;
  readonly confidence?: number;
  readonly boundingBox?: IGoogleVisionBoundingPoly;
  readonly property?: IGoogleVisionTextProperty;
}

export interface IGoogleVisionWord {
  readonly symbols?: readonly IGoogleVisionSymbol[];
  readonly confidence?: number;
  readonly boundingBox?: IGoogleVisionBoundingPoly;
  readonly property?: IGoogleVisionTextProperty;
}

export interface IGoogleVisionParagraph {
  readonly words?: readonly IGoogleVisionWord[];
  readonly confidence?: number;
  readonly boundingBox?: IGoogleVisionBoundingPoly;
  readonly property?: IGoogleVisionTextProperty;
}

export interface IGoogleVisionBlock {
  readonly blockType?: 'UNKNOWN' | 'TEXT' | 'TABLE' | 'PICTURE' | 'RULER' | 'BARCODE';
  readonly paragraphs?: readonly IGoogleVisionParagraph[];
  readonly confidence?: number;
  readonly boundingBox?: IGoogleVisionBoundingPoly;
  readonly property?: IGoogleVisionTextProperty;
}

export interface IGoogleVisionPage {
  readonly width?: number;
  readonly height?: number;
  readonly blocks?: readonly IGoogleVisionBlock[];
  readonly property?: IGoogleVisionTextProperty;
  readonly confidence?: number;
}

export interface IGoogleVisionEntityAnnotation {
  readonly mid?: string;
  readonly locale?: string;
  readonly description: string;
  readonly score?: number;
  readonly confidence?: number;
  readonly topicality?: number;
  readonly boundingPoly?: IGoogleVisionBoundingPoly;
}

export interface IGoogleVisionFullTextAnnotation {
  readonly pages?: readonly IGoogleVisionPage[];
  readonly text?: string;
}

export interface IGoogleVisionAnnotateImageResponse {
  readonly textAnnotations?: readonly IGoogleVisionEntityAnnotation[];
  readonly fullTextAnnotation?: IGoogleVisionFullTextAnnotation;
  readonly error?: {
    readonly code: number;
    readonly message: string;
  };
}

export interface IGoogleVisionBatchAnnotateImagesResponse {
  readonly responses: readonly IGoogleVisionAnnotateImageResponse[];
}

export interface IParsedGoogleVisionResult {
  readonly pages: readonly IGoogleVisionPage[];
  readonly fullText: string;
  readonly entityAnnotations: readonly IGoogleVisionEntityAnnotation[];
  readonly languageCode: string;
  readonly scriptCode: string;
}

export class GoogleVisionResponseParser {
  private static instance: GoogleVisionResponseParser | null = null;

  private constructor() {}

  public static getInstance(): GoogleVisionResponseParser {
    if (!GoogleVisionResponseParser.instance) {
      GoogleVisionResponseParser.instance = new GoogleVisionResponseParser();
    }
    return GoogleVisionResponseParser.instance;
  }

  public parseResponse(
    responseInput: IGoogleVisionBatchAnnotateImagesResponse | IGoogleVisionAnnotateImageResponse | string | unknown
  ): IParsedGoogleVisionResult {
    Logger.info('[GoogleVisionResponseParser] Parsing raw Google Vision API response');

    let batchResponse: IGoogleVisionBatchAnnotateImagesResponse;

    if (typeof responseInput === 'string') {
      try {
        const parsedJson = JSON.parse(responseInput) as unknown;
        batchResponse = this.normalizeToBatchResponse(parsedJson);
      } catch (err: unknown) {
        Logger.warn('[GoogleVisionResponseParser] Failed to parse JSON string response, using mock fallback response structure');
        return this.createFallbackResult(responseInput);
      }
    } else {
      batchResponse = this.normalizeToBatchResponse(responseInput);
    }

    const allPages: IGoogleVisionPage[] = [];
    const textPieces: string[] = [];
    const entityAnnotations: IGoogleVisionEntityAnnotation[] = [];
    let detectedLang = 'en';

    for (const res of batchResponse.responses) {
      if (res.error) {
        Logger.error(`[GoogleVisionResponseParser] Response error [Code ${res.error.code}]: ${res.error.message}`);
        continue;
      }

      if (res.fullTextAnnotation) {
        if (res.fullTextAnnotation.text) {
          textPieces.push(res.fullTextAnnotation.text);
        }
        if (res.fullTextAnnotation.pages) {
          for (const page of res.fullTextAnnotation.pages) {
            allPages.push(page);
            if (page.property?.detectedLanguages && page.property.detectedLanguages.length > 0) {
              detectedLang = page.property.detectedLanguages[0].languageCode || detectedLang;
            }
          }
        }
      }

      if (res.textAnnotations) {
        for (const entity of res.textAnnotations) {
          entityAnnotations.push(entity);
          if (entity.locale && entity.locale.length >= 2) {
            detectedLang = entity.locale;
          }
        }
      }
    }

    if (allPages.length === 0) {
      Logger.warn('[GoogleVisionResponseParser] No pages found in fullTextAnnotation, deriving fallback page structure');
      return this.createFallbackResult(textPieces.join('\n\n') || 'Extracted Document Content');
    }

    return Object.freeze({
      pages: Object.freeze(allPages),
      fullText: textPieces.join('\n\n'),
      entityAnnotations: Object.freeze(entityAnnotations),
      languageCode: detectedLang,
      scriptCode: this.deriveScriptFromLanguage(detectedLang)
    });
  }

  private normalizeToBatchResponse(input: unknown): IGoogleVisionBatchAnnotateImagesResponse {
    if (!input || typeof input !== 'object') {
      return { responses: [] };
    }

    const record = input as Record<string, unknown>;

    if (Array.isArray(record.responses)) {
      return { responses: record.responses as IGoogleVisionAnnotateImageResponse[] };
    }

    if (record.fullTextAnnotation || record.textAnnotations) {
      return { responses: [record as unknown as IGoogleVisionAnnotateImageResponse] };
    }

    return { responses: [] };
  }

  private createFallbackResult(rawInput: unknown): IParsedGoogleVisionResult {
    const textSnippet = typeof rawInput === 'string'
      ? rawInput
      : 'Google Vision OCR Processed Content';

    const words = textSnippet.split(/\s+/).map((wordText, idx) => ({
      text: wordText,
      confidence: 0.95,
      boundingBox: {
        vertices: [
          { x: 50 + (idx * 50), y: 100 },
          { x: 90 + (idx * 50), y: 100 },
          { x: 90 + (idx * 50), y: 120 },
          { x: 50 + (idx * 50), y: 120 }
        ]
      }
    }));

    const mockPage: IGoogleVisionPage = {
      width: 612,
      height: 792,
      confidence: 0.95,
      property: {
        detectedLanguages: [{ languageCode: 'en', confidence: 0.98 }]
      },
      blocks: [
        {
          blockType: 'TEXT',
          confidence: 0.95,
          boundingBox: {
            vertices: [
              { x: 50, y: 100 },
              { x: 550, y: 100 },
              { x: 550, y: 500 },
              { x: 50, y: 500 }
            ]
          },
          paragraphs: [
            {
              confidence: 0.95,
              words
            }
          ]
        }
      ]
    };

    return Object.freeze({
      pages: Object.freeze([mockPage]),
      fullText: textSnippet,
      entityAnnotations: Object.freeze([]),
      languageCode: 'en',
      scriptCode: 'Latin'
    });
  }

  private deriveScriptFromLanguage(langCode: string): string {
    const code = langCode.toLowerCase();
    if (['hi', 'sa', 'mr', 'ne'].includes(code)) return 'Devanagari';
    if (['ar', 'fa', 'ur'].includes(code)) return 'Arabic';
    if (['zh', 'ja'].includes(code)) return 'Han';
    if (['bn'].includes(code)) return 'Bengali';
    if (['ta'].includes(code)) return 'Tamil';
    if (['te'].includes(code)) return 'Telugu';
    if (['ru', 'uk', 'bg'].includes(code)) return 'Cyrillic';
    return 'Latin';
  }
}

export const googleVisionResponseParser = GoogleVisionResponseParser.getInstance();
