// ============================================================================
// URJAFLUX AI OS - BLUEPRINT SEMANTIC UNDERSTANDING ENGINE (BSUE v1.0)
// Canonical Semantic Blueprint Understanding Type Definitions
// ============================================================================

import { 
  IBlueprintMathematicalModel, 
  IBmueRoomCandidate, 
  IBmueWallVector 
} from "../../bmue/types/bmue.types";

import { IPoint2D } from "../../spatial_recognition/types/sre.v3.types";

// ----------------------------------------------------------------------------
// Step 1: Semantic Fusion Types
// ----------------------------------------------------------------------------
export interface IEvidenceSource {
  sourceType: 'GEOMETRY' | 'OCR' | 'OBJECT' | 'CONNECTIVITY' | 'WINDOW_VENTILATION' | 'VASTU_ZONE';
  evidenceKey: string;
  weight: number;
  description: string;
  rawConfidence: number;
}

export interface IFusedEvidenceBundle {
  entityId: string;
  primaryTypeCandidate: string;
  sources: IEvidenceSource[];
  fusedConfidenceScore: number;
  dominantSource: 'GEOMETRY' | 'OCR' | 'OBJECT' | 'MULTI_SOURCE_FUSION';
  hasConflictingEvidence: boolean;
}

export interface ISemanticFusionSummary {
  fusedBundles: IFusedEvidenceBundle[];
  totalEntitiesFused: number;
  conflictingEntityCount: number;
}

// ----------------------------------------------------------------------------
// Step 2: Blueprint Grammar Types
// ----------------------------------------------------------------------------
export type BmueCanonicalTerm =
  | 'KITCHEN'
  | 'BEDROOM'
  | 'MASTER_BEDROOM'
  | 'GUEST_BEDROOM'
  | 'CHILDREN_BEDROOM'
  | 'TOILET'
  | 'BATHROOM'
  | 'LIVING_ROOM'
  | 'DINING_ROOM'
  | 'STORE_ROOM'
  | 'TEMPLE'
  | 'OFFICE'
  | 'UTILITY'
  | 'BALCONY'
  | 'STAIRCASE'
  | 'CIRCULATION'
  | 'UNKNOWN_SEMANTIC';

export interface IGrammarMapping {
  rawTerm: string;
  normalizedTerm: BmueCanonicalTerm;
  languageDetected: 'ENGLISH' | 'HINDI' | 'HINGLISH' | 'ABBREVIATION';
  confidence: number;
}

export interface IGrammarDictionary {
  mappings: IGrammarMapping[];
  supportedLanguages: string[];
}

// ----------------------------------------------------------------------------
// Step 3: Semantic Room Types
// ----------------------------------------------------------------------------
export interface ISemanticRoom {
  roomId: string;
  polygonId: string;
  canonicalType: BmueCanonicalTerm;
  semanticLabel: string;
  confidence: number;
  areaSqMeters: number;
  centroid: IPoint2D;
  supportingEvidence: IEvidenceSource[];
  isAmbiguous: boolean;
}

// ----------------------------------------------------------------------------
// Step 4: Functional Space Types
// ----------------------------------------------------------------------------
export type BmueFunctionalCategory =
  | 'PRIMARY_HABITABLE'
  | 'SECONDARY_SERVICE'
  | 'COMMUNAL'
  | 'SANITARY'
  | 'STORAGE'
  | 'DEVOTIONAL'
  | 'CIRCULATION'
  | 'UTILITY'
  | 'MIXED_USAGE';

export interface IFunctionalSpace {
  spaceId: string;
  roomId: string;
  primaryFunction: BmueFunctionalCategory;
  secondaryFunctions: BmueFunctionalCategory[];
  isMixedUsage: boolean;
  mixedUsageDescription?: string;
  convertibleCapabilities: string[];
}

// ----------------------------------------------------------------------------
// Step 5: Architectural Symbol Types
// ----------------------------------------------------------------------------
export type BmueSymbolType =
  | 'WC'
  | 'WASH_BASIN'
  | 'STOVE'
  | 'DOOR_LABEL'
  | 'WINDOW_LABEL'
  | 'STAIR_DIRECTION_UP'
  | 'STAIR_DIRECTION_DN'
  | 'COLUMN'
  | 'BEAM'
  | 'SHAFT'
  | 'ELECTRICAL_PANEL'
  | 'DISTRIBUTION_BOARD'
  | 'STP'
  | 'UNDERGROUND_TANK'
  | 'OVERHEAD_TANK'
  | 'UNKNOWN_SYMBOL';

export interface ISemanticSymbol {
  symbolId: string;
  rawSymbol: string;
  semanticType: BmueSymbolType;
  meaning: string;
  location: IPoint2D;
  associatedRoomId?: string;
  confidence: number;
}

// ----------------------------------------------------------------------------
// Step 6: Room Relationship Types
// ----------------------------------------------------------------------------
export type BmueRelationshipType =
  | 'ATTACHED'
  | 'ADJACENT_WALL_SHARING'
  | 'DIRECTLY_CONNECTED_BY_DOOR'
  | 'VENTILATED_TO'
  | 'ENCLOSED_WITHIN'
  | 'ACCESS_ROUTE';

export interface ISemanticRelationshipEdge {
  relationshipId: string;
  sourceRoomId: string;
  targetRoomId: string;
  type: BmueRelationshipType;
  description: string;
  strengthScore: number;
}

