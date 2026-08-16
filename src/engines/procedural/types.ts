export type RuleDomain = "VASTU" | "LAL_KITAB" | "NUMEROLOGY";
export type RuleSeverity = 
  | "CATASTROPHIC" 
  | "CRITICAL" 
  | "MAJOR" 
  | "HIGH" 
  | "MODERATE" 
  | "MEDIUM" 
  | "MINOR" 
  | "LOW";

export interface CitationMetadataPlaceholder {
  bookTitle?: string;
  chapter?: string;
  pageNumber?: number;
  author?: string;
  tradition?: string;
}

export interface CandidateAstMetadataPlaceholder {
  astVersion?: string;
  nodeCount?: number;
  sourceHash?: string;
  compiledAt?: string;
  status?: "PLACEHOLDER_STATIC" | "COMPILED" | "PENDING_APPROVAL";
}

export interface ProceduralRule {
  id: string;
  domain: RuleDomain;
  category: string;
  elementType: string; // e.g. "kitchen", "master_bedroom", "toilet", "main_entrance", etc.
  zones: string[]; // 16 zone codes e.g. ["NE", "NNE"] or ["SW", "SSW"] where this rule applies
  ruleType: "DEFECT" | "BENEFICIAL" | "NEUTRAL";
  severity: RuleSeverity;
  title: string;
  description: string;
  remedy: string;
  citationMetadata: CitationMetadataPlaceholder;
  candidateAstMetadata: CandidateAstMetadataPlaceholder;
}

export interface RuleEvaluationContext {
  elementId: string;
  /** Verbatim OCR label for display and reporting */
  elementName: string;
  displayName: string;
  /** Canonical architectural category for rule matching */
  canonicalType: string;
  /** Rule-registry element key derived from canonicalType */
  elementType: string;
  assignedZone: string; // e.g. "North-East (NE / Ishanya)", "South-West (SW / Nirriti)", "Brahmasthan", etc.
  rawAngle: number;
  center: { x: number; y: number };
  netNorthAngle: number;
}

export interface EvaluationResultItem {
  id: string;
  ruleId: string;
  domain: RuleDomain;
  title: string;
  severity: RuleSeverity;
  zone: string;
  description: string;
  remedy: string;
  elementName: string;
  ruleType: "DEFECT" | "BENEFICIAL" | "NEUTRAL";
  citationMetadata?: CitationMetadataPlaceholder;
  candidateAstMetadata?: CandidateAstMetadataPlaceholder;
}

export interface ProceduralDiagnostics {
  registeredRulesCount: number;
  applicableRulesCount: number;
  executedRulesCount: number;
  triggeredRulesCount: number;
  findingsCount: number;
  recommendationsCount: number;
  netNorthAngle: number;
  domainsEvaluated: RuleDomain[];
}
