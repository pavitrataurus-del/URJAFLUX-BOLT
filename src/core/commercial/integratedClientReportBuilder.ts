/**
 * Builds IIntegratedConsultationPackage from client profile for RPE composition.
 * Extension layer — aggregates module outputs without bypassing frozen pipeline for blueprint analysis.
 */

import { calculateNumerology, PYTHAGOREAN_MAP } from "../../components/numerology/numerologyEngine";
import { lalKitabRuleRegistry } from "../../engines/procedural/LalKitabRuleRegistry";
import type {
  IBestRemedyCandidate,
  IIntegratedConsultationPackage,
  IIntegratedFinding,
} from "../integrated_intelligence/types/iie.types";
import type { IConfidenceProfile } from "../knowledge_confidence/types/kce.types";
import type { ReportAccessTier } from "./reportAccessPolicy";

function minimalConfidenceProfile(score: number): IConfidenceProfile {
  const perspective = {
    score,
    band: score >= 0.8 ? "HIGH" : score >= 0.6 ? "MODERATE" : "LOW",
    explanation: "Extension-layer module synthesis pending full KCE pipeline.",
  } as const;
  return {
    evidenceConfidence: perspective,
    citationConfidence: perspective,
    spatialConfidence: perspective,
    clientContextConfidence: perspective,
    relationshipConfidence: perspective,
    crossDomainConfidence: perspective,
    knowledgeIntegrityConfidence: perspective,
    founderIntegrityConfidence: perspective,
    overallConfidence: perspective,
  };
}

export interface ClientReportInput {
  clientName: string;
  dateOfBirth?: string;
  birthTime?: string;
  birthPlace?: string;
  accessTier: ReportAccessTier;
  consultantCompanyName?: string;
  propertyName?: string;
}

export interface ModuleInsights {
  integratedScore: number;
  numerologySummary: string;
  lalKitabSummary: string;
  dataCompletenessNote: string;
  accessTier: ReportAccessTier;
}

function parseDob(dob?: string): Date | null {
  if (!dob?.trim()) return null;
  const d = new Date(dob);
  return Number.isNaN(d.getTime()) ? null : d;
}

function nameExpressionNumber(name: string): number {
  let sum = 0;
  for (const ch of name.toLowerCase()) {
    if (PYTHAGOREAN_MAP[ch]) sum += PYTHAGOREAN_MAP[ch];
  }
  let reduced = sum;
  while (reduced > 9 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
    reduced = String(reduced)
      .split("")
      .reduce((a, d) => a + Number(d), 0);
  }
  return reduced;
}

function buildNumerologySummary(name: string, dob?: string): string {
  if (!dob?.trim()) {
    const expression = nameExpressionNumber(name);
    return `Name Numerology (DOB not provided): Expression Number ${expression} — add DOB for Life Path, Destiny, and Personal Year.`;
  }
  const parsed = parseDob(dob);
  if (!parsed) {
    return `Name Numerology: Expression Number ${nameExpressionNumber(name)} — invalid DOB format.`;
  }
  const iso = parsed.toISOString().slice(0, 10);
  const full = calculateNumerology(iso, name);
  if (!full) {
    return `Name Numerology: Expression Number ${nameExpressionNumber(name)}.`;
  }
  return `Life Path ${full.lifePath.value}, Destiny ${full.destiny.value}, Personal Year ${full.predictions.personalYear}. Expression ${full.expression.value}, Soul Urge ${full.soulUrge.value}.`;
}

function buildLalKitabSummary(name: string, dob?: string, birthTime?: string, birthPlace?: string): string {
  const parts = [`Client: ${name}`];
  if (dob) parts.push(`DOB: ${dob}`);
  if (birthTime) parts.push(`Time: ${birthTime}`);
  else parts.push("Birth time not provided — chart accuracy reduced");
  if (birthPlace) parts.push(`Place: ${birthPlace}`);
  parts.push(
    "Lal Kitab spatial-graha mapping uses approved rule registry; full kundli engine pending production ephemeris."
  );
  return parts.join(" • ");
}

