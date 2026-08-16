/**
 * Page-level Vision OCR for scanned Knowledge Vault PDFs.
 * Renders PDF pages via pdf.js and extracts text through /api/vision/recognize.
 */

import { parsePageSegments } from "./knowledgeVaultRuleExtractionService";
import { normalizeVisionOcrText } from "./knowledgeVaultOcrTextUtils";

import { KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD } from "./knowledgeVaultLimits";

const MAX_OCR_PAGES_PER_UPLOAD = KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD;

export function selectPagesForOcr(allPages: number[], maxPages = MAX_OCR_PAGES_PER_UPLOAD): number[] {
  if (allPages.length <= maxPages) return allPages;
  const picked = new Set<number>();
  for (let p = 1; p <= Math.min(40, allPages.length); p++) picked.add(p);
  for (let p = 41; p <= allPages.length; p += 5) picked.add(p);
  picked.add(allPages[allPages.length - 1]);
  return Array.from(picked)
    .filter((p) => allPages.includes(p))
    .sort((a, b) => a - b)
    .slice(0, maxPages);
}

export function mergeOcrIntoPageMarkedText(
  pageMarkedText: string,
  ocrByPage: Map<number, string>,
  totalPages: number
): string {
  const segments = parsePageSegments(pageMarkedText);
  const source = segments.length > 0 ? segments : [{ pageNumber: 1, totalPages, text: pageMarkedText }];

  return source
    .map((seg) => {
      const ocrText = ocrByPage.get(seg.pageNumber)?.trim();
      const nativeBody = seg.text.replace(/---\s*PAGE\s+\d+\s+OF\s+\d+\s*---/gi, "").trim();
      const body = ocrText && ocrText.length > nativeBody.length ? ocrText : nativeBody;
      return `--- PAGE ${seg.pageNumber} OF ${seg.totalPages || totalPages} ---\n${body}`;
    })
    .join("\n\n");
}

/** Unwrap Gemini JSON OCR blobs and strip junk page-marker fragments. */
export { normalizeVisionOcrText } from "./knowledgeVaultOcrTextUtils";

async function recognizePageImage(
  dataUrl: string,
  fileName: string,
  pageNumber: number
): Promise<{ text: string; quotaExceeded: boolean }> {
  const resp = await fetch("/api/vision/recognize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageDataUrl: dataUrl,
      promptText: `Extract ALL readable text from page ${pageNumber} of the classical treatise "${fileName}". Include Sanskrit transliteration, English, headings, verse numbers, and spatial/directional statements exactly as printed. Return plain text only.`,
    }),
  });

  if (resp.status === 429) {
    return { text: "", quotaExceeded: true };
  }

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => "");
    console.warn(
      `[KnowledgeVault OCR] Vision API page ${pageNumber} failed (${resp.status}): ${errBody.slice(0, 200)}`
    );
    return { text: "", quotaExceeded: false };
  }
  const json = (await resp.json()) as {
    rawJsonText?: string;
    text?: string;
    error?: string;
    quotaExceeded?: boolean;
  };
  if (json.error) {
    const msg = String(json.error);
    if (json.quotaExceeded || /429|quota|RESOURCE_EXHAUSTED|rate limit/i.test(msg)) {
      return { text: "", quotaExceeded: true };
    }
    console.warn(`[KnowledgeVault OCR] Vision API page ${pageNumber} error: ${json.error}`);
    return { text: "", quotaExceeded: false };
  }
  const text = normalizeVisionOcrText(json.rawJsonText || json.text || "");
  if (/^Parsed Vastu Shastra treatise document content/i.test(text)) return { text: "", quotaExceeded: false };
  if (/^Extracted OCR content for/i.test(text)) return { text: "", quotaExceeded: false };
  return { text, quotaExceeded: false };
}

export class KnowledgeVaultPageOcrService {
  static async ocrPdfPages(
    buffer: ArrayBuffer,
    pageNumbers: number[],
    fileName: string,
    onProgress?: (current: number, total: number, pageNumber: number) => void
  ): Promise<Map<number, string>> {
    if (typeof document === "undefined") {
      console.warn("[KnowledgeVault OCR] Page OCR requires browser DOM (canvas). Skipping.");
      return new Map();
    }

  const targets = selectPagesForOcr(pageNumbers);
  const results = new Map<number, string>();
  let quotaBlocked = false;

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "4.10.38"}/legacy/build/pdf.worker.min.mjs`;
    }

    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
    try {
      for (let i = 0; i < targets.length; i++) {
        if (quotaBlocked) break;
        const pageNumber = targets[i];
        onProgress?.(i + 1, targets.length, pageNumber);
        try {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport }).promise;
          page.cleanup();

          const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
          const ocrResult = await recognizePageImage(dataUrl, fileName, pageNumber);
          if (ocrResult.quotaExceeded) {
            quotaBlocked = true;
            console.warn(
              `[KnowledgeVault OCR] All OCR providers rate-limited after ${results.size} page(s) — remaining pages skipped.`
            );
            break;
          }
          if (ocrResult.text.length >= 8) {
            results.set(pageNumber, ocrResult.text);
          }
        } catch (err) {
          console.warn(`[KnowledgeVault OCR] Page ${pageNumber} failed:`, err);
        }
        // Groq free tier TPM ~30K — pace requests to avoid burst throttling.
        await new Promise((r) => setTimeout(r, i > 0 && i % 8 === 0 ? 2500 : 400));
      }
    } finally {
      if (typeof (pdf as { destroy?: () => Promise<void> }).destroy === "function") {
        await (pdf as { destroy: () => Promise<void> }).destroy();
      }
    }

    return results;
  }
}
