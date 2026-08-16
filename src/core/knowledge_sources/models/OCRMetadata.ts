export type OCRStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

export interface IOCRMetadataData {
  readonly ocrRequired: boolean;
  readonly ocrStatus: OCRStatus;
  readonly ocrLanguage?: string;
  readonly ocrConfidence?: number;
  readonly ocrEngine?: string;
  readonly ocrVersion?: string;
  readonly ocrTimestamp?: number;
  readonly ocrErrors: readonly string[];
  readonly ocrWarnings: readonly string[];
  readonly ocrProcessingTimeMs?: number;
}

export class OCRMetadata implements IOCRMetadataData {
  public readonly ocrRequired: boolean;
  public readonly ocrStatus: OCRStatus;
  public readonly ocrLanguage?: string;
  public readonly ocrConfidence?: number;
  public readonly ocrEngine?: string;
  public readonly ocrVersion?: string;
  public readonly ocrTimestamp?: number;
  public readonly ocrErrors: readonly string[];
  public readonly ocrWarnings: readonly string[];
  public readonly ocrProcessingTimeMs?: number;

  constructor(data?: Partial<IOCRMetadataData>) {
    this.ocrRequired = data?.ocrRequired ?? false;
    this.ocrStatus = data?.ocrStatus || (this.ocrRequired ? 'PENDING' : 'NOT_REQUIRED');
    this.ocrLanguage = data?.ocrLanguage || 'en';
    this.ocrConfidence = data?.ocrConfidence;
    this.ocrEngine = data?.ocrEngine || 'Tesseract-OCR-v5';
    this.ocrVersion = data?.ocrVersion || '5.3.0';
    this.ocrTimestamp = data?.ocrTimestamp;
    this.ocrErrors = Object.freeze([...(data?.ocrErrors || [])]);
    this.ocrWarnings = Object.freeze([...(data?.ocrWarnings || [])]);
    this.ocrProcessingTimeMs = data?.ocrProcessingTimeMs;

    Object.freeze(this);
  }

  public static notRequired(): OCRMetadata {
    return new OCRMetadata({ ocrRequired: false, ocrStatus: 'NOT_REQUIRED' });
  }

  public static required(language = 'en', engine = 'Tesseract-OCR-v5'): OCRMetadata {
    return new OCRMetadata({
      ocrRequired: true,
      ocrStatus: 'PENDING',
      ocrLanguage: language,
      ocrEngine: engine
    });
  }

  public withStatus(status: OCRStatus, errors?: string[], warnings?: string[]): OCRMetadata {
    return new OCRMetadata({
      ...this.toJSON(),
      ocrStatus: status,
      ocrErrors: errors ? errors : this.ocrErrors,
      ocrWarnings: warnings ? warnings : this.ocrWarnings,
      ocrTimestamp: status === 'COMPLETED' || status === 'FAILED' ? Date.now() : this.ocrTimestamp
    });
  }

  public toJSON(): IOCRMetadataData {
    return {
      ocrRequired: this.ocrRequired,
      ocrStatus: this.ocrStatus,
      ocrLanguage: this.ocrLanguage,
      ocrConfidence: this.ocrConfidence,
      ocrEngine: this.ocrEngine,
      ocrVersion: this.ocrVersion,
      ocrTimestamp: this.ocrTimestamp,
      ocrErrors: this.ocrErrors,
      ocrWarnings: this.ocrWarnings,
      ocrProcessingTimeMs: this.ocrProcessingTimeMs
    };
  }
}
