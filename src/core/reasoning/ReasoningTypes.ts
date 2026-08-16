export type KnowledgeDomain = 'Vastu' | 'Chakra' | 'LalKitab' | 'Numerology' | 'Astrology' | 'UserContext';

export type RecommendationCategory =
  | 'Vastu Spatial Alignment'
  | 'Astro-Elemental Balance'
  | 'Karmic Remedial Strategy'
  | 'Chakra Energetic Harmony'
  | 'Numeric Name Vibration'
  | 'Unified Cross-Domain Synergy';

export type RecommendationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RecommendationStatus = 'APPROVED' | 'DRAFT' | 'REJECTED_BY_ADMIN' | 'OVERRIDDEN';

export type ConflictResolutionStatus =
  | 'UNRESOLVED'
  | 'RESOLVED_PRIORITY'
  | 'CONTEXTUAL_SPLIT'
  | 'ADMIN_OVERRIDDEN';

export type UserRole = 'ADMIN' | 'END_USER';

// ----------------------------------------------------
// REASONING INPUT & UNIFIED CONTEXT
// ----------------------------------------------------
export interface IReasoningInput {
  propertyType?: 'Residential' | 'Commercial' | 'Industrial' | 'Personal Space';
  roomOrZone?: 'Northeast (Eeshan)' | 'Southwest (Nairutya)' | 'Northwest (Vayavya)' | 'Southeast (Agneya)' | 'Center (Brahmasthan)' | 'Entrance' | 'Master Bedroom' | 'Puja Room' | 'Kitchen' | 'Office Workspace';
  cardinalDirection?: 'North' | 'East' | 'South' | 'West' | 'Northeast' | 'Southeast' | 'Southwest' | 'Northwest';
  primaryElement?: 'Agni (Fire)' | 'Jala (Water)' | 'Prithvi (Earth)' | 'Vayu (Air)' | 'Akasha (Space)';
  associatedPlanet?: 'Surya (Sun)' | 'Chandra (Moon)' | 'Mangal (Mars)' | 'Budh (Mercury)' | 'Guru (Jupiter)' | 'Shukra (Venus)' | 'Shani (Saturn)' | 'Rahu' | 'Ketu';
  chakraZone?: 'Muladhara' | 'Swadhisthana' | 'Manipura' | 'Anahata' | 'Vishuddha' | 'Ajna' | 'Sahasrara';
  numerologyPathNumber?: number;
  numerologyNameNumber?: number;
  lalKitabHousePlacement?: number;
  astrologyRashiSign?: string;
  problemStatement?: string;
  projectMetadata?: Record<string, any>;
}

export interface IReasoningGraphNode {
  id: string;
  label: string;
  domain: KnowledgeDomain;
  entityId: string;
  canonicalName: string;
  sourceBook: string;
  confidenceScore: number;
  verificationStatus: string;
  attributes: Record<string, any>;
}

export interface IReasoningGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
  weight: number;
  description: string;
  isCrossDomain: boolean;
}

export interface IUnifiedReasoningContext {
  contextId: string;
  timestamp: string;
  inputs: IReasoningInput;
  nodes: IReasoningGraphNode[];
  edges: IReasoningGraphEdge[];
  domainCoverage: Record<KnowledgeDomain, number>;
  totalEntitiesLoaded: number;
}

// ----------------------------------------------------
// EVIDENCE BUNDLE & CITATIONS
// ----------------------------------------------------
export interface ISourceCitation {
  book: string;
  author: string;
  chapter: string;
  verseOrShloka?: string;
  sourceReliability: number;
}

export interface ISupportingEntityRef {
  domain: KnowledgeDomain;
  entityId: string;
  name: string;
  sourceBook: string;
  confidence: number;
}

export interface IEvidenceBundle {
  evidenceId: string;
  supportingDomains: KnowledgeDomain[];
  supportingEntities: ISupportingEntityRef[];
  supportingRules: string[];
  sourceCitations: ISourceCitation[];
  overallConfidence: number;
  verificationStatus: 'CANONICAL' | 'VERIFIED' | 'REVIEWED';
}

// ----------------------------------------------------
// CROSS-DOMAIN CONFLICTS
// ----------------------------------------------------
export interface IReasoningConflict {
  conflictId: string;
  domainA: KnowledgeDomain;
  domainB: KnowledgeDomain;
  claimA: string;
  claimB: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: ConflictResolutionStatus;
  resolutionStrategy?: string;
  winningDomain?: KnowledgeDomain;
  overrideNotes?: string;
  resolvedBy?: string;
  resolvedTimestamp?: string;
}

// ----------------------------------------------------
// EXPLAINABLE REASONING CHAIN
// ----------------------------------------------------
export interface IReasoningStep {
  stepNumber: number;
  title: string;
  description: string;
  domain: KnowledgeDomain;
  inputNodes: string[];
  ruleApplied: string;
  confidenceWeight: number;
}

export interface IRejectedEvidence {
  domain: KnowledgeDomain;
  entityId: string;
  name: string;
  reason: string;
}

export interface IRuleHierarchyItem {
  tier: number;
  name: string;
  priorityScore: number;
}

export interface IReasoningChain {
  chainId: string;
  recommendationId: string;
  steps: IReasoningStep[];
  contributingDomains: KnowledgeDomain[];
  rejectedEvidence: IRejectedEvidence[];
  ruleHierarchy: IRuleHierarchyItem[];
  overallChainConfidence: number;
  explanationSummary: string;
}

// ----------------------------------------------------
// STRUCTURED RECOMMENDATION OBJECT
// ----------------------------------------------------
export interface IRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  supportingEvidence: IEvidenceBundle;
  supportingDomains: KnowledgeDomain[];
  preconditions: string[];
  priority: RecommendationPriority;
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  expectedOutcome: string;
  dependencies: string[];
  conflicts: IReasoningConflict[];
  status: RecommendationStatus;
  version: string;
}

// ----------------------------------------------------
// REASONING SESSION & AUDIT
// ----------------------------------------------------
export interface IReasoningSession {
  sessionId: string;
  sessionTitle: string;
  timestamp: string;
  inputParams: IReasoningInput;
  unifiedContext: IUnifiedReasoningContext;
  recommendations: IRecommendation[];
  reasoningChains: IReasoningChain[];
  conflicts: IReasoningConflict[];
  auditLog: string[];
}

// ----------------------------------------------------
// END-USER SANITIZED RECOMMENDATION (RBAC RESTRICTED)
// ----------------------------------------------------
export interface IEndUserRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  priority: RecommendationPriority;
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  expectedOutcome: string;
  preconditions: string[];
  supportingDomains: KnowledgeDomain[];
}
