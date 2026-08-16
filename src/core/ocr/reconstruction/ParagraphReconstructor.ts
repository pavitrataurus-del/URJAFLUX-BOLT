import { ParagraphNode, NodeType } from '../../knowledge_parsing/types/document.types';
import { OCRBlock } from '../models/OCRBlock';
import { OCRLine } from '../models/OCRLine';
import { Logger } from '../../utils/logger';

export class ParagraphReconstructor {
  public static reconstructParagraph(
    block: OCRBlock,
    orderIndex: number,
    pageNumber: number
  ): ParagraphNode {
    Logger.info(`[ParagraphReconstructor] Reconstructing paragraph for blockId: ${block.blockId}`);

    const cleanedText = this.cleanAndNormalizeText(block.lines);

    return Object.freeze({
      id: `para_${block.blockId}`,
      type: NodeType.PARAGRAPH,
      orderIndex,
      pageNumber,
      text: cleanedText,
      boundingBox: block.boundingBox
    });
  }

  public static cleanAndNormalizeText(lines: readonly OCRLine[]): string {
    if (lines.length === 0) return '';

    let result = '';

    for (let i = 0; i < lines.length; i++) {
      let lineText = lines[i].text.trim();

      // De-hyphenation at end of line (e.g. "docu-" + "ment" -> "document")
      if (lineText.endsWith('-') && i < lines.length - 1) {
        lineText = lineText.slice(0, -1); // Strip hyphen
        result += lineText;
      } else {
        result += (result.length > 0 ? ' ' : '') + lineText;
      }
    }

    // Replace multiple spaces with a single space
    return result.replace(/\s+/g, ' ').trim();
  }
}
