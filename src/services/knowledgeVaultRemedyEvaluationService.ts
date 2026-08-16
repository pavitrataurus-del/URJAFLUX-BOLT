/**
 * Knowledge Vault — multi-source remedy evaluation engine.
 * Queries approved vault rules across PDFs, compares remedies, detects conflicts,
 * checks cross-direction impact from vault evidence only (no AI invention).
 */

import { KnowledgeVaultService, type VaultRule } from "./knowledgeVaultService";
import { extractZoneCode } from "../engines/procedural/VastuRuleRegistry";
import { roomTaxonomyService } from "../recognition/RoomTaxonomyService";
import {
  filterPresentableVaultRules,
  isPresentableVaultRemedy,
  pickPresentableRemedyText,
  resolveHomeownerFacingRemedy,
  stripInternalEngineMeta,
} from "./vaultRemedyTextQuality";

export interface KnowledgeQueryContext {
  entityDisplayName: string;
  canonicalType: string;
  objectType: string;
  zoneDisplay: string;
  zoneCode: string;
  issueTitle?: string;
  issueDescription?: string;
  degreeVector?: number;
}

export interface SourcedRemedyCandidate {
  ruleId: string;
  documentId: string;
  documentTitle: string;
  sourceBook: string;
  chapter?: string;
  pageNumber: number;
  condition: string;
  remedy: string;
  severity: string;
  category: string;
}

export interface RemedySourceGroup {
  remedyText: string;
  supportingSources: string[];
  sourceCount: number;
}

export type RemedyConsensusStatus =
  | "MULTIPLE_OPTIONS"
  | "SINGLE_OPTION"
  | "NO_EVIDENCE"
  /** @deprecated Internal legacy — mapped to MULTIPLE_OPTIONS / SINGLE_OPTION for display */
  | "UNANIMOUS"
  | "MAJORITY"
  | "SPLIT"
  | "CONFLICTED";

/** Max distinct remedies shown to homeowner / one-time user for self-selection. */
export const MAX_HOMEOWNER_REMEDY_OPTIONS = 5;

export interface CrossDirectionImpactAssessment {
  assessed: boolean;
  hasNegativeImpactEvidence: boolean;
  affectedZones: string[];
  summary: string;
  sourceReferences: Array<{
    documentTitle: string;
    pageNumber: number;
    passage: string;
  }>;
}

export interface RemedyEvaluationResult {
  queryContext: KnowledgeQueryContext;
  candidates: SourcedRemedyCandidate[];
  remedyGroups: RemedySourceGroup[];
  consensusStatus: RemedyConsensusStatus;
  supportSummary: string;
  /** @deprecated Never auto-selected for homeowner — use availableRemedies */
  recommendedRemedy: string | null;
  /** Up to 5 distinct actionable remedies — consultant or user selects one. */
  availableRemedies: string[];
  recommendationRationale: string;
  isVerified: boolean;
  crossDirectionImpact: CrossDirectionImpactAssessment;
  /** Internal trace only — not shown in homeowner report UI. */
  sourceCitations: Array<{
    sourceBook: string;
    documentTitle: string;
    pageNumber: number;
    passage: string;
    remedy: string;
  }>;
}

export type PlacementVerdict = "FAVORABLE" | "UNFAVORABLE" | "SPLIT" | "NO_EVIDENCE";

export interface PlacementRuleAssessment {
  candidate: SourcedRemedyCandidate;
  polarity: "FAVORABLE" | "UNFAVORABLE" | "NEUTRAL";
}

export interface PlacementEvaluationResult {
  queryContext: KnowledgeQueryContext;
  matchedRules: SourcedRemedyCandidate[];
  ruleAssessments: PlacementRuleAssessment[];
  placementVerdict: PlacementVerdict;
  multiSourceSummary: string;
  consensusStatus: RemedyConsensusStatus;
  primaryCitation: SourcedRemedyCandidate | null;
  sourceCitations: RemedyEvaluationResult["sourceCitations"];
  isVerified: boolean;
  explanation: string;
  recommendationRationale: string;
}

const ZONE_CODE_PATTERN =
  /\b(north-east|north west|north-west|south-east|south west|south-west|north|east|south|west|ne|nw|se|sw|ishanya|agneya|nairitya|vayavya)\b/i;

const REMEDY_ACTION_PATTERN =
  /(?:remedy|remedies|solution|should|must|install|place|shift|relocate|keep|avoid|use|apply|recommend)/i;

