/**
 * Homeowner-facing vault remedy quality gate.
 * Blocks OCR gibberish, LLM meta, religious verse prose, and non-actionable treatise text.
 */

import { alphaRatio, hasDevanagariScript } from "./knowledgeVaultRuleExtractionService";
import type { VaultRule } from "./knowledgeVaultService";

const HOMEOWNER_DEFAULT_REMEDY =
  "No verified remedy is currently available in the approved knowledge library.";

/**
 * Actionable Vastu correction — avoids false positives like "at one place" or "inside the house".
 */
export const ACTIONABLE_VASTU_REMEDY_RE =
  /(?:\b(?:remedy|remedies|upay|correction)\b|\b(?:install|keep|avoid|shift|relocate|embed|apply|use)\b|\bplace\s+(?:a|an|the|your|yellow|green|red|white|warm|natural|copper|brass|marble|pyramid|slab|bowl|helix|stone|crystal|energy)\b|\bdo\s+not\s+(?:place|put|build|locate)\b|\bnot\s+recommended\b|\bface\s+(?:east|west|north|south)\b|\b(?:marble|pyramid|copper|brass|crystal|slab|helix)\b|\b(?:yellow|green)\s+(?:marble|slab|accents?|stone|color)\b|\bwater\s+bowl\b|\benergy\s+pyramid\b|रखें|स्थापित|प्रयोग|लगाए|हटाए|पीला|पीतल|तांबा|पत्थर|उपाय|बचें)/i;

const NON_REMEDY_META_RE =
  /(?:translates?\s+to|grammatical\s+sense|this\s+(?:means|refers|passage|line|verse)|makes\s+grammatical|the\s+king\s+should|architects?\s+who\s+are\s+skilled|skilled\s+in\s+measurement|provide\s+land\s+and\s+villages|four\s+architects|formatting\s*:|plain\s+text\s+only|user\s+requested|return\s+plain\s+text)/i;

const RELIGIOUS_NARRATIVE_RE =
  /(?:atharvaveda|rigveda|yajurveda|samaveda|purana|shloka|shlok|mantra|praying\s+to|deities?\s+residing|enjoying\s+your\s+beloved|hidden\s+offerings?\s+of\s+ghee|gems\s+and\s+wealth|desiring\s+to\s+construct\s+palaces|it\s+is\s+said\s*:|book\s+\d+\.\d+|—\s*[A-Z][a-z]+veda)/i;

const INTERNAL_ENGINE_META_RE =
  /(?:sources?\s+disagree|no\s+single\s+remedy\s+auto-selected|source\s+group\s*\(|approved\s+source\(s\)|support\s+summary|cross-direction\s+impact|unable\s+to\s+determine\s+from\s+approved)/i;

const OCR_GARBAGE_TOKEN_RE =
  /[a-z][A-Z][a-z]|[A-Z][a-z][A-Z][a-z]|[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/;

function latinWordLooksCorrupted(word: string): boolean {
  const clean = word.replace(/[^a-zA-Z]/g, "");
  if (clean.length < 4) return false;
  if (OCR_GARBAGE_TOKEN_RE.test(clean)) return true;
  const vowels = (clean.match(/[aeiouAEIOU]/g) || []).length;
  if (clean.length >= 8 && vowels / clean.length < 0.15) return true;
  if (/^[A-Z][a-z]{0,2}[A-Z]/.test(clean)) return true;
  return false;
}

export function isReligiousOrNarrativeProse(text: string): boolean {
  return RELIGIOUS_NARRATIVE_RE.test(text);
}

export function isInternalEngineMeta(text: string): boolean {
  return INTERNAL_ENGINE_META_RE.test(text);
}

export function isGibberishRemedyText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  if (NON_REMEDY_META_RE.test(trimmed)) return true;
  if (RELIGIOUS_NARRATIVE_RE.test(trimmed)) return true;
  if (INTERNAL_ENGINE_META_RE.test(trimmed)) return true;

  if (hasDevanagariScript(trimmed)) {
    return alphaRatio(trimmed) < 0.12 || trimmed.length < 8;
  }

  const words = trimmed.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z]/g, "").length >= 3);
  if (words.length === 0) return true;

  const corrupted = words.filter(latinWordLooksCorrupted).length;
  if (corrupted / words.length > 0.25) return true;

  if (alphaRatio(trimmed) < 0.35 && !ACTIONABLE_VASTU_REMEDY_RE.test(trimmed)) return true;

  return false;
}

export function isPresentableVaultRemedy(text: string | null | undefined): boolean {
  if (!text?.trim()) return false;
  if (isGibberishRemedyText(text)) return false;
  return ACTIONABLE_VASTU_REMEDY_RE.test(text);
}

