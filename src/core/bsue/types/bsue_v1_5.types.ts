// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENTERPRISE HARDENING TYPE DEFINITIONS
// Enterprise Spatial Cognition Preparation Interfaces & Data Contracts
// FULL BACKWARD COMPATIBILITY MAINTAINED
// ============================================================================

import { 
  IBlueprintSemanticModel, 
  ISemanticRoom, 
  ISemanticRelationshipGraph, 
  IFunctionalSpace, 
  IEvidenceSource, 
  IKnowledgeReadyContext,
  IKnowledgeReadyRoom
} from "./bsue.types";

import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

// ----------------------------------------------------------------------------
// 1. Property Taxonomy Types
// ----------------------------------------------------------------------------
export type BsuePropertyType =
  | 'Residential'
  | 'Apartment'
  | 'Duplex'
  | 'Villa'
  | 'Farm House'
  | 'Office'
  | 'Commercial Shop'
  | 'Restaurant'
  | 'Hotel'
  | 'Hospital'
  | 'School'
  | 'College'
  | 'Temple'
  | 'Factory'
  | 'Warehouse'
  | 'Mall'
  | 'Industrial Plant'
  | 'Mixed Use'
  | 'Unknown';

export type BsuePropertyCategory =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INSTITUTIONAL'
  | 'INDUSTRIAL'
  | 'RELIGIOUS'
  | 'MIXED_USE'
  | 'UNKNOWN';

export interface IPropertyTaxonomy {
  propertyType: BsuePropertyType;
  propertyCategory: BsuePropertyCategory;
  usageClassification: string;
  taxonomyConfidence: number;
  supportingEvidence: IEvidenceSource[];
  isGuessed: false; // Founder lock: Never guess
}

// ----------------------------------------------------------------------------
// 2. Activity Inference Types
// ----------------------------------------------------------------------------
export interface IRoomActivityInference {
  roomId: string;
  primaryActivity: string;
  secondaryActivities: string[];
  activityConfidence: number;
}

export interface IActivityInferenceSummary {
  roomActivities: IRoomActivityInference[];
  uniqueActivitiesIdentified: string[];
}

// ----------------------------------------------------------------------------
// 3. Human Flow Types
// ----------------------------------------------------------------------------
export interface IFlowVector {
  fromRoomId: string;
  toRoomId: string;
  flowType: 'PUBLIC' | 'PRIVATE' | 'SERVICE' | 'MAIN_ENTRANCE';
  capacityScore: number;
}

export interface IHumanFlowAnalysis {
  mainEntranceFlow: {
    entryDoorId?: string;
    entryRoomId?: string;
    primaryHubRoomId?: string;
    accessibilityScore: number;
    flowDescription: string;
  };
  dailyMovement: {
    routinePaths: Array<{ pathName: string; roomSequence: string[]; frequencyScore: number }>;
  };
  privateCirculation: {
    privateRoomIds: string[];
    internalConnectivityScore: number;
  };
  publicCirculation: {
    publicRoomIds: string[];
    gatheringAccessibilityScore: number;
  };
  serviceCirculation: {
    serviceRoomIds: string[];
    utilityAccessScore: number;
  };
  deadEnds: string[];
  disconnectedAreas: string[];
  movementGraph: {
    nodes: string[];
    vectors: IFlowVector[];
  };
  futureHooks: {
    accessibilityAnalysis: {
      adaCompliant: boolean;
      doorwayPassableCount: number;
      wheelchairTurnaroundZones: string[];
    };
    fireEscape: {
      primaryEgressRoute: string[];
      maxEgressDistanceMeters: number;
      egressBottlenecks: string[];
    };
    emergencyEvacuation: {
      evacuationCapacityRatePerMin: number;
      hazardPoints: string[];
    };
  };
}

// ----------------------------------------------------------------------------
// 4. Usage Probability Types
// ----------------------------------------------------------------------------
export interface IUsageCandidate {
  usageLabel: string;
  probability: number; // 0.0 to 1.0 (Sums to 1.0)
  rationale: string;
}

export interface IRoomUsageProbability {
  roomId: string;
  usageCandidates: IUsageCandidate[];
  topProbableUsage: string;
  supportingEvidence: string[];
  isDecisionForced: false; // Founder lock: Never force a decision
}

// ----------------------------------------------------------------------------
// 5. Consultant Override Memory Types
// ----------------------------------------------------------------------------
export interface IConsultantOverrideRecord {
  overrideId: string;
  roomId: string;
  originalClassification: string;
  consultantClassification: string;
  reason: string;
  timestamp: string;
  user: string;
}

