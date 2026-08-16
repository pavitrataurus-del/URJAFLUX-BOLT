export interface TesseractLineLike {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

function normalizeBbox(raw: unknown): { x0: number; y0: number; x1: number; y1: number } {
  const b = raw as { x0?: number; y0?: number; x1?: number; y1?: number } | null;
  if (!b) return { x0: 0, y0: 0, x1: 0, y1: 0 };
  return {
    x0: b.x0 ?? 0,
    y0: b.y0 ?? 0,
    x1: b.x1 ?? 0,
    y1: b.y1 ?? 0,
  };
}

function pushWord(words: OcrWordLike[], word: { text?: string; confidence?: number; bbox?: unknown }) {
  const text = (word.text || "").trim();
  if (!text) return;
  words.push({
    text,
    confidence: word.confidence ?? 85,
    bbox: normalizeBbox(word.bbox),
  });
}

export interface OcrWordLike {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * Extract word-level boxes from Tesseract page data for line reconstruction.
 */
export function extractTesseractWords(pageData: {
  lines?: Array<{ text?: string; confidence?: number; bbox?: unknown; words?: Array<{ text?: string; confidence?: number; bbox?: unknown }> }>;
  blocks?: unknown[];
}): OcrWordLike[] {
  const words: OcrWordLike[] = [];
  const seen = new Set<string>();

  const addUnique = (word: { text?: string; confidence?: number; bbox?: unknown }) => {
    const text = (word.text || "").trim();
    if (!text) return;
    const bbox = normalizeBbox(word.bbox);
    const key = `${text.toLowerCase()}@${bbox.x0.toFixed(0)},${bbox.y0.toFixed(0)}`;
    if (seen.has(key)) return;
    seen.add(key);
    pushWord(words, word);
  };

  if (pageData.lines?.length) {
    for (const line of pageData.lines) {
      if (line.words?.length) {
        for (const word of line.words) {
          addUnique(word);
        }
      } else if (line.text?.trim()) {
        addUnique(line);
      }
    }
  }

  if (pageData.blocks?.length) {
    for (const block of pageData.blocks as Array<{
      paragraphs?: Array<{
        lines?: Array<{
          text?: string;
          confidence?: number;
          bbox?: unknown;
          words?: Array<{ text?: string; confidence?: number; bbox?: unknown }>;
        }>;
      }>;
      lines?: Array<{
        text?: string;
        confidence?: number;
        bbox?: unknown;
        words?: Array<{ text?: string; confidence?: number; bbox?: unknown }>;
      }>;
      words?: Array<{ text?: string; confidence?: number; bbox?: unknown }>;
    }>) {
      if (block.words) {
        for (const word of block.words) {
          addUnique(word);
        }
      }
      if (block.paragraphs) {
        for (const para of block.paragraphs) {
          for (const line of para.lines || []) {
            if (line.words?.length) {
              for (const word of line.words) {
                addUnique(word);
              }
            } else {
              addUnique(line);
            }
          }
        }
      }
      if (block.lines) {
        for (const line of block.lines) {
          if (line.words?.length) {
            for (const word of line.words) {
              addUnique(word);
            }
          } else {
            addUnique(line);
          }
        }
      }
    }
  }

  return words;
}

function pushLine(lines: TesseractLineLike[], line: { text?: string; confidence?: number; bbox?: unknown }) {
  const text = (line.text || "").trim();
  if (!text) return;
  lines.push({
    text,
    confidence: line.confidence ?? 85,
    bbox: normalizeBbox(line.bbox),
  });
}

/**
 * Tesseract.js v7 returns `text` by default; line geometry lives under `blocks`.
 */
export function extractTesseractLines(pageData: {
  lines?: Array<{ text?: string; confidence?: number; bbox?: unknown }>;
  blocks?: unknown[];
  text?: string;
}): TesseractLineLike[] {
  const lines: TesseractLineLike[] = [];
  const seen = new Set<string>();

  const addUnique = (line: { text?: string; confidence?: number; bbox?: unknown }) => {
    const text = (line.text || "").trim();
    if (!text) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    pushLine(lines, line);
  };

  if (pageData.lines?.length) {
    for (const line of pageData.lines) {
      addUnique(line);
    }
  }

  if (pageData.blocks?.length) {
    for (const block of pageData.blocks as Array<{
      paragraphs?: Array<{ lines?: Array<{ text?: string; confidence?: number; bbox?: unknown }> }>;
      lines?: Array<{ text?: string; confidence?: number; bbox?: unknown }>;
      words?: Array<{ text?: string; confidence?: number; bbox?: unknown }>;
    }>) {
      if (block.paragraphs) {
        for (const para of block.paragraphs) {
          for (const line of para.lines || []) {
            addUnique(line);
          }
        }
      }
      if (block.lines) {
        for (const line of block.lines) {
          addUnique(line);
        }
      }
      if (block.words) {
        for (const word of block.words) {
          addUnique(word);
        }
      }
    }
  }

  if (lines.length === 0 && pageData.text?.trim()) {
    pageData.text
      .split(/\n+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((text, idx) => {
        addUnique({
          text,
          confidence: 80,
          bbox: { x0: 0, y0: idx * 24, x1: 200, y1: (idx + 1) * 24 },
        });
      });
  }

  return lines;
}