export function stripInternalEngineMeta(text: string): string {
  return text
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !isInternalEngineMeta(part))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pickPresentableRemedyText(
  rule: Pick<VaultRule, "condition" | "recommendation" | "evidence">
): string | null {
  const evidence = rule.evidence as
    | (VaultRule["evidence"] & { remedyEnglish?: string; remedyHindi?: string })
    | undefined;
  const refinedEnglish = evidence?.remedyEnglish?.trim() || "";
  const recommendation = rule.recommendation?.trim() || "";
  const condition = rule.condition?.trim() || "";

  if (isPresentableVaultRemedy(refinedEnglish)) return refinedEnglish;
  if (isPresentableVaultRemedy(recommendation)) return recommendation;

  const sentences = `${condition} ${recommendation}`
    .split(/(?<=[.!?।\u0964])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sentence of sentences) {
    if (isPresentableVaultRemedy(sentence)) return sentence;
  }

  return null;
}

export function filterPresentableVaultRules(rules: VaultRule[]): VaultRule[] {
  return rules.filter((rule) => pickPresentableRemedyText(rule) !== null);
}

export function sanitizeRemedyForHomeownerDisplay(text: string): string {
  const cleaned = stripInternalEngineMeta(text.trim());
  if (!isPresentableVaultRemedy(cleaned)) {
    return HOMEOWNER_DEFAULT_REMEDY;
  }
  return cleaned;
}

export function resolveHomeownerFacingRemedy(options: {
  proceduralRemedy?: string | null;
  vaultRemedy?: string | null;
  multiSourceRemedy?: string | null;
  availableRemedies?: string[] | null;
}): string {
  if (options.availableRemedies?.length) {
    return formatRemediesForDisplay(options.availableRemedies);
  }

  const candidates = [
    options.proceduralRemedy,
    options.multiSourceRemedy,
    options.vaultRemedy,
  ];

  for (const candidate of candidates) {
    if (isPresentableVaultRemedy(candidate)) {
      return stripInternalEngineMeta(candidate!.trim());
    }
  }

  return HOMEOWNER_DEFAULT_REMEDY;
}

export function resolveHomeownerFacingRemedies(options: {
  proceduralRemedy?: string | null;
  availableRemedies?: string[] | null;
  vaultCandidates?: Array<string | null | undefined>;
  maxOptions?: number;
}): string[] {
  const max = options.maxOptions ?? 5;
  const seen = new Set<string>();
  const remedies: string[] = [];

  const push = (text?: string | null) => {
    const cleaned = stripInternalEngineMeta((text || "").trim());
    if (!isPresentableVaultRemedy(cleaned)) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    remedies.push(cleaned);
  };

  push(options.proceduralRemedy);
  for (const remedy of options.availableRemedies || []) push(remedy);
  for (const remedy of options.vaultCandidates || []) push(remedy);

  return remedies.slice(0, max);
}

export function formatRemediesForDisplay(remedies: string[]): string {
  if (remedies.length === 0) return HOMEOWNER_DEFAULT_REMEDY;
  if (remedies.length === 1) return remedies[0];
  return remedies.map((remedy, index) => `Option ${index + 1}: ${remedy}`).join("\n\n");
}

const BOOK_CITATION_LEAK_RE =
  /(?:source\s*:|knowledge\s+book|chapter|page\s+\d+|pg\.?\s*\d+|mayamat|viswakarm|samhita|treatise|document\s+title)/i;

export function stripBookCitationLeaks(text: string): string {
  return text
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !BOOK_CITATION_LEAK_RE.test(part))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildDirectionalIssueExplanation(options: {
  displayName: string;
  zone: string;
  verdict?: "FAVORABLE" | "UNFAVORABLE" | "SPLIT" | "NO_EVIDENCE";
}): string {
  const { displayName, zone, verdict = "UNFAVORABLE" } = options;
  if (verdict === "FAVORABLE") {
    return `${displayName} in ${zone} aligns with directional element balance. This supports stable daily energy flow in the home.`;
  }
  if (verdict === "SPLIT") {
    return `${displayName} in ${zone} has mixed directional guidance. Element balance in this sector may need careful correction based on your layout.`;
  }
  if (verdict === "NO_EVIDENCE") {
    return `${displayName} in ${zone} could not be fully verified against approved directional knowledge for this layout.`;
  }
  return `${displayName} in ${zone} disturbs directional element harmony. This can affect comfort, health, finances, and daily peace in the home because each Vastu direction governs a specific life aspect.`;
}

export { HOMEOWNER_DEFAULT_REMEDY };
