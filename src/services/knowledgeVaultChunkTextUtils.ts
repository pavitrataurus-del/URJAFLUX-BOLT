import { normalizeVisionOcrText } from "./knowledgeVaultOcrTextUtils";
import { KNOWLEDGE_OCR_PAGE_MIN_CHARS } from "./knowledgeVaultLimits";

export interface PageTextRecord {
  pageNumber: number;
  text: string;
}

/** Rebuild page-marked full text from per-page archive records. */
export function rebuildFullTextFromPageTextRecords(
  pages: PageTextRecord[],
  totalPages: number
): { fullText: string; pagesWithText: number } {
  const pageMarkerRe = /---\s*PAGE\s+\d+\s+OF\s+\d+\s*---/gi;
  let pagesWithText = 0;
  const sorted = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
  const blocks: string[] = [];

  for (const page of sorted) {
    const body = normalizeVisionOcrText(page.text.replace(pageMarkerRe, "")).trim();
    if (body.length < KNOWLEDGE_OCR_PAGE_MIN_CHARS) continue;
    pagesWithText++;
    blocks.push(`--- PAGE ${page.pageNumber} OF ${totalPages} ---\n${body}`);
  }

  return { fullText: blocks.join("\n\n"), pagesWithText };
}

/** Rebuild page-marked full text from stored chunk records. */
export function rebuildFullTextFromChunkRecords(
  chunks: Array<Record<string, unknown>>,
  totalPages: number
): { fullText: string; pagesWithText: number } {
  const pageMap = new Map<number, string[]>();

  for (const data of chunks) {
    const pn = Number(data.pageNumber || 1);
    const raw = String(data.text || data.content || data.rawText || "");
    const t = normalizeVisionOcrText(raw);
    if (!t || t.length < 12) continue;
    if (!pageMap.has(pn)) pageMap.set(pn, []);
    pageMap.get(pn)!.push(t);
  }

  let pagesWithText = 0;
  for (const [, parts] of pageMap) {
    const body = parts.join("\n").replace(/---\s*PAGE\s+\d+\s+OF\s+\d+\s*---/gi, "").trim();
    if (body.length >= KNOWLEDGE_OCR_PAGE_MIN_CHARS) pagesWithText++;
  }

  const fullText = Array.from(pageMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([pn, parts]) => `--- PAGE ${pn} OF ${totalPages} ---\n${parts.join("\n")}`)
    .join("\n\n");

  return { fullText, pagesWithText };
}
