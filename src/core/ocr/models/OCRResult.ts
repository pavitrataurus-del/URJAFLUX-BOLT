import { OCRDocument } from './OCRDocument';
import { OCRProvider } from '../engines/OCRProvider';

export type OCRProcessingStatus = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';

export interface IOCRResultData {
  readonly resultId: string;
  readonly document: OCRDocument;
  readonly provider: OCRProvider;
  readonly processingTimeMs: number;
  readonly rawMetadata?: Record<string, unknown>;
  readonly status: OCRProcessingStatus;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export class OCRResult implements IOCRResultData {
  public readonly resultId: string;
  public readonly document: OCRDocument;
  public readonly provider: OCRProvider;
  public readonly processingTimeMs: number;
  public readonly rawMetadata?: Record<string, unknown>;
  public readonly status: OCRProcessingStatus;
  public readonly errors: readonly string[];
  public readonly warnings: readonly string[];

  constructor(data: {
    resultId?: string;
    document: OCRDocument;
    provider: OCRProvider;
    processingTimeMs: number;
    rawMetadata?: Record<string, unknown>;
    status?: OCRProcessingStatus;
    errors?: readonly string[];
    warnings?: readonly string[];
  }) {
    this.resultId = data.resultId || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.document = data.document;
    this.provider = data.provider;
    this.processingTimeMs = data.processingTimeMs;
    this.rawMetadata = data.rawMetadata ? Object.freeze({ ...data.rawMetadata }) : undefined;
    this.status = data.status || 'SUCCESS';
    this.errors = Object.freeze([...(data.errors || [])]);
    this.warnings = Object.freeze([...(data.warnings || [])]);

    Object.freeze(this);
  }

  public toJSON(): IOCRResultData {
    return {
      resultId: this.resultId,
      document: this.document,
      provider: this.provider,
      processingTimeMs: this.processingTimeMs,
      rawMetadata: this.rawMetadata,
      status: this.status,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}
