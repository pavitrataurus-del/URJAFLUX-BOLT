import { TableNode, TableCell, NodeType } from '../../knowledge_parsing/types/document.types';
import { OCRTable } from '../models/OCRTable';
import { OCRBlock } from '../models/OCRBlock';
import { Logger } from '../../utils/logger';

export class TableReconstructor {
  public static reconstructTableFromModel(
    ocrTable: OCRTable,
    orderIndex: number,
    pageNumber: number
  ): TableNode {
    Logger.info(`[TableReconstructor] Reconstructing tableId: ${ocrTable.tableId}`);

    const cells: TableCell[] = ocrTable.cells.map(c => Object.freeze({
      rowIndex: c.rowIndex,
      colIndex: c.colIndex,
      content: c.text,
      isHeader: c.isHeader ?? (c.rowIndex === 0)
    }));

    return Object.freeze({
      id: `tbl_${ocrTable.tableId}`,
      type: NodeType.TABLE,
      orderIndex,
      pageNumber,
      caption: ocrTable.caption,
      rowCount: ocrTable.rowCount,
      colCount: ocrTable.colCount,
      cells: Object.freeze(cells),
      boundingBox: ocrTable.boundingBox
    });
  }

  public static reconstructTableFromBlock(
    block: OCRBlock,
    orderIndex: number,
    pageNumber: number
  ): TableNode {
    Logger.info(`[TableReconstructor] Fallback table reconstruction for blockId: ${block.blockId}`);

    // Simple grid layout heuristic from raw lines containing tabular separators (| or tabs or multiple spaces)
    const cells: TableCell[] = [];
    const lines = block.lines;
    const rowCount = lines.length;
    let colCount = 1;

    lines.forEach((line, rIdx) => {
      const parts = line.text.includes('|')
        ? line.text.split('|').map(p => p.trim()).filter(Boolean)
        : line.text.split(/\s{3,}/).map(p => p.trim()).filter(Boolean);

      if (parts.length > colCount) {
        colCount = parts.length;
      }

      parts.forEach((part, cIdx) => {
        cells.push(Object.freeze({
          rowIndex: rIdx,
          colIndex: cIdx,
          content: part,
          isHeader: rIdx === 0
        }));
      });
    });

    return Object.freeze({
      id: `tbl_${block.blockId}`,
      type: NodeType.TABLE,
      orderIndex,
      pageNumber,
      rowCount: Math.max(1, rowCount),
      colCount: Math.max(1, colCount),
      cells: Object.freeze(cells),
      boundingBox: block.boundingBox
    });
  }
}
