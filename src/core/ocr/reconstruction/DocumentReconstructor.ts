import { StructuredDocument } from './StructuredDocument';
import { HeadingReconstructor } from './HeadingReconstructor';
import { ParagraphReconstructor } from './ParagraphReconstructor';
import { TableReconstructor } from './TableReconstructor';
import { ListReconstructor } from './ListReconstructor';
import { FootnoteReconstructor } from './FootnoteReconstructor';
import { OCRDocument } from '../models/OCRDocument';
import { OCRPage } from '../models/OCRPage';
import { ReadingOrderAnalyzer } from '../analysis/ReadingOrderAnalyzer';
import { LayoutAnalyzer } from '../analysis/LayoutAnalyzer';
import {
  PageNode,
  SectionNode,
  ChapterNode,
  BaseNode,
  NodeType,
  ImageReferenceNode
} from '../../knowledge_parsing/types/document.types';
import { Logger } from '../../utils/logger';

export class DocumentReconstructor {
  public static reconstructDocument(ocrDoc: OCRDocument): StructuredDocument {
    Logger.info(`[DocumentReconstructor] Reconstructing documentId: ${ocrDoc.documentId}`);

    const pageNodes: PageNode[] = [];
    const sections: SectionNode[] = [];
    let globalOrderIndex = 0;

    for (const page of ocrDoc.pages) {
      const pageResult = this.reconstructPage(page, globalOrderIndex, ocrDoc.pages.length);
      pageNodes.push(pageResult.pageNode);
      globalOrderIndex = pageResult.nextOrderIndex;
    }

    // Organize reconstructed nodes into Sections / Chapters
    const allNodes = pageNodes.flatMap(p => p.nodes);
    let currentSectionTitle = 'General Content';
    let currentSectionNodes: BaseNode[] = [];
    let sectionIdx = 0;

    for (const node of allNodes) {
      if (node.type === NodeType.HEADING) {
        if (currentSectionNodes.length > 0) {
          sections.push(Object.freeze({
            id: `sec_${sectionIdx++}`,
            type: NodeType.SECTION,
            title: currentSectionTitle,
            level: 1,
            orderIndex: currentSectionNodes[0]?.orderIndex ?? 0,
            nodes: Object.freeze([...currentSectionNodes]) as any
          }));
          currentSectionNodes = [];
        }
        currentSectionTitle = (node as any).text || 'Section';
      }
      currentSectionNodes.push(node);
    }

    if (currentSectionNodes.length > 0) {
      sections.push(Object.freeze({
        id: `sec_${sectionIdx++}`,
        type: NodeType.SECTION,
        title: currentSectionTitle,
        level: 1,
        orderIndex: currentSectionNodes[0]?.orderIndex ?? 0,
        nodes: Object.freeze([...currentSectionNodes]) as any
      }));
    }

    return new StructuredDocument({
      documentId: ocrDoc.documentId,
      title: ocrDoc.title,
      language: ocrDoc.primaryLanguage,
      pageCount: ocrDoc.totalPages,
      pages: pageNodes,
      unassignedSections: sections
    });
  }

  public static reconstructPage(
    page: OCRPage,
    startOrderIndex: number,
    totalPages = 1
  ): { pageNode: PageNode; nextOrderIndex: number } {
    Logger.info(`[DocumentReconstructor] Reconstructing page ${page.pageNumber}`);

    // Run Layout Analysis & Reading Order Analysis
    const layout = LayoutAnalyzer.analyzePageLayout(page);
    const orderedBlocks = ReadingOrderAnalyzer.sortBlocksByReadingOrder(layout.blocks, layout.columnCount);

    const nodes: BaseNode[] = [];
    let orderIndex = startOrderIndex;

    // Process Tables if present on page
    for (const tbl of page.tables) {
      nodes.push(TableReconstructor.reconstructTableFromModel(tbl, orderIndex++, page.pageNumber));
    }

    // Process Images if present on page
    for (const img of page.images) {
      nodes.push(Object.freeze({
        id: `img_${img.imageId}`,
        type: NodeType.IMAGE_REF,
        orderIndex: orderIndex++,
        pageNumber: page.pageNumber,
        imageId: img.imageId,
        altText: img.altText || img.captionText || 'Scanned Document Image',
        caption: img.captionText,
        mimeType: img.mimeType || 'image/png',
        boundingBox: img.boundingBox
      } as ImageReferenceNode));
    }

    // Process Blocks
    for (const block of orderedBlocks) {
      if (block.blockType === 'HEADER' || block.blockType === 'FOOTER') {
        // Headers and footers can be recorded or skipped according to layout preferences
        continue;
      }

      if (FootnoteReconstructor.isFootnoteCandidate(block, page.height)) {
        nodes.push(FootnoteReconstructor.reconstructFootnote(block, orderIndex++, page.pageNumber));
      } else if (HeadingReconstructor.isHeadingCandidate(block)) {
        nodes.push(HeadingReconstructor.reconstructHeading(block, orderIndex++, page.pageNumber));
      } else if (ListReconstructor.isListCandidate(block)) {
        const listItems = ListReconstructor.reconstructListParagraphs(block, orderIndex, page.pageNumber);
        nodes.push(...listItems);
        orderIndex += listItems.length;
      } else if (block.blockType === 'TABLE') {
        nodes.push(TableReconstructor.reconstructTableFromBlock(block, orderIndex++, page.pageNumber));
      } else {
        nodes.push(ParagraphReconstructor.reconstructParagraph(block, orderIndex++, page.pageNumber));
      }
    }

    const pageNode: PageNode = Object.freeze({
      id: `page_${page.pageNumber}`,
      type: NodeType.PAGE,
      orderIndex: startOrderIndex,
      pageNumber: page.pageNumber,
      nodes: Object.freeze(nodes)
    });

    return {
      pageNode,
      nextOrderIndex: orderIndex
    };
  }
}
