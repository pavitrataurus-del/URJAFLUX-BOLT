export type DocumentClassificationType =
  | 'DIGITAL_PDF'
  | 'SCANNED_PDF'
  | 'MIXED_PDF'
  | 'IMAGE_DOCUMENT'
  | 'TEXT_DOCUMENT'
  | 'UNKNOWN';

export interface IDocumentClassificationData {
  readonly classification: DocumentClassificationType;
  readonly confidence: number;
  readonly textDensity: number;
  readonly imageDensity: number;
  readonly hasVectorText: boolean;
  readonly hasEmbeddedImages: boolean;
  readonly pageCount: number;
  readonly analyzedAt: number;
}

export class DocumentClassification implements IDocumentClassificationData {
  public readonly classification: DocumentClassificationType;
  public readonly confidence: number;
  public readonly textDensity: number;
  public readonly imageDensity: number;
  public readonly hasVectorText: boolean;
  public readonly hasEmbeddedImages: boolean;
  public readonly pageCount: number;
  public readonly analyzedAt: number;

  constructor(data?: Partial<IDocumentClassificationData>) {
    this.classification = data?.classification || 'UNKNOWN';
    this.confidence = data?.confidence ?? 1.0;
    this.textDensity = data?.textDensity ?? 0.0;
    this.imageDensity = data?.imageDensity ?? 0.0;
    this.hasVectorText = data?.hasVectorText ?? false;
    this.hasEmbeddedImages = data?.hasEmbeddedImages ?? false;
    this.pageCount = data?.pageCount ?? 1;
    this.analyzedAt = data?.analyzedAt ?? Date.now();

    Object.freeze(this);
  }

  public toJSON(): IDocumentClassificationData {
    return {
      classification: this.classification,
      confidence: this.confidence,
      textDensity: this.textDensity,
      imageDensity: this.imageDensity,
      hasVectorText: this.hasVectorText,
      hasEmbeddedImages: this.hasEmbeddedImages,
      pageCount: this.pageCount,
      analyzedAt: this.analyzedAt
    };
  }
}
