import { StructuredDocument } from '../reconstruction/StructuredDocument';
import { OCRDocument } from '../models/OCRDocument';
import {
  ParsedDocument,
  DocumentStructure,
  DocumentStatistics,
  DocumentMetadata,
  BaseNode,
  PageNode,
  SectionNode,
  ChapterNode,
  NodeType
} from '../../knowledge_parsing/types/document.types';
import { Logger } from '../../utils/logger';

export class StructuredDocumentMapper {
  public static mapToParsedDocument(doc: StructuredDocument | OCRDocument): ParsedDocument {
    Logger.info('[StructuredDocumentMapper] Mapping input document to ParsedDocument contract');

    if (doc instanceof StructuredDocument) {
      return doc.toParsedDocument();
    }

    if (doc instanceof OCRDocument) {
      return this.mapOCRDocumentToParsedDocument(doc);
    }

    throw new Error('[StructuredDocumentMapper] Unsupported input type for mapping');
  }

  public static mapOCRDocumentToParsedDocument(ocrDoc: OCRDocument): ParsedDocument {
    Logger.info(`[StructuredDocumentMapper] Mapping OCRDocument (${ocrDoc.documentId}) to ParsedDocument`);

    const pageNodes: PageNode[] = [];
    let globalIndex = 0;
    let totalChars = 0;
    let totalWords = 0;
    let totalParagraphs = 0;
    let totalHeadings = 0;
    let totalTables = 0;
    let totalImages = 0;
    let totalFootnotes = 0;

    for (const ocrPage of ocrDoc.pages) {
      const nodes: BaseNode[] = [];

      for (const block of ocrPage.blocks) {
        if (block.blockType === 'HEADER' || block.blockType === 'FOOTER') {
          continue;
        }

        const blockText = block.text.trim();
        totalChars += blockText.length;
        totalWords += blockText.split(/\s+/).filter(Boolean).length;

        if (block.blockType === 'HEADING') {
          totalHeadings++;
          nodes.push(Object.freeze({
            id: `hdg_${block.blockId}`,
            type: NodeType.HEADING,
            orderIndex: globalIndex++,
            pageNumber: ocrPage.pageNumber,
            level: 2,
            text: blockText,
            boundingBox: block.boundingBox
          }));
        } else if (block.blockType === 'TABLE') {
          totalTables++;
          nodes.push(Object.freeze({
            id: `tbl_${block.blockId}`,
            type: NodeType.TABLE,
            orderIndex: globalIndex++,
            pageNumber: ocrPage.pageNumber,
            rowCount: block.lines.length || 1,
            colCount: 1,
            cells: block.lines.map((l, r) => ({
              rowIndex: r,
              colIndex: 0,
              content: l.text,
              isHeader: r === 0
            })),
            boundingBox: block.boundingBox
          }));
        } else if (block.blockType === 'FOOTNOTE') {
          totalFootnotes++;
          nodes.push(Object.freeze({
            id: `fn_${block.blockId}`,
            type: NodeType.FOOTNOTE,
            orderIndex: globalIndex++,
            pageNumber: ocrPage.pageNumber,
            symbol: '*',
            text: blockText,
            boundingBox: block.boundingBox
          }));
        } else {
          totalParagraphs++;
          nodes.push(Object.freeze({
            id: `para_${block.blockId}`,
            type: NodeType.PARAGRAPH,
            orderIndex: globalIndex++,
            pageNumber: ocrPage.pageNumber,
            text: blockText,
            boundingBox: block.boundingBox
          }));
        }
      }

      for (const img of ocrPage.images) {
        totalImages++;
        nodes.push(Object.freeze({
          id: `img_${img.imageId}`,
          type: NodeType.IMAGE_REF,
          orderIndex: globalIndex++,
          pageNumber: ocrPage.pageNumber,
          imageId: img.imageId,
          altText: img.altText || 'OCR Document Image',
          caption: img.captionText,
          mimeType: img.mimeType || 'image/png',
          boundingBox: img.boundingBox
        }));
      }

      pageNodes.push(Object.freeze({
        id: `page_${ocrPage.pageNumber}`,
        type: NodeType.PAGE,
        orderIndex: pageNodes.length,
        pageNumber: ocrPage.pageNumber,
        nodes: Object.freeze(nodes)
      }));
    }

    const structure: DocumentStructure = Object.freeze({
      chapters: Object.freeze([]),
      unassignedSections: Object.freeze([]),
      pages: Object.freeze(pageNodes)
    });

    const statistics: DocumentStatistics = Object.freeze({
      totalCharacters: totalChars,
      totalWords: totalWords,
      totalParagraphs: totalParagraphs,
      totalHeadings: totalHeadings,
      totalTables: totalTables,
      totalImages: totalImages,
      totalFootnotes: totalFootnotes
    });

    const metadata: DocumentMetadata = Object.freeze({
      title: ocrDoc.title,
      author: 'OCR Extraction Engine',
      language: ocrDoc.primaryLanguage,
      pageCount: ocrDoc.totalPages,
      chapterCount: 0,
      fileSize: 1024 * (ocrDoc.totalPages || 1),
      extension: 'pdf'
    });

    return Object.freeze({
      documentId: ocrDoc.documentId,
      packageHash: `hash_ocr_${Date.now()}`,
      fileName: `${ocrDoc.title || 'ocr_document'}.pdf`,
      metadata,
      structure,
      statistics,
      parsedAt: Date.now()
    });
  }
}