const CROSS_IMPACT_NEGATIVE_PATTERN =
  /(?:avoid|not\s+(?:place|put|install)|prohibited|inauspicious|harm|damage|imbalance|negative|adverse|forbidden|do\s+not)/i;

const PLACEMENT_UNFAVORABLE_PATTERN =
  /(?:avoid|not\s+(?:place|put|install|build|locate)|prohibited|inauspicious|harm|defect|wrong|should\s+not|do\s+not|never|forbidden|undesirable|heavy\s+structure|not\s+(?:good|recommended|auspicious))/i;

const PLACEMENT_FAVORABLE_PATTERN =
  /(?:auspicious|favorable|ideal|recommended|beneficial|proper|correct|suitable|allowed|good\s+for|may\s+be\s+placed|should\s+be\s+placed)/i;

const OBJECT_SYNONYMS: Record<string, string[]> = {
  staircase: ["stair", "staircase", "stairs", "sopan", "sopana", "steps", "lift"],
  kitchen: ["kitchen", "cooking", "agni"],
  toilet: ["toilet", "washroom", "bathroom", "wc", "bath"],
  bedroom: ["bedroom", "bed room", "sleeping"],
  living_room: ["living", "drawing", "hall", "lounge"],
  main_entrance: ["entrance", "main door", "entry", "gate"],
  dining: ["dining", "dining table"],
  pooja: ["pooja", "puja", "mandir", "temple"],
  window: ["window", "wwindow", "khidki", "खिड़की", "opening", "ventilation"],
  door: ["door", "dwar", "dvār", "द्वार", "gate", "entrance"],
  balcony: ["balcony", "verandah", "terrace"],
};

function objectSynonymsForMatch(canonicalType?: string, objectType?: string): string[] {
  const canonical = (canonicalType || "").toLowerCase().replace(/[\s\-]+/g, "_");
  const obj = (objectType || "").toLowerCase();
  const terms = new Set<string>();
  if (obj) terms.add(obj);
  if (canonical) terms.add(canonical);
  const synonymKey = canonical || obj;
  for (const [key, values] of Object.entries(OBJECT_SYNONYMS)) {
    if (synonymKey.includes(key) || key.includes(synonymKey) || obj.includes(key)) {
      values.forEach((v) => terms.add(v));
    }
  }
  return [...terms].filter((t) => t.length >= 3);
}

function classifyPlacementPolarity(condition: string, recommendation: string): "FAVORABLE" | "UNFAVORABLE" | "NEUTRAL" {
  const text = `${condition} ${recommendation}`.toLowerCase();
  const unfavorable = PLACEMENT_UNFAVORABLE_PATTERN.test(text);
  const favorable = PLACEMENT_FAVORABLE_PATTERN.test(text);
  if (unfavorable) return "UNFAVORABLE";
  if (favorable) return "FAVORABLE";
  return "NEUTRAL";
}

function buildMultiSourceCompareSummary(candidates: SourcedRemedyCandidate[]): string {
  if (candidates.length === 0) return "0 approved sources";
  return `${candidates.length} approved knowledge source(s)`;
}

function buildPlacementIssueRationale(
  verdict: PlacementVerdict,
  polarCount: { unfavorable: number; favorable: number }
): string {
  if (verdict === "NO_EVIDENCE") {
    return "Approved knowledge sources do not contain clear placement guidance for this direction.";
  }
  if (verdict === "SPLIT") {
    return "Approved sources present differing guidance for this direction. Review the listed remedy options and choose what fits your layout.";
  }
  if (verdict === "UNFAVORABLE") {
    return `${polarCount.unfavorable} approved source(s) indicate this placement conflicts with directional Vastu harmony in this sector.`;
  }
  return `${polarCount.favorable} approved source(s) support this placement for this direction.`;
}

