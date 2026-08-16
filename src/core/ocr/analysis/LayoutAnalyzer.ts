import { OCRPage } from '../models/OCRPage';
import { OCRBlock, OCRBlockType } from '../models/OCRBlock';
import { OCRLine } from '../models/OCRLine';
import { IOCRBoundingBox } from '../models/OCRWord';
import { Logger } from '../../utils/logger';

export interface IPageLayoutAnalysisData {
  readonly columnCount: number;
  readonly margins: {
    readonly top: number;
    readonly bottom: number;
    readonly left: number;
    readonly right: number;
  };
  readonly headerHeight: number;
  readonly footerHeight: number;
  readonly blocks: readonly OCRBlock[];
  readonly hasTables: boolean;
  readonly hasImages: boolean;
}

export class LayoutAnalyzer {
  public static analyzePageLayout(page: OCRPage): IPageLayoutAnalysisData {
    Logger.info(`[LayoutAnalyzer] Analyzing layout for Page ${page.pageNumber}`);

    const pageWidth = page.width || 612;
    const pageHeight = page.height || 792;

    const headerThreshold = pageHeight * 0.08;
    const footerThreshold = pageHeight * 0.92;

    // Detect margins
    let minX = pageWidth;
    let maxX = 0;
    let minY = pageHeight;
    let maxY = 0;

    for (const line of page.lines) {
      const b = line.boundingBox;
      if (b.x < minX) minX = b.x;
      if (b.x + b.width > maxX) maxX = b.x + b.width;
      if (b.y < minY) minY = b.y;
      if (b.y + b.height > maxY) maxY = b.y + b.height;
    }

    const margins = {
      left: minX < pageWidth ? minX : 36,
      right: maxX > 0 ? Math.max(0, pageWidth - maxX) : 36,
      top: minY < pageHeight ? minY : 36,
      bottom: maxY > 0 ? Math.max(0, pageHeight - maxY) : 36
    };

    // Detect column structures by analyzing line horizontal centers
    const midPoint = pageWidth / 2;
    let leftColCount = 0;
    let rightColCount = 0;
    let fullWidthCount = 0;

    for (const line of page.lines) {
      const b = line.boundingBox;
      if (b.y <= headerThreshold || b.y >= footerThreshold) continue;

      if (b.width > pageWidth * 0.65) {
        fullWidthCount++;
      } else if (b.x + b.width <= midPoint + 20) {
        leftColCount++;
      } else if (b.x >= midPoint - 20) {
        rightColCount++;
      }
    }

    const isTwoColumn = leftColCount >= 3 && rightColCount >= 3 && fullWidthCount <= (leftColCount + rightColCount);
    const columnCount = isTwoColumn ? 2 : 1;

    // Classify and re-group lines into blocks if not already blocked
    const categorizedBlocks: OCRBlock[] = [];

    if (page.blocks.length > 0) {
      for (const existingBlock of page.blocks) {
        let blockType: OCRBlockType = existingBlock.blockType;
        const b = existingBlock.boundingBox;

        if (b.y + b.height <= headerThreshold) {
          blockType = 'HEADER';
        } else if (b.y >= footerThreshold) {
          blockType = 'FOOTER';
        }

        const colId = isTwoColumn ? (b.x + b.width / 2 < midPoint ? 0 : 1) : 0;

        categorizedBlocks.push(new OCRBlock({
          ...existingBlock.toJSON(),
          blockType,
          columnId: colId
        }));
      }
    } else {
      // Group lines into blocks based on vertical gap & column
      let currentLineGroup: OCRLine[] = [];
      let currentCol = 0;
      let lastY = -1;

      for (const line of page.lines) {
        const lineB = line.boundingBox;
        const lineCol = isTwoColumn ? (lineB.x + lineB.width / 2 < midPoint ? 0 : 1) : 0;
        const isHeader = lineB.y + lineB.height <= headerThreshold;
        const isFooter = lineB.y >= footerThreshold;

        const gap = lastY >= 0 ? lineB.y - lastY : 0;

        if (currentLineGroup.length > 0 && (lineCol !== currentCol || gap > 20 || isHeader || isFooter)) {
          categorizedBlocks.push(new OCRBlock({
            lines: currentLineGroup,
            columnId: currentCol,
            blockType: 'PARAGRAPH'
          }));
          currentLineGroup = [];
        }

        currentCol = lineCol;
        lastY = lineB.y + lineB.height;
        currentLineGroup.push(line);
      }

      if (currentLineGroup.length > 0) {
        categorizedBlocks.push(new OCRBlock({
          lines: currentLineGroup,
          columnId: currentCol,
          blockType: 'PARAGRAPH'
        }));
      }
    }

    return Object.freeze({
      columnCount,
      margins: Object.freeze(margins),
      headerHeight: headerThreshold,
      footerHeight: pageHeight - footerThreshold,
      blocks: Object.freeze(categorizedBlocks),
      hasTables: page.tables.length > 0,
      hasImages: page.images.length > 0
    });
  }
}
