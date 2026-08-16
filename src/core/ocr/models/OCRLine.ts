import { OCRConfidence } from './OCRConfidence';
import { IOCRBoundingBox, OCRWord } from './OCRWord';

export interface IOCRLineData {
  readonly lineId: string;
  readonly words: readonly OCRWord[];
  readonly text: string;
  readonly confidence: OCRConfidence;
  readonly boundingBox: IOCRBoundingBox;
  readonly readingOrderIndex: number;
  readonly isHeader?: boolean;
  readonly isFooter?: boolean;
}

export class OCRLine implements IOCRLineData {
  public readonly lineId: string;
  public readonly words: readonly OCRWord[];
  public readonly text: string;
  public readonly confidence: OCRConfidence;
  public readonly boundingBox: IOCRBoundingBox;
  public readonly readingOrderIndex: number;
  public readonly isHeader: boolean;
  public readonly isFooter: boolean;

  constructor(data: {
    lineId?: string;
    words: readonly OCRWord[];
    text?: string;
    confidence?: OCRConfidence;
    boundingBox?: IOCRBoundingBox;
    readingOrderIndex?: number;
    isHeader?: boolean;
    isFooter?: boolean;
  }) {
    this.lineId = data.lineId || `l_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.words = Object.freeze([...data.words]);
    this.text = data.text !== undefined ? data.text : this.words.map(w => w.text).join(' ');
    this.readingOrderIndex = data.readingOrderIndex ?? 0;
    this.isHeader = data.isHeader ?? false;
    this.isFooter = data.isFooter ?? false;

    if (data.confidence) {
      this.confidence = data.confidence;
    } else {
      this.confidence = OCRConfidence.combine(this.words.map(w => w.confidence));
    }

    if (data.boundingBox) {
      this.boundingBox = Object.freeze({ ...data.boundingBox });
    } else {
      this.boundingBox = this.calculateBoundingBox(this.words);
    }

    Object.freeze(this);
  }

  private calculateBoundingBox(words: readonly OCRWord[]): IOCRBoundingBox {
    if (words.length === 0) {
      return Object.freeze({ x: 0, y: 0, width: 0, height: 0 });
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const w of words) {
      const b = w.boundingBox;
      if (b.x < minX) minX = b.x;
      if (b.y < minY) minY = b.y;
      if (b.x + b.width > maxX) maxX = b.x + b.width;
      if (b.y + b.height > maxY) maxY = b.y + b.height;
    }

    return Object.freeze({
      x: minX === Infinity ? 0 : minX,
      y: minY === Infinity ? 0 : minY,
      width: maxX === -Infinity ? 0 : Math.max(0, maxX - minX),
      height: maxY === -Infinity ? 0 : Math.max(0, maxY - minY)
    });
  }

  public toJSON(): IOCRLineData {
    return {
      lineId: this.lineId,
      words: this.words,
      text: this.text,
      confidence: this.confidence,
      boundingBox: this.boundingBox,
      readingOrderIndex: this.readingOrderIndex,
      isHeader: this.isHeader,
      isFooter: this.isFooter
    };
  }
}