function determinePlacementVerdict(
  assessments: PlacementRuleAssessment[]
): { verdict: PlacementVerdict; rationale: string; consensus: RemedyConsensusStatus } {
  if (assessments.length === 0) {
    return {
      verdict: "NO_EVIDENCE",
      rationale: "Unable to determine from approved knowledge sources.",
      consensus: "NO_EVIDENCE",
    };
  }

  const polar = assessments.filter((a) => a.polarity !== "NEUTRAL");
  const unfavorable = polar.filter((a) => a.polarity === "UNFAVORABLE");
  const favorable = polar.filter((a) => a.polarity === "FAVORABLE");

  if (polar.length === 0) {
    return {
      verdict: "NO_EVIDENCE",
      rationale: "Approved vault rules matched context but none state clear placement guidance.",
      consensus: "NO_EVIDENCE",
    };
  }

  if (unfavorable.length > 0 && favorable.length > 0) {
    return {
      verdict: "SPLIT",
      rationale: buildPlacementIssueRationale("SPLIT", {
        unfavorable: unfavorable.length,
        favorable: favorable.length,
      }),
      consensus: "MULTIPLE_OPTIONS",
    };
  }

  if (unfavorable.length > 0) {
    return {
      verdict: "UNFAVORABLE",
      rationale: buildPlacementIssueRationale("UNFAVORABLE", {
        unfavorable: unfavorable.length,
        favorable: 0,
      }),
      consensus: unfavorable.length >= 2 ? "MULTIPLE_OPTIONS" : "SINGLE_OPTION",
    };
  }

  return {
    verdict: "FAVORABLE",
    rationale: buildPlacementIssueRationale("FAVORABLE", {
      unfavorable: 0,
      favorable: favorable.length,
    }),
    consensus: favorable.length >= 2 ? "MULTIPLE_OPTIONS" : "SINGLE_OPTION",
  };
}

function normalizeRemedyKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\u0900-\u097F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function extractIssueKeywords(context: KnowledgeQueryContext): string[] {
  if (!context.issueTitle?.trim() && !context.issueDescription?.trim()) {
    return [];
  }
  const parts = [context.issueTitle, context.issueDescription, context.entityDisplayName];
  const tokens = parts
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
  return [...new Set(tokens)];
}

function ruleToCandidate(rule: VaultRule): SourcedRemedyCandidate | null {
  const remedy = pickPresentableRemedyText(rule);
  if (!remedy) return null;

  return {
    ruleId: rule.id,
    documentId: rule.documentId,
    documentTitle: rule.documentTitle,
    sourceBook: rule.evidence?.sourceBook || rule.documentTitle,
    chapter: rule.evidence?.chapter || rule.category,
    pageNumber: rule.evidence?.pageNumber ?? 0,
    condition: rule.condition,
    remedy,
    severity: rule.severity,
    category: rule.category,
  };
}

function buildSupportSummary(optionCount: number, sourceCount: number): string {
  if (sourceCount === 0) return "0 approved sources";
  if (optionCount <= 1) return `${sourceCount} approved source(s) — 1 corrective option`;
  return `${sourceCount} approved source(s) — ${optionCount} corrective options to choose from`;
}

function collectAvailableRemedies(
  candidates: SourcedRemedyCandidate[],
  maxOptions: number = MAX_HOMEOWNER_REMEDY_OPTIONS
): string[] {
  const seenKeys = new Set<string>();
  const remedies: string[] = [];

  // Prefer one distinct remedy per document when possible (diverse options across books).
  const byDocument = new Map<string, SourcedRemedyCandidate[]>();
  for (const candidate of candidates) {
    const docKey = candidate.documentId || candidate.documentTitle;
    const list = byDocument.get(docKey) || [];
    list.push(candidate);
    byDocument.set(docKey, list);
  }

  const roundRobin: SourcedRemedyCandidate[] = [];
  const docQueues = [...byDocument.values()];
  let index = 0;
  while (roundRobin.length < candidates.length) {
    let added = false;
    for (const queue of docQueues) {
      if (index < queue.length) {
        roundRobin.push(queue[index]);
        added = true;
      }
    }
    if (!added) break;
    index += 1;
  }

  for (const candidate of roundRobin.length > 0 ? roundRobin : candidates) {
    const cleaned = stripInternalEngineMeta(candidate.remedy.trim());
    if (!isPresentableVaultRemedy(cleaned)) continue;
    const key = normalizeRemedyKey(cleaned);
    if (!key || seenKeys.has(key)) continue;
    seenKeys.add(key);
    remedies.push(cleaned);
    if (remedies.length >= maxOptions) break;
  }

  return remedies;
}