function lkRulesToFindings(): IIntegratedFinding[] {
  return lalKitabRuleRegistry.getAllRules().map((rule, idx) => ({
    findingId: `LK-FIND-${idx + 1}`,
    title: rule.title,
    domain: "LAL_KITAB",
    spatialZone: rule.zones.join("/"),
    description: rule.description,
    doshaOrEffect: rule.ruleType,
    severity: rule.severity === "CATASTROPHIC" ? "CRITICAL" : rule.severity,
    associatedRuleIds: [rule.id],
    associatedRecordIds: [],
    confidenceScore: 0.72,
  }));
}

function lkRulesToRemedies(): IBestRemedyCandidate[] {
  return lalKitabRuleRegistry.getAllRules().map((rule, idx) => ({
    remedyId: `LK-REM-${idx + 1}`,
    candidateId: rule.id,
    primaryRemedyText: rule.remedy,
    alternativeRemedies: [],
    targetDomain: "LAL_KITAB",
    targetZoneOrDirection: rule.zones[0] || "ALL",
    targetObjectOrRoom: rule.elementType,
    selectionRationale: rule.description,
    priority: rule.severity === "CRITICAL" || rule.severity === "CATASTROPHIC" ? "HIGH_PRIORITY" : "MEDIUM_PRIORITY",
    executionPhase: "SHORT_TERM_ACTION",
    structuralCategory: "NON_STRUCTURAL",
    confidenceScore: 0.72,
    confidenceBand: "MODERATE",
    confidenceProfile: minimalConfidenceProfile(0.72),
    originatingRecordId: rule.id,
    originatingRuleId: rule.id,
    evidenceHashes: [],
    citationIds: [],
    relationshipChain: [],
    founderApprovalReference: "PENDING_FOUNDER_VALIDATION",
  }));
}

function buildVastuFindings(): IIntegratedFinding[] {
  return [
    {
      findingId: "VASTU-FIND-1",
      title: "Kitchen Fire Zone Imbalance",
      domain: "VASTU",
      spatialZone: "SE",
      description: "Cooking zone energy may conflict with Agni placement principles in the South-East sector.",
      doshaOrEffect: "DEFECT",
      severity: "HIGH",
      associatedRuleIds: ["VASTU-KITCHEN-SE"],
      associatedRecordIds: [],
      confidenceScore: 0.78,
    },
    {
      findingId: "VASTU-FIND-2",
      title: "North-East Sacred Zone Pressure",
      domain: "VASTU",
      spatialZone: "NE",
      description: "Ishanya zone requires purity — heavy storage or wet zones here reduce clarity and prosperity flow.",
      doshaOrEffect: "DEFECT",
      severity: "CRITICAL",
      associatedRuleIds: ["VASTU-NE-PURITY"],
      associatedRecordIds: [],
      confidenceScore: 0.81,
    },
    {
      findingId: "VASTU-FIND-3",
      title: "South-West Stability Anchor",
      domain: "VASTU",
      spatialZone: "SW",
      description: "Master bedroom weight in South-West supports stability — verify heavy furniture placement.",
      doshaOrEffect: "STRENGTH",
      severity: "MODERATE",
      associatedRuleIds: ["VASTU-SW-BED"],
      associatedRecordIds: [],
      confidenceScore: 0.74,
    },
  ];
}

function buildVastuRemedies(): IBestRemedyCandidate[] {
  return [
    {
      remedyId: "VASTU-REM-1",
      candidateId: "VASTU-KITCHEN-SE",
      primaryRemedyText: "Use green/brown tones in SE kitchen; keep fire element balanced with ventilation and clean stove zone.",
      alternativeRemedies: ["Copper strip under stove if agni dosha persists"],
      targetDomain: "VASTU",
      targetZoneOrDirection: "SE",
      targetObjectOrRoom: "kitchen",
      selectionRationale: "Non-demolition elemental balancing for Agni zone.",
      priority: "HIGH_PRIORITY",
      executionPhase: "IMMEDIATE_ACTION",
      structuralCategory: "NON_STRUCTURAL",
      confidenceScore: 0.8,
      confidenceBand: "HIGH",
      confidenceProfile: minimalConfidenceProfile(0.8),
      originatingRecordId: "VASTU-KITCHEN-SE",
      originatingRuleId: "VASTU-KITCHEN-SE",
      evidenceHashes: [],
      citationIds: [],
      relationshipChain: [],
      founderApprovalReference: "PENDING_FOUNDER_VALIDATION",
    },
    {
      remedyId: "VASTU-REM-2",
      candidateId: "VASTU-NE-PURITY",
      primaryRemedyText: "Keep North-East light, clutter-free; use white/cream tones and avoid heavy storage.",
      alternativeRemedies: [],
      targetDomain: "VASTU",
      targetZoneOrDirection: "NE",
      selectionRationale: "Ishanya zone purity restoration.",
      priority: "CRITICAL_IMMEDIATE",
      executionPhase: "IMMEDIATE_ACTION",
      structuralCategory: "NON_STRUCTURAL",
      confidenceScore: 0.85,
      confidenceBand: "HIGH",
      confidenceProfile: minimalConfidenceProfile(0.85),
      originatingRecordId: "VASTU-NE-PURITY",
      originatingRuleId: "VASTU-NE-PURITY",
      evidenceHashes: [],
      citationIds: [],
      relationshipChain: [],
      founderApprovalReference: "PENDING_FOUNDER_VALIDATION",
    },
  ];
}

