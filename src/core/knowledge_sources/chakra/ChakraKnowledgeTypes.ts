export type ChakraDocumentCategory =
  | 'Classical Tantric Scriptures'
  | 'Upanishadic Texts'
  | 'Kundalini Yoga Manuals'
  | 'Modern Biofield Research'
  | 'Chakra Sound & Frequency'
  | 'Aromatherapy & Herbal Shastra'
  | 'Vastu-Chakra Energy Integration'
  | 'Clinical Holism';

export type ChakraEntityType =
  | 'Chakra'
  | 'SubChakra'
  | 'Element'
  | 'Direction'
  | 'VastuZone'
  | 'Room'
  | 'Deity'
  | 'Shakti'
  | 'Petal'
  | 'BijaMantra'
  | 'Mudra'
  | 'Pranayama'
  | 'Yantra'
  | 'Crystal'
  | 'Metal'
  | 'Herb'
  | 'SoundFrequency'
  | 'Color'
  | 'Organ'
  | 'EndocrineGland'
  | 'NervousPlexus'
  | 'PsychologicalTrait'
  | 'Remedy'
  | 'Object'
  | 'EnergyField'
  | 'Dosha'
  | 'SymptomBlock';

export type ChakraRelationshipType =
  | 'SUPPORTS'
  | 'BALANCES'
  | 'WEAKENS'
  | 'BLOCKS'
  | 'STRENGTHENS'
  | 'AFFECTS'
  | 'CONNECTED_TO'
  | 'LOCATED_IN'
  | 'ASSOCIATED_WITH'
  | 'INTERACTS_WITH'
  | 'DEPENDS_ON'
  | 'CONFLICTS_WITH'
  | 'REMEDIED_BY'
  | 'INFLUENCES';

export type ExpertReviewStatus =
  | 'Pending'
  | 'Reviewed'
  | 'Approved'
  | 'Rejected'
  | 'Needs Revision';

export type EvidenceLevel =
  | 'Scriptural Canon'
  | 'Peer Reviewed'
  | 'Clinical Observational'
  | 'Expert Consensus'
  | 'Empirical Case Study';

export type KnowledgePriority =
  | 'Mandatory Core'
  | 'High Systemic'
  | 'Moderate Supplemental'
  | 'Optional Regional';

export interface IRevisionHistory {
  version: string;
  date: string;
  reviewer: string;
  changeSummary: string;
}

export interface IEvidenceMetadata {
  primarySource: string;
  secondarySource: string;
  supportingSources: string[];
  evidenceLevel: EvidenceLevel;
  knowledgePriority: KnowledgePriority;
  confidenceScore: number;
  approvalStatus: ExpertReviewStatus;
  expertReviewer: string;
  version: string;
  revisionHistory: IRevisionHistory[];
}

export interface ICompatibilityLink {
  targetChakraId: string;
  compatibilityScore: number;
  reason: string;
}

export interface IConflictLink {
  targetChakraId: string;
  conflictType: string;
  description: string;
}

export interface IFutureEnergyInteractionMatrix {
  relatedVastuZones: string[];
  relatedElements: string[];
  relatedDirections: string[];
  relatedRemedies: string[];
  relatedYantras: string[];
  relatedObjects: string[];
  relatedChakras: string[];
  compatibilityLinks: ICompatibilityLink[];
  conflictLinks: IConflictLink[];
}

export interface IChakraOntologyEntity extends IEvidenceMetadata {
  id: string;
  sanskritName: string;
  englishName: string;
  commonName: string;
  chakraNumber: number;
  element: string;
  color: string;
  geometry: string;
  symbol: string;
  lotusPetals: number;
  seedMantra: string;
  associatedDeity: string;
  associatedShakti: string;
  bodyRegion: string;
  organs: string[];
  endocrineGlands: string[];
  nervousSystem: string[];
  emotionalFunctions: string[];
  psychologicalFunctions: string[];
  spiritualFunctions: string[];
  balancedState: string;
  underactiveIndicators: string[];
  overactiveIndicators: string[];
  blockedIndicators: string[];
  positiveTraits: string[];
  negativeTraits: string[];
  meditationMethods: string[];
  breathingPractices: string[];
  mudras: string[];
  mantras: string[];
  yantras: string[];
  crystals: string[];
  metals: string[];
  herbs: string[];
  soundTherapy: string[];
  colorTherapy: string[];
  frequencies: string[];
  approvedRemedies: string[];
  contraindications: string[];
  expertNotes: string;
  
  // Cross Domain Links
  crossDomainLinks: {
    panchaMahabhuta: string;
    direction: string;
    roomType: string;
    vastuZone: string;
    primaryRemedy: string;
    primaryYantra: string;
    primaryObject: string;
    energyFieldType: string;
  };

  // Schema Preparation for Future DOMAIN-007 Energy Interaction Matrix
  futureInteractionMatrix: IFutureEnergyInteractionMatrix;
}

export interface IChakraRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: ChakraRelationshipType;
  description: string;
  weight: number;
  sourceDocumentId: string;
  approvalStatus: ExpertReviewStatus;
  confidenceScore: number;
  evidenceLevel: EvidenceLevel;
}

export interface IChakraKnowledgeConflict {
  id: string;
  chakraIdOrTopic: string;
  topicName: string;
  sourceAId: string;
  sourceATitle: string;
  statementA: string;
  sourceBId: string;
  sourceBTitle: string;
  statementB: string;
  conflictType: 'Book A vs Book B' | 'Research vs Traditional' | 'Contradictory Remedy' | 'Contradictory Association';
  reviewStatus: ExpertReviewStatus;
  expertNotes?: string;
  reviewedBy?: string;
  detectedAt: string;
}

export interface IChakraDuplicateMatch {
  sourceId: string;
  sourceTitle: string;
  matchedId: string;
  matchedTitle: string;
  similarityScore: number;
  matchType: 'Duplicate Chakra Entity' | 'Duplicate Remedy' | 'Duplicate Mantra' | 'Duplicate Symbol';
  recommendation: 'Reject & Merge' | 'Flag for Expert Review' | 'Keep Separate Node';
}

export interface IChakraQualityScoreBreakdown {
  overallScore: number;
  sourceQualityScore: number;
  evidenceCountScore: number;
  expertApprovalScore: number;
  relationshipCompletenessScore: number;
  ontologyCompletenessScore: number;
  duplicateDeductionScore: number;
  conflictDeductionScore: number;
  qualityGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  recommendations: string[];
}

export interface IChakraDocumentMetadata {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  category: ChakraDocumentCategory;
  subject: string;
  keywords: string[];
  pageCount: number;
  approvalStatus: ExpertReviewStatus;
  qualityScore: number;
  version: string;
}