function summarizeRemedyOptions(
  availableRemedies: string[],
  sourceCount: number
): { status: RemedyConsensusStatus; rationale: string } {
  if (sourceCount === 0 || availableRemedies.length === 0) {
    return {
      status: "NO_EVIDENCE",
      rationale:
        "No approved corrective options are available for this direction and element from the knowledge library.",
    };
  }

  if (availableRemedies.length === 1) {
    return {
      status: "SINGLE_OPTION",
      rationale: `${sourceCount} approved source(s) suggest one corrective option for this direction. You or your consultant may apply it if it suits the layout.`,
    };
  }

  return {
    status: "MULTIPLE_OPTIONS",
    rationale: `${sourceCount} approved source(s) suggest ${availableRemedies.length} corrective options for this direction. Select the option that best fits your layout — your consultant may choose one for you.`,
  };
}

export class KnowledgeVaultRemedyEvaluationService {
  /**
   * Tiered entity + zone contextual retrieval — strict match first, scored object fallback.
   */
  public static retrieveContextualApprovedRules(context: KnowledgeQueryContext): VaultRule[] {
    const issueKeywords = extractIssueKeywords(context);
    const pdfTopic = roomTaxonomyService.canonicalTypeToPdfTopic(
      context.canonicalType as import("../recognition/RoomTaxonomyService").CanonicalRoomType
    );
    return KnowledgeVaultService.getPlacementApprovedRulesForContext(
      context.objectType,
      context.zoneCode,
      context.canonicalType,
      issueKeywords,
      context.entityDisplayName,
      pdfTopic || undefined,
      context.zoneDisplay
    );
  }

  public static evaluateRemediesForContext(
    context: KnowledgeQueryContext
  ): RemedyEvaluationResult {
    const matchedRules = filterPresentableVaultRules(this.retrieveContextualApprovedRules(context));
    const candidates = matchedRules
      .map(ruleToCandidate)
      .filter((candidate): candidate is SourcedRemedyCandidate => candidate !== null);

    const groupMap = new Map<string, RemedySourceGroup>();
    for (const candidate of candidates) {
      const key = normalizeRemedyKey(candidate.remedy);
      if (!key) continue;
      const label = candidate.documentTitle || candidate.sourceBook;
      const existing = groupMap.get(key);
      if (existing) {
        if (!existing.supportingSources.includes(label)) {
          existing.supportingSources.push(label);
          existing.sourceCount += 1;
        }
      } else {
        groupMap.set(key, {
          remedyText: candidate.remedy,
          supportingSources: [label],
          sourceCount: 1,
        });
      }
    }

    const remedyGroups = Array.from(groupMap.values()).sort(
      (a, b) => b.sourceCount - a.sourceCount
    );

    const availableRemedies = collectAvailableRemedies(candidates);
    const summary = summarizeRemedyOptions(availableRemedies, candidates.length);

    const crossDirectionImpact = this.assessCrossDirectionImpact(
      availableRemedies[0] || null,
      context,
      matchedRules
    );

    const sourceCitations = candidates.map((c) => ({
      sourceBook: c.sourceBook,
      documentTitle: c.documentTitle,
      pageNumber: c.pageNumber,
      passage: c.condition,
      remedy: c.remedy,
    }));

    return {
      queryContext: context,
      candidates,
      remedyGroups,
      consensusStatus: summary.status,
      supportSummary: buildSupportSummary(availableRemedies.length, candidates.length),
      recommendedRemedy: null,
      availableRemedies,
      recommendationRationale: summary.rationale,
      isVerified: availableRemedies.length > 0,
      crossDirectionImpact,
      sourceCitations,
    };
  }

  /**
   * Multi-source placement evaluation — always runs vault compare for entity + zone.
   * Used for both CORRECT and DEFECT paths; no hardcoded citations.
   */
  public static evaluatePlacementForContext(
    context: KnowledgeQueryContext
  ): PlacementEvaluationResult {
    const matchedRules = filterPresentableVaultRules(this.retrieveContextualApprovedRules(context));
    const objectTerms = objectSynonymsForMatch(context.canonicalType, context.objectType);

    const candidates = matchedRules
      .map(ruleToCandidate)
      .filter((candidate): candidate is SourcedRemedyCandidate => candidate !== null)
      .filter((c) => {
        const text = `${c.condition} ${c.remedy}`.toLowerCase();
        if (objectTerms.length === 0) return true;
        return objectTerms.some((term) => text.includes(term));
      });

    const ruleAssessments: PlacementRuleAssessment[] = candidates.map((candidate) => ({
      candidate,
      polarity: classifyPlacementPolarity(candidate.condition, candidate.remedy),
    }));

    const { verdict, rationale, consensus } = determinePlacementVerdict(ruleAssessments);

    const primaryCitation =
      ruleAssessments.find((a) => a.polarity === (verdict === "FAVORABLE" ? "FAVORABLE" : "UNFAVORABLE"))
        ?.candidate ??
      candidates[0] ??
      null;

    const sourceCitations = candidates.map((c) => ({
      sourceBook: c.sourceBook,
      documentTitle: c.documentTitle,
      pageNumber: c.pageNumber,
      passage: c.condition,
      remedy: c.remedy,
    }));

    const multiSourceSummary = buildMultiSourceCompareSummary(candidates);
    const explanation =
      candidates.length === 0
        ? "No approved vault rules matched this entity and zone."
        : `${multiSourceSummary} — ${rationale}`;

    return {
      queryContext: context,
      matchedRules: candidates,
      ruleAssessments,
      placementVerdict: verdict,
      multiSourceSummary,
      consensusStatus: consensus,
      primaryCitation,
      sourceCitations,
      isVerified: candidates.length > 0 && verdict !== "SPLIT" && verdict !== "NO_EVIDENCE",
      explanation,
      recommendationRationale: rationale,
    };
  }

