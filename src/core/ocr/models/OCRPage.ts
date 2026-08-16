import { OCRConfidence } from './OCRConfidence';
import { OCRBlock } from './OCRBlock';
import { OCRLine } from './OCRLine';
import { OCRWord } from './OCRWord';
import { OCRImage } from './OCRImage';
import { OCRTable } from './OCRTable';

export interface IOCRPageData {
  readonly pageNumber: number;
  readonly width: number;
  readonly height: number;
  readonly dpi?: number;
  readonly orientation?: 'PORTRAIT' | 'LANDSCAPE';
  readonly blocks: readonly OCRBlock[];
  readonly lines: readonly OCRLine[];
  readonly words: readonly OCRWord[];
  readonly images: readonly OCRImage[];
  readonly tables: readonly OCRTable[];
  readonly language: string;
  readonly script: string;
  readonly averageConfidence: OCRConfidence;
}

export class OCRPage implements IOCRPageData {
  public readonly pageNumber: number;
  public readonly width: number;
  public readonly height: number;
  public readonly dpi: number;
  public readonly orientation: 'PORTRAIT' | 'LANDSCAPE';
  public readonly blocks: readonly OCRBlock[];
  public readonly lines: readonly OCRLine[];
  public readonly words: readonly OCRWord[];
  public readonly images: readonly OCRImage[];
  public readonly tables: readonly OCRTable[];
  public readonly language: string;
  public readonly script: string;
  public readonly averageConfidence: OCRConfidence;

  constructor(data: {
    pageNumber: number;
    width?: number;
    height?: number;
    dpi?: number;
    orientation?: 'PORTRAIT' | 'LANDSCAPE';
    blocks?: readonly OCRBlock[];
    lines?: readonly OCRLine[];
    words?: readonly OCRWord[];
    images?: readonly OCRImage[];
    tables?: readonly OCRTable[];
    language?: string;
    script?: string;
    averageConfidence?: OCRConfidence;
  }) {
    this.pageNumber = data.pageNumber;
    this.width = data.width ?? 612; // Default letter size width points
    this.height = data.height ?? 792; // Default letter size height points
    this.dpi = data.dpi ?? 300;
    this.orientation = data.orientation || (this.width > this.height ? 'LANDSCAPE' : 'PORTRAIT');
    this.blocks = Object.freeze([...(data.blocks || [])]);
    this.lines = Object.freeze([...(data.lines || [])]);
    this.words = Object.freeze([...(data.words || [])]);
    this.images = Object.freeze([...(data.images || [])]);
    this.tables = Object.freeze([...(data.tables || [])]);
    this.language = data.language || 'en';
    this.script = data.script || 'Latin';

    if (data.averageConfidence) {
      this.averageConfidence = data.averageConfidence;
    } else {
      const confs: OCRConfidence[] = [];
      if (this.blocks.length > 0) {
        confs.push(...this.blocks.map(b => b.confidence));
      } else if (this.lines.length > 0) {
        confs.push(...this.lines.map(l => l.confidence));
      } else if (this.words.length > 0) {
        confs.push(...this.words.map(w => w.confidence));
      }
      this.averageConfidence = OCRConfidence.combine(confs);
    }

    Object.freeze(this);
  }

  public toJSON(): IOCRPageData {
    return {
      pageNumber: this.pageNumber,
      width: this.width,
      height: this.height,
      dpi: this.dpi,
      orientation: this.orientation,
      blocks: this.blocks,
      lines: this.lines,
      words: this.words,
      images: this.images,
      tables: this.tables,
      language: this.language,
      script: this.script,
      averageConfidence: this.averageConfidence
    };
  }
}
