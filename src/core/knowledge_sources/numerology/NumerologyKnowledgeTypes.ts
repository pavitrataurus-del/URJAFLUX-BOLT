export type NumerologyEntityType =
  | 'Number'
  | 'MasterNumber'
  | 'CompoundNumber'
  | 'BirthNumber'
  | 'DestinyNumber'
  | 'NameNumber'
  | 'SoulNumber'
  | 'PersonalityNumber'
  | 'ExpressionNumber'
  | 'KarmicNumber'
  | 'MissingNumber'
  | 'RepeatingNumber'
  | 'LuckyNumber'
  | 'UnluckyNumber'
  | 'Alphabet'
  | 'LetterValue'
  | 'Element'
  | 'Color'
  | 'Planet'
  | 'Direction'
  | 'Day'
  | 'Month'
  | 'Year'
  | 'Cycle'
  | 'Vibration'
  | 'Trait'
  | 'Strength'
  | 'Weakness'
  | 'Career'
  | 'Relationship'
  | 'HealthAssociation'
  | 'Remedy'
  | 'Symbol'
  | 'Keyword'
  | 'Chapter'
  | 'SourceReference';

export type NumerologyRelationshipType =
  | 'ASSOCIATED_WITH'
  | 'REPRESENTS'
  | 'INFLUENCES'
  | 'SUPPORTS'
  | 'CONFLICTS_WITH'
  | 'ENHANCES'
  | 'WEAKENS'
  | 'RELATED_TO'
  | 'DEPENDS_ON'
  | 'REFERENCES';

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
  language: 'Sanskrit' | 'English' | 'Hindi' | 'Chaldean' | 'Hebrew' | 'Greek';
  chapter: string;
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

export interface INumerologyOntologyEntity {
  id: string;
  canonicalName: string;
  alternateNames: string[];
  numberValue?: number;
  system?: 'Pythagorean' | 'Chaldean' | 'Vedic' | 'Kabbalah';
  entityType: NumerologyEntityType;
  description: string;
  category: string;
  tags: string[];
  version: string;
  status: KnowledgeStatus;

  // Attributes
  associatedPlanet?: string;
  associatedElement?: string;
  associatedColor?: string;
  associatedDirection?: string;
  associatedDay?: string;
  associatedGemstone?: string;

  // Metadata & Rules
  metadata: Record<string, any>;

  // Source Traceability & Truth Engine Metrics
  sourceTraceability: ISourceTraceability;
  truthEngineMetrics: ITruthEngineMetrics;

  // Governance Audit
  revisionNotes: string[];
  lastUpdatedBy: string;
  lastUpdatedTimestamp: string;
}

export interface INumerologyRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: NumerologyRelationshipType;
  weight: number; // 0.0 to 1.0
  isConditional: boolean;
  conditionText?: string;
  description: string;
  sourceBook?: string;
}

export interface INumerologyConflict {
  conflictId: string;
  entityId: string;
  conflictType: 'SYSTEM_DISCREPANCY' | 'MEANING_CONTRADICTION' | 'PLANET_MISMATCH' | 'REMEDY_OPPOSITION';
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

export interface INumerologyDuplicateMatch {
  matchId: string;
  primaryEntityId: string;
  candidateEntityId: string;
  similarityScore: number; // 0 to 100
  matchingAttributes: string[];
  status: 'PENDING_REVIEW' | 'MERGED' | 'DISMISSED';
}

export interface INumerologyQualityScoreBreakdown {
  ocrAccuracy: number;
  sourceAuthority: number;
  evidenceStrength: number;
  smeConsensus: number;
  ontologicalCompleteness: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
}

export interface INumerologyEndUserEntity {
  id: string;
  canonicalName: string;
  numberValue?: number;
  system?: string;
  entityType: NumerologyEntityType;
  description: string;
  category: string;
  tags: string[];
  associatedPlanet?: string;
  associatedElement?: string;
  associatedColor?: string;
  associatedDirection?: string;
  associatedDay?: string;
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  isCanonical: boolean;
}
