import { OCRConfidence } from './OCRConfidence';

export interface IOCRBoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation?: number;
  readonly confidence?: number;
}

export interface IOCRWordData {
  readonly wordId: string;
  readonly text: string;
  readonly confidence: OCRConfidence;
  readonly boundingBox: IOCRBoundingBox;
  readonly language?: string;
  readonly script?: string;
  readonly isHandwritten?: boolean;
  readonly isBold?: boolean;
  readonly isItalic?: boolean;
  readonly fontSize?: number;
}

export class OCRWord implements IOCRWordData {
  public readonly wordId: string;
  public readonly text: string;
  public readonly confidence: OCRConfidence;
  public readonly boundingBox: IOCRBoundingBox;
  public readonly language?: string;
  public readonly script?: string;
  public readonly isHandwritten: boolean;
  public readonly isBold: boolean;
  public readonly isItalic: boolean;
  public readonly fontSize?: number;

  constructor(data: {
    wordId?: string;
    text: string;
    confidence: OCRConfidence | number;
    boundingBox: IOCRBoundingBox;
    language?: string;
    script?: string;
    isHandwritten?: boolean;
    isBold?: boolean;
    isItalic?: boolean;
    fontSize?: number;
  }) {
    this.wordId = data.wordId || `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.text = data.text;
    this.confidence = typeof data.confidence === 'number'
      ? OCRConfidence.fromScore(data.confidence, 1, data.confidence < 0.65 ? 1 : 0)
      : data.confidence;
    this.boundingBox = Object.freeze({ ...data.boundingBox });
    this.language = data.language;
    this.script = data.script;
    this.isHandwritten = data.isHandwritten ?? false;
    this.isBold = data.isBold ?? false;
    this.isItalic = data.isItalic ?? false;
    this.fontSize = data.fontSize;

    Object.freeze(this);
  }

  public toJSON(): IOCRWordData {
    return {
      wordId: this.wordId,
      text: this.text,
      confidence: this.confidence,
      boundingBox: this.boundingBox,
      language: this.language,
      script: this.script,
      isHandwritten: this.isHandwritten,
      isBold: this.isBold,
      isItalic: this.isItalic,
      fontSize: this.fontSize
    };
  }
}
