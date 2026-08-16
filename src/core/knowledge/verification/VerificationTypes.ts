export type KnowledgeStatus = 
  | "CANONICAL" 
  | "DISPUTED" 
  | "DEPRECATED" 
  | "DRAFT" 
  | "ARCHIVED" 
  | "FUTURE";

export type EvidenceQuality = "HIGH" | "MEDIUM" | "LOW";

export interface SourceRef {
  id: string;
  title: string;
  author: string;
  edition?: string;
  publicationYear?: number;
  type: "PRIMARY" | "SUPPORTING" | "CONTRADICTING" | "RESEARCH" | "EXPERT" | "HISTORICAL";
  reliabilityScore: number;
}

export interface ExpertRef {
  id: string;
  name: string;
  title: string;
  rating: number;
  vote?: "APPROVE" | "REJECT" | "FLAG" | "REQUEST_REVISION";
  comment?: string;
}

export interface HistoricalRef {
  id: string;
  era: string;
  textName: string;
  verseOrChapter?: string;
}

export interface KnowledgeEvidence {
  ruleId: string;
  primarySources: SourceRef[];
  supportingSources: SourceRef[];
  contradictingSources: SourceRef[];
  researchSources: SourceRef[];
  expertReferences: ExpertRef[];
  historicalReferences: HistoricalRef[];
  evidenceCount: number;
  evidenceStrength: number; // 0 - 100
  evidenceQuality: EvidenceQuality;
  evidenceFreshness: number; // 0 - 100
}

export interface SourceReliabilityMetrics {
  sourceId: string;
  sourceName: string;
  authorityScore: number; // 0 - 100
  authenticityScore: number; // 0 - 100
  evidenceScore: number; // 0 - 100
  consistencyScore: number; // 0 - 100
  reviewScore: number; // 0 - 100
  usageFrequency: number;
  expertRating: number; // 0 - 100
  overallReliability: number; // 0 - 100
  isAutoRejected: boolean; // Always false by specification
}

export interface KnowledgeWeightMetrics {
  ruleId: string;
  sourceReliabilityWeight: number;
  evidenceCountWeight: number;
  expertApprovalWeight: number;
  conflictSeverityPenalty: number;
  historicalAcceptanceWeight: number;
  relationshipCompletenessWeight: number;
  ontologyCompletenessWeight: number;
  crossDomainSupportWeight: number;
  finalKnowledgeWeight: number; // 0.0 - 1.0
}

export type ConsensusActionType = 
  | "APPROVE"
  | "REJECT"
  | "FLAG"
  | "COMMENT"
  | "VOTE"
  | "REQUEST_REVISION"
  | "MERGE"
  | "SPLIT"
  | "CREATE_CONSENSUS";

export interface ExpertConsensusRecord {
  id: string;
  ruleId: string;
  action: ConsensusActionType;
  expertId: string;
  expertName: string;
  timestamp: string;
  comment?: string;
  voteValue?: number; // +1, -1, 0
  consensusState: "APPROVED_CANONICAL" | "REJECTED" | "PENDING_REVIEW" | "REVISION_REQUESTED";
}

export type ContradictionType = 
  | "BOOK_VS_BOOK"
  | "RESEARCH_VS_TRADITION"
  | "EXPERT_VS_EXPERT"
  | "EDITION_VS_EDITION"
  | "HISTORICAL_VS_MODERN";

export type ContradictionResolutionState = 
  | "UNRESOLVED"
  | "CONSENSUS_REACHED"
  | "CONTEXT_DEPENDENT"
  | "SUPERSEDED";

export interface ContradictionRecord {
  id: string;
  ruleId: string;
  contradictionType: ContradictionType;
  claimA: string;
  claimB: string;
  sourceAId: string;
  sourceBId: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  resolutionState: ContradictionResolutionState;
  resolutionNote?: string;
  history: Array<{
    timestamp: string;
    action: string;
    actor: string;
    notes: string;
  }>;
}

export interface CanonicalRule {
  ruleId: string;
  canonicalVersion: string;
  title: string;
  statement: string;
  domain: string;
  supportingEvidence: string[];
  confidenceScore: number;
  confidenceGrade: "A+" | "A" | "B" | "C" | "F";
  approvalDate: string;
  reviewer: string;
  status: "CANONICAL";
}

export interface KnowledgeConfidence {
  ruleId: string;
  confidenceScore: number; // 0 - 100
  confidenceGrade: "A+" | "A" | "B" | "C" | "F";
  confidenceExplanation: string;
  evidenceSummary: string;
  supportingDomains: string[];
  lastUpdated: string;
}

export interface DependencyNode {
  id: string;
  label: string;
  type: "ROOM" | "ELEMENT" | "DIRECTION" | "CHAKRA" | "DEITY" | "REMEDY" | "OBJECT" | "YANTRA" | "DOMAIN";
  domain: string;
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export type DomainType = "Vastu" | "Chakra" | "LalKitab" | "Numerology" | "Astrology" | "Research";

export interface CrossDomainVerificationResult {
  ruleId: string;
  primaryDomain: DomainType;
  participatingDomains: DomainType[];
  supportingDomains: DomainType[];
  conflictingDomains: DomainType[];
  alignmentScore: number; // 0 - 100
  crossDomainStatus: "ALIGNED" | "PARTIALLY_ALIGNED" | "CONFLICTING" | "NEUTRAL";
}

export interface SourceEdition {
  editionNumber: string;
  publicationYear: number;
  publisher: string;
  changesSummary: string;
  isDeprecated: boolean;
  replacementSourceId?: string;
}

export interface SourceVersionRecord {
  sourceId: string;
  sourceTitle: string;
  currentVersion: string;
  editions: SourceEdition[];
  deprecationDate?: string;
}

export interface RuleEvolutionSnapshot {
  version: string;
  timestamp: string;
  statement: string;
  evidenceAdded: string[];
  evidenceRemoved: string[];
  expertChanges: string[];
  changedBy: string;
  reason: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "RULE_CREATED" | "EVIDENCE_ADDED" | "RESEARCH_LINKED" | "EXPERT_REVIEW" | "CANONICAL_APPROVAL" | "REVISION_ISSUED";
  title: string;
  description: string;
  actor: string;
}

export type TruthNodeType = 
  | "TRUTH_NODE"
  | "EVIDENCE_NODE"
  | "SOURCE_NODE"
  | "CONSENSUS_NODE"
  | "CONFIDENCE_NODE"
  | "DEPENDENCY_NODE"
  | "VERSION_NODE";

export interface TruthGraphNode {
  id: string;
  type: TruthNodeType;
  label: string;
  data: Record<string, any>;
}

export interface TruthGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface TruthGraphData {
  nodes: TruthGraphNode[];
  edges: TruthGraphEdge[];
}

export interface AIExplainabilityOutput {
  ruleId: string;
  selectedRecommendation: string;
  whySelected: string;
  alternativeViewpoints: string[];
  supportingEvidence: string[];
  confidenceScore: number;
  confidenceGrade: "A+" | "A" | "B" | "C" | "F";
  approvalStatus: KnowledgeStatus;
  applicableConditions: string[];
}
