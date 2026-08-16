import { HeadingNode, NodeType } from '../../knowledge_parsing/types/document.types';
import { OCRBlock } from '../models/OCRBlock';
import { Logger } from '../../utils/logger';

export class HeadingReconstructor {
  public static isHeadingCandidate(block: OCRBlock): boolean {
    const text = block.text.trim();
    if (text.length === 0 || text.length > 200) return false;

    // Check if block type is explicit HEADING
    if (block.blockType === 'HEADING') return true;

    // Check if lines are bold or have larger font size
    const hasBold = block.lines.some(l => l.words.some(w => w.isBold));
    const isShort = block.lines.length <= 2 && text.length < 120;
    const isUppercase = text === text.toUpperCase() && /[A-Z]/.test(text);

    // Devanagari heading markers
    const hasDevanagariHeadingMarker = /^(अध्याय|भाग|खण्ड|परिच्छेद|प्रकरण|CHAPTER|SECTION|HEADING)\b/i.test(text) ||
      /^(\d+|[I|V|X]+|\([0-9\u0966-\u096F]+\))\.\s+/.test(text);

    return (isShort && (hasBold || isUppercase)) || hasDevanagariHeadingMarker;
  }

  public static reconstructHeading(
    block: OCRBlock,
    orderIndex: number,
    pageNumber: number,
    levelOverride?: number
  ): HeadingNode {
    Logger.info(`[HeadingReconstructor] Reconstructing heading for blockId: ${block.blockId}`);

    const text = block.text.replace(/\s+/g, ' ').trim();
    let level = levelOverride || 2;

    if (!levelOverride) {
      if (/^(CHAPTER|अध्याय|भाग)\b/i.test(text) || text.length < 30) {
        level = 1;
      } else if (text.length < 60) {
        level = 2;
      } else {
        level = 3;
      }
    }

    return Object.freeze({
      id: `hdg_${block.blockId}`,
      type: NodeType.HEADING,
      orderIndex,
      pageNumber,
      level: Math.min(6, Math.max(1, level)),
      text,
      boundingBox: block.boundingBox
    });
  }
}
