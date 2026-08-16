import { OCRConfidence } from './OCRConfidence';
import { IOCRBoundingBox } from './OCRWord';

export interface IOCRImageData {
  readonly imageId: string;
  readonly boundingBox: IOCRBoundingBox;
  readonly mimeType?: string;
  readonly confidence: OCRConfidence;
  readonly captionText?: string;
  readonly altText?: string;
  readonly width?: number;
  readonly height?: number;
  readonly rawDataRef?: string;
}

export class OCRImage implements IOCRImageData {
  public readonly imageId: string;
  public readonly boundingBox: IOCRBoundingBox;
  public readonly mimeType?: string;
  public readonly confidence: OCRConfidence;
  public readonly captionText?: string;
  public readonly altText?: string;
  public readonly width?: number;
  public readonly height?: number;
  public readonly rawDataRef?: string;

  constructor(data: {
    imageId?: string;
    boundingBox: IOCRBoundingBox;
    mimeType?: string;
    confidence?: OCRConfidence | number;
    captionText?: string;
    altText?: string;
    width?: number;
    height?: number;
    rawDataRef?: string;
  }) {
    this.imageId = data.imageId || `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.boundingBox = Object.freeze({ ...data.boundingBox });
    this.mimeType = data.mimeType || 'image/png';
    this.captionText = data.captionText;
    this.altText = data.altText;
    this.width = data.width;
    this.height = data.height;
    this.rawDataRef = data.rawDataRef;

    if (data.confidence) {
      this.confidence = typeof data.confidence === 'number'
        ? OCRConfidence.fromScore(data.confidence)
        : data.confidence;
    } else {
      this.confidence = OCRConfidence.fromScore(1.0);
    }

    Object.freeze(this);
  }

  public toJSON(): IOCRImageData {
    return {
      imageId: this.imageId,
      boundingBox: this.boundingBox,
      mimeType: this.mimeType,
      confidence: this.confidence,
      captionText: this.captionText,
      altText: this.altText,
      width: this.width,
      height: this.height,
      rawDataRef: this.rawDataRef
    };
  }
}
