export type AstrologyEntityType =
  | 'Graha'
  | 'Rashi'
  | 'Nakshatra'
  | 'Bhava'
  | 'Yoga'
  | 'DivisionalChart'
  | 'DashaConcept'
  | 'PlanetaryState'
  | 'Aspect'
  | 'Karaka'
  | 'Gemstone'
  | 'Metal'
  | 'Color'
  | 'Element'
  | 'Direction'
  | 'BodyPart'
  | 'Symbol'
  | 'Keyword'
  | 'Chapter'
  | 'SourceReference';

export type AstrologyRelationshipType =
  | 'RULES'
  | 'OCCUPIES'
  | 'EXALTED_IN'
  | 'DEBILITATED_IN'
  | 'OWNS'
  | 'ASPECTS'
  | 'CONJOINS'
  | 'REPRESENTS'
  | 'ASSOCIATED_WITH'
  | 'RELATED_TO'
  | 'ENHANCES'
  | 'WEAKENS'
  | 'DEPENDS_ON'
  | 'REFERENCES'
  | 'CONFLICTS_WITH';

export type KnowledgeStatus = 'CANONICAL' | 'DRAFT' | 'DISPUTED' | 'DEPRECATED' | 'ARCHIVED';
export type EvidenceLevel = 'PRIMARY_MANUSCRIPT' | 'CRITICAL_COMMENTARY' | 'SECONDARY_TEXT' | 'ORAL_TRADITION';
export type ExpertReviewStatus = 'Pending' | 'Reviewed' | 'Approved' | 'Rejected';
export type KnowledgePriority = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM' | 'P3_LOW';

export interface ISourceTraceability {
  sourceBook: string;
  edition: string;
  author: string;
  publicationYear: number;
  publisher: string;
  language: 'Sanskrit' | 'English' | 'Hindi' | 'Tamil';
  chapter: string;
  verseOrShloka: string;
  pageNumber: number;
  paragraph: string;
  ocrConfidence: number; // 0.0 to 1.0
  importBatch: string;
  importTimestamp: string;
  verificationStatus: KnowledgeStatus;
}

export interface ITruthEngineMetrics {
  sourceReliability: number; // 0 to 100
  evidenceStrength: number;  // 0 to 100
  knowledgeWeight: number;   // 0.0 to 1.0
  confidenceScore: number;   // 0 to 100
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  expertConsensusStatus: ExpertReviewStatus;
  hasActiveConflict: boolean;
  isCanonical: boolean;
}

export interface IAstrologyOntologyEntity {
  id: string;
  canonicalName: string;
  alternateNames: string[];
  sanskritName?: string;
  hindiName?: string;
  englishName?: string;
  entityType: AstrologyEntityType;
  description: string;
  category: string;
  tags: string[];
  version: string;
  status: KnowledgeStatus;

  // Attributes
  associatedRashi?: string;
  associatedBhava?: number;
  associatedNakshatra?: string;
  associatedPlanet?: string;
  associatedElement?: string;
  associatedColor?: string;
  associatedMetal?: string;
  associatedGemstone?: string;
  associatedDirection?: string;
  associatedBodyPart?: string;

  // Metadata & Classical Parameters
  metadata: Record<string, any>;

  // Source Traceability & Truth Engine Metrics
  sourceTraceability: ISourceTraceability;
  truthEngineMetrics: ITruthEngineMetrics;

  // Governance Audit
  revisionNotes: string[];
  lastUpdatedBy: string;
  lastUpdatedTimestamp: string;
}

export interface IAstrologyRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: AstrologyRelationshipType;
  weight: number; // 0.0 to 1.0
  isConditional: boolean;
  conditionText?: string;
  description: string;
  sourceBook?: string;
}

export interface IAstrologyConflict {
  conflictId: string;
  entityId: string;
  conflictType: 'TRADITION_DISCREPANCY' | 'EXALTATION_DEGREE_MISMATCH' | 'YOGA_FORMATION_CONTRADICTION' | 'HOUSE_SYSTEM_SPLIT';
  sourceA: string;
  claimA: string;
  sourceB: string;
  claimB: string;
  description: string;
  status: 'UNRESOLVED' | 'RESOLVED_CANONICAL' | 'CONTEXTUAL_SPLIT';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedTimestamp?: string;
}

export interface IAstrologyDuplicateMatch {
  matchId: string;
  primaryEntityId: string;
  candidateEntityId: string;
  similarityScore: number; // 0 to 100
  matchingAttributes: string[];
  status: 'PENDING_REVIEW' | 'MERGED' | 'DISMISSED';
}

export interface IAstrologyQualityScoreBreakdown {
  ocrAccuracy: number;
  sourceAuthority: number;
  evidenceStrength: number;
  smeConsensus: number;
  ontologicalCompleteness: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
}

export interface IAstrologyEndUserEntity {
  id: string;
  canonicalName: string;
  sanskritName?: string;
  hindiName?: string;
  englishName?: string;
  entityType: AstrologyEntityType;
  description: string;
  category: string;
  tags: string[];
  associatedRashi?: string;
  associatedBhava?: number;
  associatedNakshatra?: string;
  associatedPlanet?: string;
  associatedElement?: string;
  associatedColor?: string;
  associatedGemstone?: string;
  associatedDirection?: string;
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  isCanonical: boolean;
}
