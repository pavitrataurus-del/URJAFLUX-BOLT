import { OCRDocument } from '../../models/OCRDocument';
import { OCRPage } from '../../models/OCRPage';
import { OCRBlock, OCRBlockType } from '../../models/OCRBlock';
import { OCRLine } from '../../models/OCRLine';
import { OCRWord, IOCRBoundingBox } from '../../models/OCRWord';
import { OCRImage } from '../../models/OCRImage';
import { OCRTable, IOCRTableCellData } from '../../models/OCRTable';
import { OCRConfidence } from '../../models/OCRConfidence';
import {
  IParsedGoogleVisionResult,
  IGoogleVisionPage,
  IGoogleVisionBlock,
  IGoogleVisionParagraph,
  IGoogleVisionWord,
  IGoogleVisionBoundingPoly
} from './GoogleVisionResponseParser';
import { Logger } from '../../../utils/logger';

export class GoogleVisionMapper {
  private static instance: GoogleVisionMapper | null = null;

  private constructor() {}

  public static getInstance(): GoogleVisionMapper {
    if (!GoogleVisionMapper.instance) {
      GoogleVisionMapper.instance = new GoogleVisionMapper();
    }
    return GoogleVisionMapper.instance;
  }

  public mapToVendorIndependentDocument(
    parsedResult: IParsedGoogleVisionResult,
    options?: { readonly documentId?: string; readonly title?: string }
  ): OCRDocument {
    Logger.info('[GoogleVisionMapper] Mapping Google Vision result to vendor-independent OCRDocument');

    const pages: OCRPage[] = [];

    for (let i = 0; i < parsedResult.pages.length; i++) {
      const gPage = parsedResult.pages[i];
      const pageNumber = i + 1;
      pages.push(this.mapToVendorIndependentPage(gPage, pageNumber, parsedResult.languageCode, parsedResult.scriptCode));
    }

    return new OCRDocument({
      documentId: options?.documentId || `gvis_doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: options?.title || 'Google Vision Extracted Document',
      pages,
      primaryLanguage: parsedResult.languageCode,
      primaryScript: parsedResult.scriptCode
    });
  }

  public mapToVendorIndependentPage(
    gPage: IGoogleVisionPage,
    pageNumber: number,
    defaultLanguage = 'en',
    defaultScript = 'Latin'
  ): OCRPage {
    const pageWidth = gPage.width && gPage.width > 0 ? gPage.width : 612;
    const pageHeight = gPage.height && gPage.height > 0 ? gPage.height : 792;

    const pageLang = gPage.property?.detectedLanguages?.[0]?.languageCode || defaultLanguage;

    const blocks: OCRBlock[] = [];
    const allLines: OCRLine[] = [];
    const allWords: OCRWord[] = [];
    const images: OCRImage[] = [];
    const tables: OCRTable[] = [];

    const gBlocks = gPage.blocks || [];

    for (let bIdx = 0; bIdx < gBlocks.length; bIdx++) {
      const gBlock = gBlocks[bIdx];
      const blockBBox = this.extractBoundingBox(gBlock.boundingBox, pageWidth, pageHeight);
      const blockConfidence = typeof gBlock.confidence === 'number'
        ? OCRConfidence.fromScore(gBlock.confidence)
        : OCRConfidence.fromScore(0.95);

      if (gBlock.blockType === 'PICTURE') {
        images.push(new OCRImage({
          imageId: `img_${pageNumber}_${bIdx}_${Date.now()}`,
          boundingBox: blockBBox,
          confidence: blockConfidence,
          mimeType: 'image/jpeg'
        }));
        continue;
      }

      if (gBlock.blockType === 'TABLE') {
        const table = this.mapToVendorIndependentTable(gBlock, pageNumber, bIdx, blockBBox, blockConfidence);
        tables.push(table);
        continue;
      }

      // Handle standard TEXT / PARAGRAPH blocks
      const blockLines: OCRLine[] = [];
      const paragraphs = gBlock.paragraphs || [];

      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const paragraph = paragraphs[pIdx];
        const lineWords: OCRWord[] = [];
        const gWords = paragraph.words || [];

        for (let wIdx = 0; wIdx < gWords.length; wIdx++) {
          const gWord = gWords[wIdx];
          const wordText = this.extractWordText(gWord);
          if (!wordText) continue;

          const wordBBox = this.extractBoundingBox(gWord.boundingBox, pageWidth, pageHeight);
          const wordConfidence = typeof gWord.confidence === 'number'
            ? OCRConfidence.fromScore(gWord.confidence)
            : OCRConfidence.fromScore(0.95);

          const ocrWord = new OCRWord({
            wordId: `w_${pageNumber}_${bIdx}_${pIdx}_${wIdx}`,
            text: wordText,
            confidence: wordConfidence,
            boundingBox: wordBBox,
            language: gWord.property?.detectedLanguages?.[0]?.languageCode || pageLang,
            script: defaultScript
          });

          lineWords.push(ocrWord);
          allWords.push(ocrWord);
        }

        if (lineWords.length > 0) {
          const lineBBox = this.computeUnionBoundingBox(lineWords.map(w => w.boundingBox));
          const line = new OCRLine({
            lineId: `line_${pageNumber}_${bIdx}_${pIdx}`,
            words: lineWords,
            readingOrderIndex: blockLines.length,
            boundingBox: lineBBox
          });
          blockLines.push(line);
          allLines.push(line);
        }
      }

      const blockType: OCRBlockType = gBlock.blockType === 'BARCODE' ? 'UNKNOWN' : 'PARAGRAPH';

      const ocrBlock = new OCRBlock({
        blockId: `blk_${pageNumber}_${bIdx}`,
        blockType,
        lines: blockLines,
        boundingBox: blockBBox,
        confidence: blockConfidence,
        readingOrderIndex: bIdx,
        language: pageLang,
        script: defaultScript
      });

      blocks.push(ocrBlock);
    }

    return new OCRPage({
      pageNumber,
      width: pageWidth,
      height: pageHeight,
      blocks,
      lines: allLines,
      words: allWords,
      images,
      tables,
      language: pageLang,
      script: defaultScript
    });
  }

  private mapToVendorIndependentTable(
    gBlock: IGoogleVisionBlock,
    pageNumber: number,
    bIdx: number,
    boundingBox: IOCRBoundingBox,
    confidence: OCRConfidence
  ): OCRTable {
    const cells: IOCRTableCellData[] = [];
    const paragraphs = gBlock.paragraphs || [];

    let rowIdx = 0;
    let colIdx = 0;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const paragraph = paragraphs[pIdx];
      const text = (paragraph.words || []).map(w => this.extractWordText(w)).filter(Boolean).join(' ');

      cells.push({
        cellId: `cell_${pageNumber}_${bIdx}_${rowIdx}_${colIdx}`,
        rowIndex: rowIdx,
        colIndex: colIdx,
        rowSpan: 1,
        colSpan: 1,
        text: text || 'Table Cell',
        confidence: typeof paragraph.confidence === 'number' ? OCRConfidence.fromScore(paragraph.confidence) : confidence,
        boundingBox: this.extractBoundingBox(paragraph.boundingBox, 612, 792),
        isHeader: rowIdx === 0
      });

      colIdx++;
      if (colIdx >= 3) {
        colIdx = 0;
        rowIdx++;
      }
    }

    const totalRows = Math.max(1, rowIdx + (colIdx > 0 ? 1 : 0));
    const totalCols = Math.max(1, Math.min(cells.length, 3));

    return new OCRTable({
      tableId: `tbl_${pageNumber}_${bIdx}`,
      rowCount: totalRows,
      colCount: totalCols,
      cells,
      boundingBox,
      confidence
    });
  }

  private extractWordText(gWord: IGoogleVisionWord): string {
    if (gWord.symbols && gWord.symbols.length > 0) {
      return gWord.symbols.map(s => s.text).join('');
    }
    return '';
  }

  private extractBoundingBox(
    poly: IGoogleVisionBoundingPoly | undefined,
    pageWidth: number,
    pageHeight: number
  ): IOCRBoundingBox {
    if (!poly) {
      return { x: 50, y: 50, width: 200, height: 20 };
    }

    if (poly.vertices && poly.vertices.length > 0) {
      const xs = poly.vertices.map(v => v.x ?? 0);
      const ys = poly.vertices.map(v => v.y ?? 0);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      return {
        x: Math.max(0, minX),
        y: Math.max(0, minY),
        width: Math.max(10, maxX - minX),
        height: Math.max(10, maxY - minY)
      };
    }

    if (poly.normalizedVertices && poly.normalizedVertices.length > 0) {
      const xs = poly.normalizedVertices.map(v => (v.x ?? 0) * pageWidth);
      const ys = poly.normalizedVertices.map(v => (v.y ?? 0) * pageHeight);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      return {
        x: Math.max(0, minX),
        y: Math.max(0, minY),
        width: Math.max(10, maxX - minX),
        height: Math.max(10, maxY - minY)
      };
    }

    return { x: 50, y: 50, width: 200, height: 20 };
  }

  private computeUnionBoundingBox(boxes: readonly IOCRBoundingBox[]): IOCRBoundingBox {
    if (boxes.length === 0) {
      return { x: 0, y: 0, width: 100, height: 15 };
    }

    let minX = boxes[0].x;
    let minY = boxes[0].y;
    let maxX = boxes[0].x + boxes[0].width;
    let maxY = boxes[0].y + boxes[0].height;

    for (let i = 1; i < boxes.length; i++) {
      minX = Math.min(minX, boxes[i].x);
      minY = Math.min(minY, boxes[i].y);
      maxX = Math.max(maxX, boxes[i].x + boxes[i].width);
      maxY = Math.max(maxY, boxes[i].y + boxes[i].height);
    }

    return {
      x: minX,
      y: minY,
      width: Math.max(10, maxX - minX),
      height: Math.max(10, maxY - minY)
    };
  }
}

export const googleVisionMapper = GoogleVisionMapper.getInstance();
