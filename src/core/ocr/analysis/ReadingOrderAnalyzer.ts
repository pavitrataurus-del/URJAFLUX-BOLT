import { OCRBlock } from '../models/OCRBlock';
import { Logger } from '../../utils/logger';

export class ReadingOrderAnalyzer {
  public static sortBlocksByReadingOrder(
    blocks: readonly OCRBlock[],
    columnCount = 1
  ): readonly OCRBlock[] {
    Logger.info(`[ReadingOrderAnalyzer] Sorting ${blocks.length} blocks for columnCount=${columnCount}`);

    if (blocks.length <= 1) {
      return Object.freeze([...blocks]);
    }

    const mutableBlocks = [...blocks];

    if (columnCount === 2) {
      // Sort two-column layout:
      // 1. Headers first
      // 2. Full-width blocks spanning top
      // 3. Left column blocks (top to bottom)
      // 4. Right column blocks (top to bottom)
      // 5. Full-width blocks at bottom
      // 6. Footers last
      mutableBlocks.sort((a, b) => {
        // Headers first
        if (a.blockType === 'HEADER' && b.blockType !== 'HEADER') return -1;
        if (b.blockType === 'HEADER' && a.blockType !== 'HEADER') return 1;

        // Footers last
        if (a.blockType === 'FOOTER' && b.blockType !== 'FOOTER') return 1;
        if (b.blockType === 'FOOTER' && a.blockType !== 'FOOTER') return -1;

        const colA = a.columnId ?? 0;
        const colB = b.columnId ?? 0;

        if (colA !== colB) {
          return colA - colB;
        }

        // Within same column, sort top to bottom
        return a.boundingBox.y - b.boundingBox.y;
      });
    } else {
      // Single column or standard layout: top to bottom, left to right
      mutableBlocks.sort((a, b) => {
        if (a.blockType === 'HEADER' && b.blockType !== 'HEADER') return -1;
        if (b.blockType === 'HEADER' && a.blockType !== 'HEADER') return 1;
        if (a.blockType === 'FOOTER' && b.blockType !== 'FOOTER') return 1;
        if (b.blockType === 'FOOTER' && a.blockType !== 'FOOTER') return -1;

        const verticalDiff = a.boundingBox.y - b.boundingBox.y;
        if (Math.abs(verticalDiff) > 10) {
          return verticalDiff;
        }
        return a.boundingBox.x - b.boundingBox.x;
      });
    }

    // Re-assign reading order indices
    const ordered = mutableBlocks.map((block, idx) => {
      return new OCRBlock({
        ...block.toJSON(),
        readingOrderIndex: idx
      });
    });

    return Object.freeze(ordered);
  }
}
