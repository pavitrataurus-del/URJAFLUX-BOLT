import { FootnoteNode, NodeType } from '../../knowledge_parsing/types/document.types';
import { OCRBlock } from '../models/OCRBlock';
import { Logger } from '../../utils/logger';

export class FootnoteReconstructor {
  public static isFootnoteCandidate(block: OCRBlock, pageHeight = 792): boolean {
    if (block.blockType === 'FOOTNOTE') return true;

    const b = block.boundingBox;
    const text = block.text.trim();

    // Bottom 15% of page and starts with number/asterisk or superscript indicator
    const isNearBottom = b.y >= pageHeight * 0.82;
    const hasFootnoteMarker = /^([\*\†\‡\d+]+|[\u0966-\u096f]+)\s+/.test(text);

    return isNearBottom && hasFootnoteMarker;
  }

  public static reconstructFootnote(
    block: OCRBlock,
    orderIndex: number,
    pageNumber: number
  ): FootnoteNode {
    Logger.info(`[FootnoteReconstructor] Reconstructing footnote for blockId: ${block.blockId}`);

    const text = block.text.replace(/\s+/g, ' ').trim();
    const markerMatch = text.match(/^([\*\†\‡\d+]+|[\u0966-\u096f]+)/);
    const symbol = markerMatch ? markerMatch[1] : '*';
    const content = markerMatch ? text.slice(markerMatch[0].length).trim() : text;

    return Object.freeze({
      id: `fn_${block.blockId}`,
      type: NodeType.FOOTNOTE,
      orderIndex,
      pageNumber,
      symbol,
      text: content,
      boundingBox: block.boundingBox
    });
  }
}
