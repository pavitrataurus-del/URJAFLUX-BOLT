/**
 * URJAFLUX AI OS — SPRINT 3A
 * Commercial Intelligence Architecture & Decision Engine Types
 */

import { PropertyRecognitionSummary, RecognizedEntity } from "../../recognition/types";

export type DecisionStage =
  | "ENTITY_RECOGNITION"
  | "RECOGNITION_EVIDENCE"
  | "RECOGNITION_CONFIDENCE"
  | "SPATIAL_GEOMETRY"
  | "ZONE_ASSIGNMENT"
  | "NORTH_CALIBRATION"
  | "APPLIED_RULES"
  | "RULE_EVALUATION_RESULT"
  | "CONFLICT_ANALYSIS"
  | "SEVERITY_CALCULATION"
  | "PROPERTY_IMPACT"
  | "RECOMMENDED_REMEDY"
  | "KNOWLEDGE_CITATION"
  | "DECISION_CONFIDENCE"
  | "EXECUTIVE_EXPLANATION"
  | "RECOGNITION_ENGINE"
  | "SPATIAL_INTELLIGENCE"
  | "DOMAIN_KNOWLEDGE"
  | "DECISION_ENGINE"
  | "CONFLICT_ENGINE"
  | "RECOMMENDATION_ENGINE"
  | "EVIDENCE_ENGINE"
  | "PROFESSIONAL_REPORT";

export interface DimensionEvaluation {
  dimensionName:
    | "Zone Suitability"
    | "Element Balance"
    | "Adjacent Rooms"
    | "Distance from Brahmasthan"
    | "Distance from Entrance"
    | "Fire-Water Interaction"
    | "Structural Weight"
    | "Natural Light"
    | "Ventilation"
    | "Accessibility";
  score: number; // 0 to 100
  status: "OPTIMAL" | "BALANCED" | "SUBOPTIMAL" | "CRITICAL_DEFECT";
  details: string;
}

export interface ElementMultiDimensionalEvaluation {
  elementId: string;
  elementName: string;
  elementType: string;
  assignedZone: string;
  healthIndex: number; // 0 to 100%
  dimensions: DimensionEvaluation[];
  positiveAttributes: string[];
  negativeAttributes: string[];
}

export interface DecisionChain {
  findingId: string;
  elementId: string;
  elementName: string;
  elementType: string;
  canonicalType?: string;
  zone: string;
  steps: {
    stage: DecisionStage;
    label: string;
    description: string;
    timestamp: string;
    data: Record<string, any>;
  }[];
  recognitionEvidence: {
    entityType: string;
    confidence: number;
    detectedBy: string;
    evidenceList: string[];
    verificationStatus: string;
  };
  spatialEvidence: {
    zone: string;
    rawAngleDeg: number;
    netNorthAngleDeg: number;
    distanceToBrahmasthanPx: number;
    distanceToEntrancePx: number;
    quadrant: string;
  };
  appliedRule: {
    ruleId: string;
    title: string;
    rulePack: string;
    canonSource: string;
    conditionEvaluated: string;
  };
  crossRuleValidation: {
    conflictDetected: boolean;
    conflictDescription?: string;
    interactingElements: string[];
  };
  severityCalculation: {
    severity: "CATASTROPHIC" | "MAJOR" | "MODERATE" | "MINOR";
    scoreDeduction: number;
    severityReason: string;
  };
  confidenceBreakdown: {
    recognitionConfidence: number;
    spatialConfidence: number;
    ruleMatchConfidence: number;
    overallConfidence: number;
    requiresConsultantVerification: boolean;
  };
  multiDimensionalEvaluation: ElementMultiDimensionalEvaluation;
  recommendation: {
    remedyId: string;
    remedyAction: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    expectedImpact: string;
    implementationEase: string;
  };
  supportingKnowledge: {
    sourceCanon: string;
    referenceVerse: string;
    excerpt: string;
  };
  reportDossier: string;
}

export interface PropertySubIndex {
  id: string;
  name:
    | "Spatial Planning"
    | "Directional Balance"
    | "Element Balance"
    | "Energy Distribution"
    | "Structural Harmony"
    | "Occupant Wellness"
    | "Expansion Potential"
    | "Environmental Balance";
  score: number; // 0 to 100
  status: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL";
  findingsCount: number;
  keyObservation: string;
}

export interface PropertyHealthIndex {
  overallScore: number; // 0 to 100
  ratingTier: "SUPREME_HARMONY" | "BALANCED" | "MODERATE_REMEDY_REQ" | "HIGH_IMBALANCE" | "CRITICAL_DEFECTS";
  subIndices: PropertySubIndex[];
  elementHealthScores: Array<{
    elementId: string;
    name: string;
    type: string;
    healthIndex: number;
    zone: string;
  }>;
  scoreTraceFormula?: string;
  calculationSteps?: string[];
}

export interface PositiveStrengthItem {
  id: string;
  category: string;
  title: string;
  zone: string;
  elementName: string;
  description: string;
  harmonyContributionScore: number;
  canonReference: string;
}

export interface NegativeDefectItem {
  id: string;
  ruleId: string;
  category: string;
  title: string;
  zone: string;
  elementName: string;
  description: string;
  severity: "CATASTROPHIC" | "MAJOR" | "MODERATE" | "MINOR";
  scoreDeduction: number;
  remedyAction: string;
}

export interface PositiveNegativeAudit {
  positiveStrengths: PositiveStrengthItem[];
  negativeDefects: NegativeDefectItem[];
  summary: {
    totalStrengths: number;
    totalDefects: number;
    harmonyRatioPercent: number; // e.g. 75% positive vs 25% negative
    verdict: string;
  };
}

export interface ConsultantOverride {
  id: string;
  entityId: string;
  originalName: string;
  originalType: string;
  overriddenType: string;
  overriddenName: string;
  consultantNotes: string;
  timestamp: string;
}

export interface RecommendationStatus {
  remedyId: string;
  status: "ACCEPTED" | "REJECTED" | "MODIFIED" | "PENDING";
  consultantComment?: string;
}

export interface PropertyComparisonResult {
  versionA: {
    label: string;
    timestamp: string;
    overallScore: number;
    defectCount: number;
  };
  versionB: {
    label: string;
    timestamp: string;
    overallScore: number;
    defectCount: number;
  };
  scoreDelta: number; // e.g. +18%
  resolvedDefects: string[];
  newDefects: string[];
  remainingDefects: string[];
  improvementSummary: string;
}

export interface AnonymousLearningEntry {
  timestamp: string;
  entityType: string;
  wasOverridden: boolean;
  originalType?: string;
  newType?: string;
  zoneAssigned: string;
  appliedRuleId: string;
  remedyAccepted: boolean;
}
