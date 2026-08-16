/**
 * Knowledge Vault — page-aware rule extraction from full PDF text.
 * Extracts APPROVED rules from actual PDF passages with page numbers.
 * Upload = auto-approved; no human approval queue.
 */

import type { VaultDocument, VaultRule, RuleSeverity } from "./knowledgeVaultService";
import { resolveMaxRulesForDocument } from "./knowledgeVaultLimits";
import { normalizeVisionOcrText } from "./knowledgeVaultOcrTextUtils";
import { isPresentableVaultRemedy, pickPresentableRemedyText } from "./vaultRemedyTextQuality";
import {
  inferBookTradition,
  refinePassageToActionableRemedy,
  type ShlokaRefinementResult,
} from "./shlokaRefinementService";

export const AUTO_APPROVED_ON_UPLOAD = "Auto-Approved on Upload";

const PAGE_MARKER_RE = /---\s*PAGE\s+(\d+)\s+OF\s+(\d+)\s*---/gi;

const REMEDY_ACTION_RE =
  /(?:remedy|remedies|upay|correction|install|place|shift|relocate|avoid|recommended|auspicious|inauspicious|prohibited|marble|pyramid|copper|brass|crystal|slab|helix|keep|apply|रखें|स्थापित|प्रयोग|उपाय)/i;

/** Broader Vastu / spatial knowledge — not only remedy lines. */
const VASTU_KNOWLEDGE_RE =
  /(?:vastu|shastra|direction|north|south|east|west|north-east|northeast|ishanya|agneya|nairutya|vayavya|kitchen|toilet|bedroom|entrance|door|stair|brahmasthan|zone|element|fire|water|air|space|plot|house|room|building|mandir|temple|sleep|cooking|borewell|sump|main\s+door)/i;

export interface PageTextSegment {
  pageNumber: number;
  totalPages: number;
  text: string;
}

export function parsePageSegments(fullText: string): PageTextSegment[] {
  const segments: PageTextSegment[] = [];
  if (!fullText?.trim()) return segments;

  const markerRe = new RegExp(PAGE_MARKER_RE.source, "gi");
  const parts = fullText.split(markerRe);

  if (parts.length <= 1) {
    return [{ pageNumber: 1, totalPages: 1, text: fullText.trim() }];
  }

  let match: RegExpExecArray | null;
  const markers: { page: number; total: number; index: number }[] = [];
  const scanRe = new RegExp(PAGE_MARKER_RE.source, "gi");
  while ((match = scanRe.exec(fullText)) !== null) {
    markers.push({
      page: parseInt(match[1], 10),
      total: parseInt(match[2], 10),
      index: match.index,
    });
  }

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length ? markers[i + 1].index : fullText.length;
    const block = fullText.slice(start, end);
    const body = block.replace(PAGE_MARKER_RE, "").trim();
    segments.push({
      pageNumber: markers[i].page,
      totalPages: markers[i].total,
      text: body,
    });
  }

  return segments;
}

export function alphaRatio(text: string): number {
  const letters = (text.match(/[a-zA-Z\u0900-\u097F\u0966-\u096F]/g) || []).length;
  return letters / Math.max(text.length, 1);
}

export function countMeaningfulWords(text: string): number {
  const latin = text.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z0-9]/g, "").length > 2);
  const devanagari = (text.match(/[\u0900-\u097F]+/g) || []).filter((w) => w.length > 1);
  return latin.length + devanagari.length;
}