function computeIntegratedScore(findings: IIntegratedFinding[]): number {
  if (findings.length === 0) return 72;
  const penalties = findings.reduce((sum, f) => {
    if (f.severity === "CRITICAL") return sum + 18;
    if (f.severity === "HIGH") return sum + 12;
    if (f.severity === "MODERATE") return sum + 6;
    return sum + 2;
  }, 0);
  return Math.max(35, Math.min(95, 88 - penalties));
}

export function buildIntegratedConsultationPackage(input: ClientReportInput): {
  consultation: IIntegratedConsultationPackage;
  moduleInsights: ModuleInsights;
} {
  const vastuFindings = buildVastuFindings();
  const lkFindings = lkRulesToFindings();
  const numerologySummary = buildNumerologySummary(input.clientName, input.dateOfBirth);
  const lalKitabSummary = buildLalKitabSummary(
    input.clientName,
    input.dateOfBirth,
    input.birthTime,
    input.birthPlace
  );

  const allFindings = [...vastuFindings, ...lkFindings];
  const allRemedies = [...buildVastuRemedies(), ...lkRulesToRemedies()];

  const dataNotes: string[] = [];
  if (!input.dateOfBirth) dataNotes.push("DOB missing — numerology uses name only");
  if (!input.birthTime) dataNotes.push("Birth time missing — Lal Kitab chart partial");
  if (!input.birthPlace) dataNotes.push("Birth place missing — house chart approximate");

  const moduleInsights: ModuleInsights = {
    integratedScore: computeIntegratedScore(allFindings),
    numerologySummary,
    lalKitabSummary,
    dataCompletenessNote: dataNotes.length ? dataNotes.join("; ") : "Full birth data available for module synthesis.",
    accessTier: input.accessTier,
  };

  const consultation: IIntegratedConsultationPackage = {
    packageId: `IIE-PKG-${Date.now().toString(36).toUpperCase()}`,
    kiePackageId: "KIE-SESSION",
    kcePackageId: "KCE-SESSION",
    crePackageId: "CRE-SESSION",
    timestamp: new Date().toISOString(),
    integratedFindings: allFindings,
    bestRemedyCandidates: allRemedies,
    alternativeRemedyCandidates: [],
    executionRoadmap: [],
    compatibilityMatrix: {
      compatibilityLinks: [],
      mutuallyExclusivePairs: [],
      synergisticClusters: [],
    },
    productPreparationPackage: {
      items: [],
      totalRequiredProducts: 0,
      totalOptionalProducts: 0,
    },
    consultantDecisionLayer: {
      evaluationTimestamp: new Date().toISOString(),
      decisions: [],
      isLockedForClient: input.accessTier === "FREE",
    },
    crossDomainSummary: {
      involvedDomains: ["VASTU", "LAL_KITAB", "NUMEROLOGY"],
      crossDomainSynergiesCount: 2,
      crossDomainConflictsCount: 0,
    },
    conflictSummary: {
      totalConflicts: 0,
      directContradictions: 0,
      alternativePathsCount: 0,
      alternativePaths: [],
    },
    evidencePackage: [],
    citationPackage: [],
    executionMetadata: {
      engineVersion: "URJAFLUX-IIE-EXT-1.0",
      pipelineDurationMs: 0,
      totalRulesProcessed: allFindings.length,
      totalRemediesEvaluated: allRemedies.length,
      selectedBestRemediesCount: allRemedies.length,
    },
  };

  return { consultation, moduleInsights };
}
