export type LalKitabEntityType =
  | 'Graha'             // Planet (Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu)
  | 'Bhav'              // House (1-12)
  | 'Remedy'            // Upay / Physical Rectification
  | 'Donation'          // Daan / Charity Item
  | 'Object'            // Physical Item (Copper pot, Solid Silver, Brass vessel, etc.)
  | 'Metal'             // Copper, Silver, Brass, Gold, Lead, Iron, Mercury, Alloy
  | 'Color'             // Red, White, Yellow, Green, Black, Blue, Grey, Brown
  | 'Animal'            // Dog, Monkey, Horse, Cow, Elephant, Snake, Crow
  | 'Bird'              // Pigeon, Crow, Peacock, Parrot
  | 'Tree'              // Neem, Peepal, Banyan, Kikar, Banana
  | 'Plant'             // Tulsi, Flowering plants, Thorny plants
  | 'FoodItem'          // Jaggery, Wheat, Milk, Rice, Honey, Aniseed, Gram, Mustard
  | 'Direction'         // North, South, East, West, NE, NW, SE, SW, Center
  | 'Room'              // Kitchen, Bedroom, Entrance, Courtyard, Toilet, Roof
  | 'RelationshipRule'  // Father, Mother, Brother, Sister, Spouse, In-laws, Uncle
  | 'TimeBasedRule'     // Day, Night, Annual Varshphal, Transits, Age cycles
  | 'ConditionalRule'   // If Planet X in Bhav Y and Bhav Z is empty/occupied
  | 'Symbol'            // Sacred geometric symbols, Tika, Yantra
  | 'Keyword'           // Key diagnostic terms
  | 'Chapter'           // Farman / Chapter in Lal Kitab editions
  | 'SourceReference';   // Original Manuscript edition

export type LalKitabRelationshipType =
  | 'ASSOCIATED_WITH'
  | 'AFFECTS'
  | 'LOCATED_IN'
  | 'RULES'
  | 'REQUIRES'
  | 'AVOIDS'
  | 'CONTRADICTS'
  | 'DEPENDS_ON'
  | 'ENHANCES'
  | 'WEAKENS'
  | 'REFERENCES'
  | 'RELATED_TO';

export type KnowledgeStatus = 'CANONICAL' | 'DRAFT' | 'DISPUTED' | 'DEPRECATED' | 'ARCHIVED';

export type ExpertReviewStatus = 'Pending' | 'Reviewed' | 'Approved' | 'Rejected' | 'Needs Revision';

export type EvidenceLevel =
  | 'Original Urdu Farman (1939-1952)'
  | 'Sanskrit Samudrik Parallel'
  | 'Validated Commentary Edition'
  | 'Expert SME Consensus'
  | 'Empirical Field Case';

export type KnowledgePriority = 'Mandatory Core' | 'High Systemic' | 'Moderate Supplemental' | 'Optional Contextual';

export interface ISourceTraceability {
  sourceBook: string;            // e.g. "Lal Kitab 1952 Farman"
  edition: string;               // e.g. "5th Edition Master Translation"
  publicationYear: number;       // e.g. 1952
  publisher: string;             // e.g. "Giridhari Lal / IGNCA Critical Edition"
  language: 'Urdu' | 'Hindi' | 'English' | 'Sanskrit';
  chapter: string;               // e.g. "Farman 14 - Surya Bhav 1"
  pageNumber: number;            // e.g. 142
  paragraph: string;             // e.g. "Para 3, Verse 12"
  ocrConfidence: number;         // e.g. 0.98 (98%)
  importBatch: string;           // e.g. "BATCH-2026-LK-001"
  importTimestamp: string;       // e.g. "2026-07-26T00:00:00Z"
  verificationStatus: KnowledgeStatus;
}

export interface ITruthEngineMetrics {
  sourceReliability: number;     // 0 - 100
  evidenceStrength: number;      // 0 - 100
  knowledgeWeight: number;       // 0.0 - 1.0
  confidenceScore: number;       // 0 - 100
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  expertConsensusStatus: ExpertReviewStatus;
  hasActiveConflict: boolean;
  isCanonical: boolean;
}

export interface ILalKitabOntologyEntity {
  id: string;
  canonicalName: string;
  alternateNames: string[];
  hindiName: string;
  englishName: string;
  urduName?: string;
  entityType: LalKitabEntityType;
  description: string;
  category: string;
  tags: string[];
  metadata: Record<string, any>;
  version: string;
  status: KnowledgeStatus;

  // Domain associations
  planetId?: string;             // Associated Graha if applicable
  houseNumber?: number;          // Associated Bhav (1-12) if applicable
  associatedDirection?: string;  // e.g. "South-East"
  associatedRoom?: string;       // e.g. "Kitchen"
  associatedMetal?: string;      // e.g. "Copper"
  associatedColor?: string;      // e.g. "Red / Crimson"

  // Traceability & Evidence
  sourceTraceability: ISourceTraceability;
  truthEngineMetrics: ITruthEngineMetrics;

  // Audit
  createdTimestamp: string;
  lastUpdatedTimestamp: string;
  lastUpdatedBy: string;
  revisionNotes: string[];
}

export interface ILalKitabRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: LalKitabRelationshipType;
  description: string;
  weight: number;                // 0.0 - 1.0
  isConditional: boolean;
  conditionText?: string;
  sourceBook: string;
  confidenceScore: number;
}

export interface ILalKitabConflict {
  conflictId: string;
  entityId: string;
  conflictType: 'Book vs Book' | 'Conditional Discrepancy' | 'Translation Variance' | 'Expert Disagreement';
  description: string;
  sourceA: string;
  claimA: string;
  sourceB: string;
  claimB: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'UNRESOLVED' | 'UNDER_REVIEW' | 'RESOLVED_CANONICAL' | 'CONTEXTUAL_SPLIT';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedTimestamp?: string;
}

export interface ILalKitabDuplicateMatch {
  matchId: string;
  primaryEntityId: string;
  candidateEntityId: string;
  similarityScore: number;       // 0 - 100
  matchingAttributes: string[];
  status: 'PENDING_REVIEW' | 'MERGED' | 'DISMISSED';
}

export interface ILalKitabQualityScoreBreakdown {
  ocrAccuracy: number;           // 0 - 100
  sourceAuthority: number;       // 0 - 100
  evidenceStrength: number;      // 0 - 100
  smeConsensus: number;          // 0 - 100
  ontologicalCompleteness: number; // 0 - 100
  overallScore: number;          // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
}

export interface ILalKitabEndUserEntity {
  id: string;
  canonicalName: string;
  hindiName: string;
  englishName: string;
  entityType: LalKitabEntityType;
  description: string;
  category: string;
  tags: string[];
  planetName?: string;
  houseNumber?: number;
  remedySummary?: string;
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  isCanonical: boolean;
}