export function hasDevanagariScript(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

const PAGE_MARKER_FRAGMENT_RE =
  /^(?:---\s*)?(?:PAGE|P\.?\s*)?\d+\s*(?:OF\s*\d+\s*)?(?:---)?$/i;

export function isMeaningfulPassage(text: string, treatiseMode = false): boolean {
  const cleaned = normalizeVisionOcrText(text.replace(PAGE_MARKER_RE, "")).trim();
  if (cleaned.length < (treatiseMode ? 20 : 25)) return false;
  if (PAGE_MARKER_FRAGMENT_RE.test(cleaned)) return false;
  if (/^(?:GE|P\.?\s*)?\d+\s+OF\s+\d+\s*---?$/i.test(cleaned)) return false;

  const minAlpha = treatiseMode && hasDevanagariScript(cleaned) ? 0.12 : treatiseMode ? 0.18 : 0.35;
  if (alphaRatio(cleaned) < minAlpha) return false;

  const minWords = treatiseMode && hasDevanagariScript(cleaned) ? 2 : treatiseMode ? 3 : 5;
  if (countMeaningfulWords(cleaned) < minWords) return false;
  return true;
}

export function isVastuKnowledgePassage(text: string): boolean {
  return VASTU_KNOWLEDGE_RE.test(text) || REMEDY_ACTION_RE.test(text);
}

function splitSentences(text: string, treatiseMode = false): string[] {
  const normalized = normalizeVisionOcrText(text);
  const parts = normalized
    .split(/(?<=[.!?।\u0964])\s+|\n{2,}|(?:\]\s*\n)/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= (treatiseMode ? 20 : 30) && s.length <= 500);

  if (parts.length > 0) return parts;

  return normalized
    .split(/\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= (treatiseMode ? 25 : 30) && s.length <= 500);
}

function pickPrimaryPassage(pageText: string, treatiseMode = false): string | null {
  const cleaned = normalizeVisionOcrText(pageText);
  const sentences = splitSentences(cleaned, treatiseMode);
  const ranked = sentences
    .filter((s) => isMeaningfulPassage(s, treatiseMode))
    .sort((a, b) => {
      const score = (s: string) =>
        (REMEDY_ACTION_RE.test(s) ? 2 : 0) + (VASTU_KNOWLEDGE_RE.test(s) ? 1 : 0) + s.length / 100;
      return score(b) - score(a);
    });
  if (ranked[0]) return ranked[0];
  if (isMeaningfulPassage(cleaned, treatiseMode)) return cleaned.slice(0, 400);
  return null;
}

function pickRemedyQuote(pageText: string, treatiseMode = false): string | null {
  const sentences = splitSentences(normalizeVisionOcrText(pageText), treatiseMode);
  const remedy = sentences.find(
    (s) => isPresentableVaultRemedy(s) && isMeaningfulPassage(s, treatiseMode)
  );
  return remedy || null;
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("kitchen")) return "Kitchen Rules";
  if (lower.includes("toilet") || lower.includes("bathroom")) return "Toilet Rules";
  if (lower.includes("bedroom")) return "Bedroom Rules";
  if (lower.includes("entrance") || lower.includes("main door")) return "Entrance Rules";
  if (lower.includes("brahmasthan")) return "Brahmasthan (Center)";
  if (lower.includes("ayadi") || lower.includes("yoni")) return "Ayadi Formulas";
  if (REMEDY_ACTION_RE.test(text)) return "Remedies & Corrections";
  return "Extracted Vastu Knowledge";
}

function inferSeverity(text: string): RuleSeverity {
  const lower = text.toLowerCase();
  if (lower.includes("critical") || lower.includes("never") || lower.includes("forbidden"))
    return "CRITICAL";
  if (lower.includes("avoid") || lower.includes("inauspicious") || lower.includes("prohibited"))
    return "HIGH";
  return "MEDIUM";
}