export interface IAuditTrailEntry {
  auditId: string;
  timestamp: string;
  user: string;
  action: 'CREATE_OVERRIDE' | 'UPDATE_OVERRIDE' | 'DELETE_OVERRIDE';
  previousState?: any;
  newState?: any;
}

export interface IConsultantOverrideStore {
  overrides: IConsultantOverrideRecord[];
  auditTrail: IAuditTrailEntry[];
}

// ----------------------------------------------------------------------------
// 6. Blueprint Quality Advisor Types
// ----------------------------------------------------------------------------
export interface IQualityIssue {
  code: string;
  message: string;
  severity: 'BLOCKING' | 'WARNING';
  affectedEntities?: string[];
}

export interface IBlueprintQualityReport {
  qualityScore: number; // 0 to 100
  checksPerformed: {
    northMissing: boolean;
    scaleMissing: boolean;
    ocrWeak: boolean;
    lowResolution: boolean;
    brokenWalls: boolean;
    openPolygons: boolean;
    missingLabels: boolean;
    unknownObjects: boolean;
  };
  blockingIssues: IQualityIssue[];
  warnings: IQualityIssue[];
  recommendations: string[];
  uploadSuggestions: string[];
}

// ----------------------------------------------------------------------------
// 7. Spatial Behavior Types
// ----------------------------------------------------------------------------
export interface ISpatialBehaviorMap {
  publicZone: string[];
  privateZone: string[];
  semiPrivateZone: string[];
  utilityZone: string[];
  heatZone: string[];
  waterZone: string[];
  noiseZone: string[];
  movementZone: string[];
  interactionZone: string[];
  futureExpansion: {
    energyFlow: {
      thermalEnvelopeAreaSqM: number;
      passiveSolarGainExposures: string[];
      hvacZoneDivision: Array<{ zoneName: string; roomIds: string[] }>;
    };
    ventilation: {
      crossVentilationCorridors: Array<{ fromWindowId: string; toWindowId: string; viaRoomIds: string[] }>;
      airChangeEfficiencyScore: number;
    };
    daylight: {
      daylitRoomIds: string[];
      deepDarkZones: string[];
    };
  };
}

// ----------------------------------------------------------------------------
// 8. Consistency Explainability Types
// ----------------------------------------------------------------------------
export interface IRoomDecisionExplainability {
  roomId: string;
  decisionLabel: string;
  confidence: number;
  evidence: {
    geometry: string;
    ocr: string;
    objects: string[];
    relationships: string[];
  };
  rulesApplied: string[];
  contradictions: string[];
  explainabilityTree: {
    rootNode: string;
    branches: Array<{ condition: string; weight: number; result: string }>;
  };
}

export interface IConsistencyExplainabilityReport {
  roomExplainabilities: IRoomDecisionExplainability[];
  taxonomyExplainability: {
    decision: string;
    evidenceSummary: string[];
    rulesApplied: string[];
  };
  overallModelConfidence: number;
  unresolvedContradictionsCount: number;
}

// ----------------------------------------------------------------------------
// 9. Semantic Knowledge Export Package Types
// ----------------------------------------------------------------------------
export interface ISemanticKnowledgeExportPackage {
  exportVersion: '1.5.0-BSUE-ENTERPRISE';
  timestamp: string;
  propertyId: string;
  propertyName: string;
  knowledgeReadyRooms: IKnowledgeReadyRoom[];
  knowledgeReadyActivities: Array<{ roomId: string; primaryActivity: string; secondaryActivities: string[] }>;
  knowledgeReadyObjects: Array<{ objectId: string; type: string; roomId: string }>;
  knowledgeReadyTaxonomy: IPropertyTaxonomy;
  knowledgeReadyHumanFlow: IHumanFlowAnalysis;
  knowledgeReadySpatialBehavior: ISpatialBehaviorMap;
}

// ----------------------------------------------------------------------------
// BSUE v1.5 Extended Blueprint Semantic Model
// Fully backward compatible extension of IBlueprintSemanticModel
// ----------------------------------------------------------------------------
export interface IBlueprintSemanticModelV15 extends IBlueprintSemanticModel {
  version15: '1.5.0-BSUE-ENTERPRISE-COGNITION';

  // BSUE v1.5 Enterprise Hardening Engine Outputs
  taxonomy: IPropertyTaxonomy;
  activityInference: IActivityInferenceSummary;
  humanFlow: IHumanFlowAnalysis;
  usageProbabilities: IRoomUsageProbability[];
  consultantOverrideMemory: IConsultantOverrideStore;
  qualityAdvisorReport: IBlueprintQualityReport;
  spatialBehaviorMap: ISpatialBehaviorMap;
  explainabilityReport: IConsistencyExplainabilityReport;
  semanticKnowledgeExport: ISemanticKnowledgeExportPackage;
}
