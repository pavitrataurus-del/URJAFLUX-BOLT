import {
  isBlueprintNoiseText,
  isCardinalDirectionMarker,
  isValidBlueprintEntityLabel,
} from "../recognition/ocrLabelPolicy";

export interface OcrWordBox {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrReconstructedLine {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

function wordHeight(w: OcrWordBox): number {
  return Math.max(1, w.bbox.y1 - w.bbox.y0);
}

function wordWidth(w: OcrWordBox): number {
  return Math.max(1, w.bbox.x1 - w.bbox.x0);
}

function wordsShareHorizontalBand(a: OcrWordBox, b: OcrWordBox): boolean {
  const overlapY = Math.min(a.bbox.y1, b.bbox.y1) - Math.max(a.bbox.y0, b.bbox.y0);
  const minH = Math.min(wordHeight(a), wordHeight(b));
  return overlapY >= minH * 0.35;
}

function wordsShareVerticalBand(a: OcrWordBox, b: OcrWordBox): boolean {
  const overlapX = Math.min(a.bbox.x1, b.bbox.x1) - Math.max(a.bbox.x0, b.bbox.x0);
  const minW = Math.min(wordWidth(a), wordWidth(b));
  return overlapX >= minW * 0.35;
}

function mergeBboxes(
  boxes: Array<{ x0: number; y0: number; x1: number; y1: number }>
): { x0: number; y0: number; x1: number; y1: number } {
  return {
    x0: Math.min(...boxes.map((b) => b.x0)),
    y0: Math.min(...boxes.map((b) => b.y0)),
    x1: Math.max(...boxes.map((b) => b.x1)),
    y1: Math.max(...boxes.map((b) => b.y1)),
  };
}

function mergeWordGroup(words: OcrWordBox[]): OcrReconstructedLine {
  const sorted = [...words].sort((a, b) => a.bbox.x0 - b.bbox.x0);
  const text = sorted.map((w) => w.text).join(" ").replace(/\s+/g, " ").trim();
  const confidences = sorted.map((w) => w.confidence);
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  return {
    text,
    confidence: avgConfidence,
    bbox: mergeBboxes(sorted.map((w) => w.bbox)),
  };
}

/**
 * Merge horizontally adjacent words on the same text band (e.g. MASTER + BEDROOM).
 */
export function mergeHorizontalWords(words: OcrWordBox[]): OcrReconstructedLine[] {
  const sorted = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0);
  const used = new Set<number>();
  const lines: OcrReconstructedLine[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;
    const group: OcrWordBox[] = [sorted[i]];
    used.add(i);

    let extended = true;
    while (extended) {
      extended = false;
      const anchor = group[group.length - 1];
      const avgCharWidth = wordWidth(anchor) / Math.max(1, anchor.text.length);
      const maxGap = Math.max(14, avgCharWidth * 1.8);

      for (let j = 0; j < sorted.length; j++) {
        if (used.has(j)) continue;
        const candidate = sorted[j];
        if (!wordsShareHorizontalBand(anchor, candidate)) continue;

        const gap =
          candidate.bbox.x0 >= anchor.bbox.x1
            ? candidate.bbox.x0 - anchor.bbox.x1
            : anchor.bbox.x0 >= candidate.bbox.x1
            ? anchor.bbox.x0 - candidate.bbox.x1
            : 0;

        if (gap <= maxGap) {
          group.push(candidate);
          used.add(j);
          extended = true;
        }
      }
    }

    lines.push(mergeWordGroup(group));
  }

  return lines;
}

/**
 * Merge vertically stacked words (vertical room labels on blueprints).
 */
export function mergeVerticalWords(words: OcrWordBox[]): OcrReconstructedLine[] {
  const sorted = [...words].sort((a, b) => a.bbox.x0 - b.bbox.x0 || a.bbox.y0 - b.bbox.y0);
  const used = new Set<number>();
  const lines: OcrReconstructedLine[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;
    const group: OcrWordBox[] = [sorted[i]];
    used.add(i);

    let extended = true;
    while (extended) {
      extended = false;
      const anchor = group[group.length - 1];
      const avgCharHeight = wordHeight(anchor) / Math.max(1, anchor.text.length);
      const maxGap = Math.max(12, avgCharHeight * 1.6);

      for (let j = 0; j < sorted.length; j++) {
        if (used.has(j)) continue;
        const candidate = sorted[j];
        if (!wordsShareVerticalBand(anchor, candidate)) continue;

        const gap =
          candidate.bbox.y0 >= anchor.bbox.y1
            ? candidate.bbox.y0 - anchor.bbox.y1
            : anchor.bbox.y0 >= candidate.bbox.y1
            ? anchor.bbox.y0 - candidate.bbox.y1
            : 0;

        if (gap <= maxGap) {
          group.push(candidate);
          used.add(j);
          extended = true;
        }
      }
    }

    const sortedGroup = [...group].sort((a, b) => a.bbox.y0 - b.bbox.y0);
    const text = sortedGroup.map((w) => w.text).join(" ").replace(/\s+/g, " ").trim();
    const avgConfidence =
      sortedGroup.reduce((sum, w) => sum + w.confidence, 0) / sortedGroup.length;
    lines.push({
      text,
      confidence: avgConfidence,
      bbox: mergeBboxes(sortedGroup.map((w) => w.bbox)),
    });
  }

  return lines;
}

export function reconstructLinesFromWords(words: OcrWordBox[]): OcrReconstructedLine[] {
  const horizontal = mergeHorizontalWords(words);
  const vertical = mergeVerticalWords(words);
  return dedupeReconstructedLines([...horizontal, ...vertical]);
}

export function dedupeReconstructedLines(lines: OcrReconstructedLine[]): OcrReconstructedLine[] {
  const merged: OcrReconstructedLine[] = [];

  for (const line of lines) {
    const cx = (line.bbox.x0 + line.bbox.x1) / 2;
    const cy = (line.bbox.y0 + line.bbox.y1) / 2;
    const existing = merged.find((m) => {
      const ecx = (m.bbox.x0 + m.bbox.x1) / 2;
      const ecy = (m.bbox.y0 + m.bbox.y1) / 2;
      const dist = Math.hypot(cx - ecx, cy - ecy);
      const sameText = m.text.toLowerCase() === line.text.toLowerCase();
      return sameText && dist < 56;
    });

    if (existing) {
      existing.confidence = Math.max(existing.confidence, line.confidence);
      if (line.text.length > existing.text.length) {
        existing.text = line.text;
      }
    } else {
      merged.push({ ...line, bbox: { ...line.bbox } });
    }
  }

  return merged;
}

export function filterBlueprintOcrLines(lines: OcrReconstructedLine[]): OcrReconstructedLine[] {
  return lines.filter((line) => {
    const text = line.text.trim();
    if (!text) return false;
    if (isBlueprintNoiseText(text)) return false;
    if (isCardinalDirectionMarker(text)) return false;
    if (!isValidBlueprintEntityLabel(text)) return false;
    return true;
  });
}