function inferObjects(text: string): string[] {
  const lower = text.toLowerCase();
  const objects: string[] = [];
  if (lower.includes("kitchen")) objects.push("kitchen");
  if (lower.includes("toilet") || lower.includes("bathroom")) objects.push("toilet", "bathroom");
  if (lower.includes("bedroom")) objects.push("bedroom");
  if (lower.includes("entrance") || lower.includes("door")) objects.push("entrance", "door");
  if (lower.includes("stair")) objects.push("staircase");
  if (lower.includes("living") || lower.includes("drawing") || lower.includes("hall") || lower.includes("lounge"))
    objects.push("living_room");
  if (/[\u0900-\u097F]/.test(text)) {
    if (text.includes("रसोई")) objects.push("kitchen");
    if (text.includes("शयन") || text.includes("निद्रा")) objects.push("bedroom");
    if (text.includes("सोपान")) objects.push("staircase");
    if (text.includes("शौच")) objects.push("toilet", "bathroom");
    if (text.includes("खिड़की") || text.includes("खिडकी")) objects.push("window");
    if (text.includes("द्वार") || text.includes("प्रवेश")) objects.push("entrance", "door");
    if (text.includes("बैठक")) objects.push("living_room");
  }
  return objects.length > 0 ? objects : ["general"];
}

function isTreatiseDocument(
  doc: Pick<VaultDocument, "title"> & { originalName?: string; category?: string }
): boolean {
  const haystack = `${doc.title || ""} ${doc.originalName || ""} ${doc.category || ""}`.toLowerCase();
  return /brhat|samhita|mayamat|manasara|vastu|shastra|purana|tantra|architect|viswakarm|vishwakarm|samarangana|sutradhara|silpa|sthapatya|grhya|treatise|shilpa/i.test(
    haystack
  );
}

function isTemplateFallbackText(text: string): boolean {
  return (
    /^Extracted OCR content for/i.test(text.trim()) ||
    /Covers classical rules and formulas\.?$/i.test(text.trim())
  );
}

function passageIsExtractable(pageText: string, treatiseMode: boolean): boolean {
  const cleaned = normalizeVisionOcrText(pageText.replace(PAGE_MARKER_RE, "")).trim();
  if (isTemplateFallbackText(cleaned)) return false;
  if (isMeaningfulPassage(cleaned, treatiseMode)) {
    if (isVastuKnowledgePassage(cleaned)) return true;
    if (treatiseMode && cleaned.length >= 40) return true;
    return false;
  }
  if (!treatiseMode) return false;
  if (cleaned.length < 15) return false;
  const minAlpha = hasDevanagariScript(cleaned) ? 0.1 : 0.18;
  if (alphaRatio(cleaned) < minAlpha) return false;
  return countMeaningfulWords(cleaned) >= 2;
}

