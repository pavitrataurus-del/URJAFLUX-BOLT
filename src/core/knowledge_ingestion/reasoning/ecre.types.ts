import { SourceCitation, KnowledgeProvenance } from '../../../types/semanticKnowledge';
import { MultimodalObject, MultimodalObjectType } from '../types/multimodal.types';

export type ECREEntityType =
  | 'DOCUMENT'
  | 'CHAPTER'
  | 'SECTION'
  | 'PARAGRAPH'
  | 'TABLE'
  | 'FORMULA'
  | 'DIAGRAM'
  | 'YANTRA'
  | 'FLOOR_PLAN'
  | 'GRAPH_NODE'
  | 'CITATION'
  | 'REFERENCE';

export interface ReasoningHop {
  stepNumber: number;
  entityType: ECREEntityType;
  entityId: string;
  label: string;
  summary: string;
  citation?: SourceCitation;
  confidence: number;
}

export interface MultiHopReasoningResult {
  query: string;
  reasoningPath: ReasoningHop[];
  finalAnswer: string;
  confidenceScore: number;
  citations: string[];
}

export interface CrossDocumentEvidence {
  documentId: string;
  documentTitle: string;
  evidenceType: 'RULE' | 'EXCEPTION' | 'SCIENTIFIC_EXPLANATION' | 'HISTORICAL_CONTEXT' | 'COMMENTARY';
  statement: string;
  citation: SourceCitation;
  confidence: number;
}

export interface CrossDocumentReasoningResult {
  query: string;
  synthesizedAnswer: string;
  evidenceByDocument: CrossDocumentEvidence[];
  confidenceScore: number;
  citations: string[];
}

export interface ConflictSource {
  documentId: string;
  documentTitle: string;
  statement: string;
  confidence: number;
  evidence: string;
  citation: SourceCitation;
}

export interface ConflictReport {
  topic: string;
  sourceA: ConflictSource;
  sourceB: ConflictSource;
  status: 'CONSENSUS' | 'CONFLICT' | 'UNKNOWN';
  resolutionRationale: string;
  confidenceScore: number;
}

export interface EvidenceScoreBreakdown {
  confidenceScore: number; // 0..1
  authorityWeight: number; // 0..1
  freshnessScore: number; // 0..1
  semanticRelevance: number; // 0..1
  citationQuality: number; // 0..1
  graphDistancePenalty: number; // 0..1
  compositeScore: number; // 0..1
}

export interface ExplainableEvidenceItem {
  entityId: string;
  description: string;
  score: number;
  citation: string;
}

export interface ExplainableIgnoredItem {
  entityId: string;
  description: string;
  reasonIgnored: string;
}

export interface ExplainableAnswer {
  query: string;
  finalAnswer: string;
  reasoningSteps: string[];
  evidenceUsed: ExplainableEvidenceItem[];
  evidenceIgnored: ExplainableIgnoredItem[];
  confidence: number;
  alternativeInterpretations: string[];
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  zoneOrElement: string;
  expected: string;
  found: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  explanation: string;
  citation: string;
  evidence: string;
}

export interface RuleValidationResult {
  artifactType: 'FLOOR_PLAN' | 'YANTRA' | 'CHART' | 'DRAWING' | 'ROOM_LAYOUT';
  complianceScore: number; // 0..100
  matchedRulesCount: number;
  violations: RuleViolation[];
  passedRules: string[];
  evidenceList: string[];
}

export interface HypothesisItem {
  hypothesisId: string;
  causeOrPossibility: string;
  evidence: string[];
  probability: number; // 0..1
  classification: 'FACT' | 'INFERENCE' | 'HYPOTHESIS';
}

export interface HypothesisResult {
  query: string;
  knownFacts: string[];
  inferences: string[];
  hypotheses: HypothesisItem[];
  overallConfidence: number;
}

export interface KnowledgeHealthReport {
  totalNodesChecked: number;
  totalEdgesChecked: number;
  duplicateRulesCount: number;
  contradictionsCount: number;
  circularReferencesCount: number;
  unsupportedClaimsCount: number;
  missingCitationsCount: number;
  outdatedKnowledgeCount: number;
  overallHealthScore: number; // 0..100
  recommendedActions: string[];
}

export interface ReasoningTraceStep {
  stepIndex: number;
  timestamp: string;
  nodeOrActionId: string;
  nodeType: ECREEntityType | 'DECISION_POINT' | 'EVALUATION';
  inputData: any;
  outputData: any;
  explanation: string;
}

export interface ReasoningTraceLog {
  traceId: string;
  query: string;
  createdAt: string;
  steps: ReasoningTraceStep[];
  finalConclusion: string;
  isReplayable: boolean;
}

export interface CertificationBenchmarkMetrics {
  totalQueriesTested: number;
  reasoningAccuracyPct: number;
  evidenceAccuracyPct: number;
  citationAccuracyPct: number;
  conflictDetectionRatePct: number;
  hallucinationRatePct: number;
  unsupportedClaimRatePct: number;
  averageLatencyMs: number;
  status: 'PASS' | 'FAIL';
}
