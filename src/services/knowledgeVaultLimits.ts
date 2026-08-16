/** Max rule passages extracted from a single page (treatise multi-paragraph mode). */
export const KNOWLEDGE_MAX_RULES_PER_PAGE = 5;

/** Floor when a document has very little OCR text. */
export const KNOWLEDGE_MAX_RULES_FLOOR = 50;

/** Safety ceiling per document — prevents runaway extraction on one corrupt upload. */
export const KNOWLEDGE_MAX_RULES_ABSOLUTE_CEILING = 5000;

/** @deprecated Use resolveMaxRulesForDocument — kept for scripts/tests expecting a number. */
export const KNOWLEDGE_MAX_RULES_PER_DOCUMENT = KNOWLEDGE_MAX_RULES_ABSOLUTE_CEILING;

/** Vision OCR pages sampled per upload (scanned PDFs). */
export const KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD = 150;

/** Min chars on a page to count as successful OCR coverage. */
export const KNOWLEDGE_OCR_PAGE_MIN_CHARS = 35;

/** Scale rule cap with OCR coverage — NOT a global vault limit. */
export function resolveMaxRulesForDocument(
  pagesWithExtractableText: number,
  treatiseMode: boolean
): number {
  const perPage = treatiseMode ? KNOWLEDGE_MAX_RULES_PER_PAGE : 2;
  const dynamic = Math.max(
    KNOWLEDGE_MAX_RULES_FLOOR,
    pagesWithExtractableText * perPage
  );
  return Math.min(dynamic, KNOWLEDGE_MAX_RULES_ABSOLUTE_CEILING);
}

/** Rough vault scale hint for ops (not enforced). */
export function estimateVaultRuleCapacity(documentCount: number, avgPagesWithText = 200): number {
  return documentCount * resolveMaxRulesForDocument(avgPagesWithText, true);
}