export function extractApprovedRulesFromDocument(
  doc: Pick<VaultDocument, "id" | "title" | "totalPages" | "category" | "originalName">,
  fullText: string,
  maxRules?: number
): VaultRule[] {
  const timestamp = new Date().toISOString();
  const rules: VaultRule[] = [];
  const seen = new Set<string>();
  const treatiseMode = isTreatiseDocument(doc);
  const bookTradition = inferBookTradition(doc);

  const pages = parsePageSegments(fullText);
  const segments = pages.length > 0 ? pages : [{ pageNumber: 1, totalPages: doc.totalPages || 1, text: fullText }];

  const extractableSegments = segments.filter((segment) => {
    const pageText = normalizeVisionOcrText(segment.text.replace(PAGE_MARKER_RE, "")).trim();
    return passageIsExtractable(pageText, treatiseMode);
  });
  const effectiveMaxRules =
    maxRules ??
    resolveMaxRulesForDocument(extractableSegments.length, treatiseMode);

  for (const segment of segments) {
    if (rules.length >= effectiveMaxRules) break;

    const pageText = normalizeVisionOcrText(segment.text.replace(PAGE_MARKER_RE, "")).trim();
    if (!passageIsExtractable(pageText, treatiseMode)) continue;

    const pageNumber = segment.pageNumber;
    const passages: string[] = [];

    if (treatiseMode && pageText.length > 180) {
      const blocks = pageText
        .split(/\n{2,}|(?<=[।\u0964])\s+/)
        .map((b) => b.replace(/\s+/g, " ").trim())
        .filter((b) => isMeaningfulPassage(b, true));
      if (blocks.length > 1) {
        passages.push(...blocks.slice(0, 5));
      }
    }

    if (passages.length === 0) {
      const primary =
        pickPrimaryPassage(pageText, treatiseMode) ||
        (passageIsExtractable(pageText, treatiseMode) ? pageText.slice(0, 400) : null);
      if (primary) passages.push(primary);
    }

    for (const primaryPassage of passages) {
      if (rules.length >= effectiveMaxRules) break;

      const remedyQuote = pickRemedyQuote(pageText, treatiseMode);
      const condition = primaryPassage.slice(0, 280);
      let refinement: ShlokaRefinementResult | null = null;

      let presentableRemedy = pickPresentableRemedyText({
        condition,
        recommendation: remedyQuote || primaryPassage,
        evidence: undefined,
      });

      if (!presentableRemedy) {
        refinement = refinePassageToActionableRemedy(primaryPassage, pageText, bookTradition);
        if (refinement) {
          presentableRemedy = refinement.remedyEnglish;
        }
      }
      if (!presentableRemedy) continue;

      const recommendation = presentableRemedy;
      const inferredObjects = refinement?.inferredObjects?.length
        ? [...new Set([...inferObjects(pageText), ...refinement.inferredObjects])]
        : inferObjects(pageText);
      const ruleConfidence =
        refinement?.confidence ??
        (remedyQuote ? 0.82 : treatiseMode && !isVastuKnowledgePassage(pageText) ? 0.55 : 0.7);

      const dedupeKey = treatiseMode
        ? `${pageNumber}:${recommendation.slice(0, 80).toLowerCase()}`
        : `${pageNumber}:${recommendation.slice(0, 80).toLowerCase()}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const ruleId = `RULE-PAGE-${doc.id}-P${pageNumber}-${rules.length + 1}`;

      rules.push({
        id: ruleId,
        documentId: doc.id,
        documentTitle: doc.title,
        category: inferCategory(pageText),
        condition: refinement?.conditionSummary || condition,
        recommendation: recommendation.slice(0, 400),
        severity: inferSeverity(pageText),
        confidence: ruleConfidence,
        applicableObjects: inferredObjects,
        createdDate: timestamp,
        updatedDate: timestamp,
        approvalStatus: "APPROVED",
        approvedBy: AUTO_APPROVED_ON_UPLOAD,
        reviewedAt: timestamp,
        version: "1.0",
        revisionNumber: 1,
        evidence: {
          sourceBook: doc.title,
          chapter: `Page ${pageNumber} Extract`,
          pageNumber,
          confidence: ruleConfidence,
          originalCitation: refinement?.originalCitation || primaryPassage.slice(0, 220),
          remedyEnglish: refinement?.remedyEnglish || (isPresentableVaultRemedy(recommendation) ? recommendation : undefined),
          remedyHindi: refinement?.remedyHindi,
          refinedFromShloka: Boolean(refinement?.refinedFromShloka),
          bookTradition: refinement?.bookTradition || bookTradition,
        },
      });
    }
  }

  return rules;
}

export class KnowledgeVaultRuleExtractionService {
  static extractApprovedRules(
    doc: VaultDocument,
    fullText: string,
    _chunks?: unknown[]
  ): VaultRule[] {
    const text = fullText?.trim() || "";
    if (!text) return [];
    return extractApprovedRulesFromDocument(doc, text);
  }

  /** @deprecated Use extractApprovedRules — upload rules are auto-approved. */
  static extractPendingRules(
    doc: VaultDocument,
    fullText: string,
    chunks?: unknown[]
  ): VaultRule[] {
    return this.extractApprovedRules(doc, fullText, chunks);
  }
}

/** @deprecated Use extractApprovedRulesFromDocument */
export const extractPendingRulesFromDocument = extractApprovedRulesFromDocument;
