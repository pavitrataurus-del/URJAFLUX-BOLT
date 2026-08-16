import { OCRConfidence } from './OCRConfidence';
import { IOCRBoundingBox } from './OCRWord';
import { OCRLine } from './OCRLine';

export type OCRBlockType =
  | 'PARAGRAPH'
  | 'HEADING'
  | 'TABLE'
  | 'LIST'
  | 'IMAGE'
  | 'FOOTNOTE'
  | 'HEADER'
  | 'FOOTER'
  | 'UNKNOWN';

export interface IOCRBlockData {
  readonly blockId: string;
  readonly blockType: OCRBlockType;
  readonly lines: readonly OCRLine[];
  readonly text: string;
  readonly confidence: OCRConfidence;
  readonly boundingBox: IOCRBoundingBox;
  readonly readingOrderIndex: number;
  readonly columnId?: number;
  readonly language?: string;
  readonly script?: string;
}

export class OCRBlock implements IOCRBlockData {
  public readonly blockId: string;
  public readonly blockType: OCRBlockType;
  public readonly lines: readonly OCRLine[];
  public readonly text: string;
  public readonly confidence: OCRConfidence;
  public readonly boundingBox: IOCRBoundingBox;
  public readonly readingOrderIndex: number;
  public readonly columnId?: number;
  public readonly language?: string;
  public readonly script?: string;

  constructor(data: {
    blockId?: string;
    blockType?: OCRBlockType;
    lines: readonly OCRLine[];
    text?: string;
    confidence?: OCRConfidence;
    boundingBox?: IOCRBoundingBox;
    readingOrderIndex?: number;
    columnId?: number;
    language?: string;
    script?: string;
  }) {
    this.blockId = data.blockId || `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.blockType = data.blockType || 'PARAGRAPH';
    this.lines = Object.freeze([...data.lines]);
    this.text = data.text !== undefined ? data.text : this.lines.map(l => l.text).join('\n');
    this.readingOrderIndex = data.readingOrderIndex ?? 0;
    this.columnId = data.columnId;
    this.language = data.language;
    this.script = data.script;

    if (data.confidence) {
      this.confidence = data.confidence;
    } else {
      this.confidence = OCRConfidence.combine(this.lines.map(l => l.confidence));
    }

    if (data.boundingBox) {
      this.boundingBox = Object.freeze({ ...data.boundingBox });
    } else {
      this.boundingBox = this.calculateBoundingBox(this.lines);
    }

    Object.freeze(this);
  }

  private calculateBoundingBox(lines: readonly OCRLine[]): IOCRBoundingBox {
    if (lines.length === 0) {
      return Object.freeze({ x: 0, y: 0, width: 0, height: 0 });
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const l of lines) {
      const b = l.boundingBox;
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

  public toJSON(): IOCRBlockData {
    return {
      blockId: this.blockId,
      blockType: this.blockType,
      lines: this.lines,
      text: this.text,
      confidence: this.confidence,
      boundingBox: this.boundingBox,
      readingOrderIndex: this.readingOrderIndex,
      columnId: this.columnId,
      language: this.language,
      script: this.script
    };
  }
}
