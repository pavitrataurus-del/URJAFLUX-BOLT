import { OCRConfidence } from './OCRConfidence';
import { IOCRBoundingBox } from './OCRWord';

export interface IOCRTableCellData {
  readonly cellId: string;
  readonly rowIndex: number;
  readonly colIndex: number;
  readonly rowSpan?: number;
  readonly colSpan?: number;
  readonly text: string;
  readonly confidence: OCRConfidence;
  readonly boundingBox?: IOCRBoundingBox;
  readonly isHeader?: boolean;
}

export interface IOCRTableData {
  readonly tableId: string;
  readonly rowCount: number;
  readonly colCount: number;
  readonly cells: readonly IOCRTableCellData[];
  readonly caption?: string;
  readonly boundingBox: IOCRBoundingBox;
  readonly confidence: OCRConfidence;
}

export class OCRTable implements IOCRTableData {
  public readonly tableId: string;
  public readonly rowCount: number;
  public readonly colCount: number;
  public readonly cells: readonly IOCRTableCellData[];
  public readonly caption?: string;
  public readonly boundingBox: IOCRBoundingBox;
  public readonly confidence: OCRConfidence;

  constructor(data: {
    tableId?: string;
    rowCount: number;
    colCount: number;
    cells: readonly IOCRTableCellData[];
    caption?: string;
    boundingBox: IOCRBoundingBox;
    confidence?: OCRConfidence;
  }) {
    this.tableId = data.tableId || `tbl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.rowCount = data.rowCount;
    this.colCount = data.colCount;
    this.cells = Object.freeze(data.cells.map(c => Object.freeze({
      ...c,
      rowSpan: c.rowSpan ?? 1,
      colSpan: c.colSpan ?? 1,
      isHeader: c.isHeader ?? false
    })));
    this.caption = data.caption;
    this.boundingBox = Object.freeze({ ...data.boundingBox });

    if (data.confidence) {
      this.confidence = data.confidence;
    } else {
      this.confidence = OCRConfidence.combine(this.cells.map(c => c.confidence));
    }

    Object.freeze(this);
  }

  public toJSON(): IOCRTableData {
    return {
      tableId: this.tableId,
      rowCount: this.rowCount,
      colCount: this.colCount,
      cells: this.cells,
      caption: this.caption,
      boundingBox: this.boundingBox,
      confidence: this.confidence
    };
  }
}