export interface ISemanticRelationshipGraph {
  edges: ISemanticRelationshipEdge[];
  attachedToiletPairs: Array<{ bedroomId: string; toiletId: string }>;
  kitchenDiningPairs: Array<{ kitchenId: string; diningId: string }>;
}

// ----------------------------------------------------------------------------
// Step 7: Spatial Function Types
// ----------------------------------------------------------------------------
export type BmueSpatialPrivacyZone =
  | 'PUBLIC'
  | 'SEMI_PUBLIC'
  | 'PRIVATE'
  | 'SERVICE'
  | 'UTILITY'
  | 'CIRCULATION'
  | 'OPEN'
  | 'DEAD_SPACE';

export interface ISpatialFunctionAssignment {
  roomId: string;
  privacyZone: BmueSpatialPrivacyZone;
  usageDensity: 'HIGH' | 'MEDIUM' | 'LOW';
  accessibilityLevel: 'PUBLIC_ACCESSIBLE' | 'PRIVATE_RESTRICTED' | 'SERVICE_ACCESS_ONLY';
}

// ----------------------------------------------------------------------------
// Step 8 & Step 9: Semantic Consistency & Self-Correction Types
// ----------------------------------------------------------------------------
export interface ISemanticInconsistency {
  inconsistencyId: string;
  roomId: string;
  ruleName: string;
  severity: 'WARNING' | 'CONFLICT' | 'AMBIGUITY';
  description: string;
  evidenceConflict: {
    ocrType?: string;
    objectTypes?: string[];
    geometricType?: string;
  };
  resolutionStatus: 'RESOLVED_BY_GEOMETRY' | 'MARKED_FOR_CONSULTANT_REVIEW';
}

export interface IAmbiguityRecord {
  entityId: string;
  reason: string;
  suggestedAction: 'CONSULTANT_REVIEW_REQUIRED' | 'GEOMETRY_OVERRIDE_APPLIED';
  conflictingLabels: string[];
}

export interface ISemanticSelfCorrectionReport {
  inconsistencies: ISemanticInconsistency[];
  ambiguityRegistry: IAmbiguityRecord[];
  consultantReviewRequested: boolean;
}

// ----------------------------------------------------------------------------
// Step 10: Blueprint Knowledge Readiness Types (KQE/KIE Ready)
// ----------------------------------------------------------------------------
export interface IKnowledgeReadyRoom {
  roomId: string;
  type: string;
  areaSqMeters: number;
  privacyZone: string;
  associatedActivities: string[];
  containedObjects: string[];
  connectedRoomIds: string[];
}

export interface IKnowledgeReadyContext {
  propertyId: string;
  propertyName: string;
  totalHabitableRooms: number;
  totalSanitaryRooms: number;
  hasAttachedBathrooms: boolean;
  hasOpenKitchen: boolean;
  overallSemanticConfidence: number;
  rooms: IKnowledgeReadyRoom[];
  semanticKeywords: string[];
}

// ----------------------------------------------------------------------------
// Step 11: Semantic Proof Package Types
// ----------------------------------------------------------------------------
export interface ISemanticConfidenceProfile {
  overallSemanticConfidence: number;
  fusionConfidence: number;
  grammarConfidence: number;
  classificationConfidence: number;
  relationshipConfidence: number;
}

export interface ISemanticProofPackage {
  proofHash: string;
  isVerified: boolean;
  auditTimestamp: string;
  semanticGraphNodeCount: number;
  semanticGraphEdgeCount: number;
  knowledgeReadinessPassed: boolean;
  zeroHallucinationAuditPassed: boolean;
}

// ----------------------------------------------------------------------------
// Future Reserved Hooks (BSUE)
// ----------------------------------------------------------------------------
export interface IBsueFutureReservedHooks {
  llmSemanticReview?: any;
  bimSemanticMapping?: any;
  ifcSemanticExport?: any;
  dwgSemanticLayers?: any;
  commercialTaxonomy?: any;
  hospitalTaxonomy?: any;
  industrialTaxonomy?: any;
  hotelTaxonomy?: any;
  schoolTaxonomy?: any;
  templeTaxonomy?: any;
}

// ----------------------------------------------------------------------------
// Canonical Output Contract
// ----------------------------------------------------------------------------
export interface IBlueprintSemanticModel {
  propertyId: string;
  propertyName: string;
  version: '1.0.0-BSUE-SEMANTIC-CANONICAL';
  timestamp: string;

  semanticRooms: ISemanticRoom[];
  semanticObjects: Array<{ objectId: string; canonicalType: string; roomId: string; confidence: number }>;
  functionalSpaces: IFunctionalSpace[];
  architecturalSymbols: ISemanticSymbol[];
  grammarMappings: IGrammarDictionary;
  relationshipGraph: ISemanticRelationshipGraph;
  semanticGraph: {
    nodes: Array<{ id: string; label: string; category: string }>;
    edges: ISemanticRelationshipEdge[];
  };
  evidenceFusion: ISemanticFusionSummary;
  confidenceProfiles: ISemanticConfidenceProfile;
  ambiguityRegistry: IAmbiguityRecord[];
  knowledgeReadyContext: IKnowledgeReadyContext;
  semanticProofPackage: ISemanticProofPackage;

  futureHooks?: IBsueFutureReservedHooks;
}