  /**
   * Cross-direction impact — vault evidence only; no inference when sources are silent.
   */
  public static assessCrossDirectionImpact(
    remedyText: string | null,
    context: KnowledgeQueryContext,
    matchedRules: VaultRule[]
  ): CrossDirectionImpactAssessment {
    if (!remedyText) {
      return {
        assessed: false,
        hasNegativeImpactEvidence: false,
        affectedZones: [],
        summary:
          "Available knowledge sources do not provide enough evidence to determine the cross-direction impact.",
        sourceReferences: [],
      };
    }

    const remedyTokens = normalizeRemedyKey(remedyText)
      .split(" ")
      .filter((t) => t.length > 4)
      .slice(0, 6);

    const allApproved = KnowledgeVaultService.getApprovedRules();
    const targetZoneNorm = context.zoneCode.toLowerCase();
    const references: CrossDirectionImpactAssessment["sourceReferences"] = [];
    const affectedZones: string[] = [];

    for (const rule of allApproved) {
      const combined = `${rule.condition} ${rule.recommendation}`.toLowerCase();
      const sharesRemedyToken = remedyTokens.some((token) => combined.includes(token));
      if (!sharesRemedyToken) continue;

      const zoneMatches = combined.match(ZONE_CODE_PATTERN);
      if (!zoneMatches) continue;

      const mentionedZone = zoneMatches[0].toLowerCase();
      const isTargetZone =
        mentionedZone.includes(targetZoneNorm) ||
        targetZoneNorm.includes(mentionedZone) ||
        context.zoneDisplay.toLowerCase().includes(mentionedZone);

      if (isTargetZone) continue;

      const hasNegative = CROSS_IMPACT_NEGATIVE_PATTERN.test(combined);
      if (hasNegative || rule.recommendation.toLowerCase().includes(remedyText.toLowerCase().slice(0, 30))) {
        affectedZones.push(mentionedZone);
        references.push({
          documentTitle: rule.documentTitle,
          pageNumber: rule.evidence?.pageNumber ?? 0,
          passage: rule.condition.slice(0, 200),
        });
      }
    }

    if (references.length === 0) {
      return {
        assessed: true,
        hasNegativeImpactEvidence: false,
        affectedZones: [],
        summary:
          "Available knowledge sources do not provide enough evidence to determine the cross-direction impact.",
        sourceReferences: [],
      };
    }

    return {
      assessed: true,
      hasNegativeImpactEvidence: true,
      affectedZones: [...new Set(affectedZones)],
      summary: `Approved sources reference potential cross-zone interactions for zones: ${affectedZones.join(", ")}. Review remedy options before applying.`,
      sourceReferences: references,
    };
  }

  public static buildQueryContext(
    canonicalType: string,
    objectType: string,
    zoneDisplay: string,
    rawFinding?: {
      title?: string;
      description?: string;
      displayName?: string;
      degreeVector?: number;
    }
  ): KnowledgeQueryContext {
    const zoneCode = extractZoneCode(zoneDisplay) || zoneDisplay;
    return {
      entityDisplayName: rawFinding?.displayName || objectType,
      canonicalType,
      objectType,
      zoneDisplay,
      zoneCode,
      issueTitle: rawFinding?.title,
      issueDescription: rawFinding?.description,
      degreeVector: rawFinding?.degreeVector,
    };
  }
}
