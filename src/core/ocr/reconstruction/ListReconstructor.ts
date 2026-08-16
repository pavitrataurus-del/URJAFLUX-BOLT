import { ParagraphNode, NodeType } from '../../knowledge_parsing/types/document.types';
import { OCRBlock } from '../models/OCRBlock';
import { Logger } from '../../utils/logger';

export class ListReconstructor {
  public static isListCandidate(block: OCRBlock): boolean {
    if (block.blockType === 'LIST') return true;

    const firstLineText = block.lines[0]?.text.trim() || '';
    // Bullet / Number pattern match: e.g. "1.", "a)", "•", "-", "*", Devanagari "१."
    return /^([\u2022\u25e6\u25aa\*\-\•]|(\d+|[\u0966-\u096f]+|[a-zA-Z]|[i|v|x|I|V|X]+)[\.\)])\s+/.test(firstLineText);
  }

  public static reconstructListParagraphs(
    block: OCRBlock,
    startOrderIndex: number,
    pageNumber: number
  ): readonly ParagraphNode[] {
    Logger.info(`[ListReconstructor] Reconstructing list for blockId: ${block.blockId}`);

    const nodes: ParagraphNode[] = [];
    let currentIndex = startOrderIndex;

    for (const line of block.lines) {
      const lineText = line.text.trim();
      if (lineText.length === 0) continue;

      nodes.push(Object.freeze({
        id: `list_item_${line.lineId}`,
        type: NodeType.PARAGRAPH,
        orderIndex: currentIndex++,
        pageNumber,
        text: lineText,
        boundingBox: line.boundingBox
      }));
    }

    if (nodes.length === 0) {
      nodes.push(Object.freeze({
        id: `list_block_${block.blockId}`,
        type: NodeType.PARAGRAPH,
        orderIndex: startOrderIndex,
        pageNumber,
        text: block.text.trim(),
        boundingBox: block.boundingBox
      }));
    }

    return Object.freeze(nodes);
  }
}
