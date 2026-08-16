// ============================================================================
// URJAFLUX AI OS - SPATIAL COGNITION LAYER (SCL v1.0) TYPE DEFINITIONS
// Cognitively understood spatial system data contracts & models
// FOUNDER LOCKS: NO Vastu/Lal Kitab/Astrology/Numerology analysis. NO remedies.
// NO doshas. NO Vastu confidence scoring. NO recommendations. NO reasoning.
// Prepares cognition model strictly consumed by Knowledge Stack.
// ============================================================================

import { IBlueprintSemanticModel, ISemanticRoom, IEvidenceSource } from "../../bsue/types/bsue.types";
import { IBlueprintSemanticModelV15 } from "../../bsue/types/bsue_v1_5.types";
import {
  ISpatialMemoryModel,
  ISpatialIdentityRegistryModel,
  ISpatialPropertyStateModel,
  IMultiFloorCognitionModel,
  ISpatialEventRegistryModel,
  IScenarioSnapshotRegistryModel,
  IPropertyTimelineModel,
  ICognitiveVersionManagerModel,
  IChangeDetectionModel,
  IDownstreamImpactModel,
} from "./scl_v1_1.types";

export * from "./scl_v1_1.types";

// ----------------------------------------------------------------------------
// 1. Hierarchy Types
// ----------------------------------------------------------------------------
export interface IHierarchyNode {
  entityId: string;
  entityType: 'PROPERTY' | 'ZONE' | 'SPACE' | 'ROOM' | 'OBJECT' | 'ACTIVITY' | 'RELATIONSHIP' | 'BEHAVIOR';
  entityName: string;
  parentId?: string;
  childIds: string[];
  depthLevel: number;
  metadata?: Record<string, any>;
}

export interface ISpatialHierarchyModel {
  propertyNode: IHierarchyNode;
  zoneNodes: IHierarchyNode[];
  spaceNodes: IHierarchyNode[];
  roomNodes: IHierarchyNode[];
  objectNodes: IHierarchyNode[];
  activityNodes: IHierarchyNode[];
  relationshipNodes: IHierarchyNode[];
  behaviorNodes: IHierarchyNode[];
  totalHierarchyDepth: number;
  hierarchyTree: IHierarchyNode;
}

// ----------------------------------------------------------------------------
// 2. Spatial Behavior Types
// ----------------------------------------------------------------------------
export type SclBehaviorType =
  | 'HEAT_SOURCE'
  | 'WATER_SOURCE'
  | 'NOISE_SOURCE'
  | 'MOVEMENT_GENERATOR'
  | 'GATHERING_AREA'
  | 'ISOLATION_AREA'
  | 'REST_AREA'
  | 'TRANSITION_AREA'
  | 'WAITING_AREA'
  | 'STORAGE_AREA';

export interface ISpatialBehaviorProfile {
  behaviorId: string;
  roomId: string;
  roomName: string;
  primaryBehavior: SclBehaviorType;
  secondaryBehaviors: SclBehaviorType[];
  behaviorConfidence: number; // 0.0 to 1.0
  supportingEvidence: IEvidenceSource[];
  behaviorIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ISpatialBehaviorModel {
  behaviorProfiles: ISpatialBehaviorProfile[];
  behaviorSummary: {
    heatSourcesCount: number;
    waterSourcesCount: number;
    noiseSourcesCount: number;
    movementGeneratorsCount: number;
    gatheringAreasCount: number;
    isolationAreasCount: number;
    restAreasCount: number;
    transitionAreasCount: number;
    waitingAreasCount: number;
    storageAreasCount: number;
  };
  futureExpansion: {
    thermalBehaviorProjection: string;
    acousticProfileProjection: string;
    moistureZoneProjection: string;
  };
}

// ----------------------------------------------------------------------------
// 3. Energy Flow Types (Pure Spatial Movement & Circulation)
// ----------------------------------------------------------------------------
export interface IFlowVectorCognition {
  vectorId: string;
  sourceRoomId: string;
  targetRoomId: string;
  flowType: 'ENTRY' | 'EXIT' | 'PRIMARY_MOVEMENT' | 'SECONDARY_MOVEMENT' | 'TRANSIT';
  widthMeters: number;
  flowCapacityScore: number;
  isBottleneck: boolean;
}

export interface ICirculationRing {
  ringId: string;
  roomSequence: string[];
  ringLengthMeters: number;
  isClosedLoop: boolean;
}

export interface IEnergyFlowModel {
  entryFlows: IFlowVectorCognition[];
  exitFlows: IFlowVectorCognition[];
  primaryMovementPaths: IFlowVectorCognition[];
  secondaryMovementPaths: IFlowVectorCognition[];
  deadEndRoomIds: string[];
  circulationRings: ICirculationRing[];
  flowBottlenecks: IFlowVectorCognition[];
  openMovementAreaRoomIds: string[];
  futureHooks: {
    airFlowVectors: Array<{ from: string; to: string; estimatedVelocityMs: number }>;
    heatFlowVectors: Array<{ sourceRoomId: string; dissipatingRoomIds: string[] }>;
    waterFlowVectors: Array<{ supplyRoomIds: string[]; drainageRoomIds: string[] }>;
  };
}

// ----------------------------------------------------------------------------
// 4. Human Interaction Types
// ----------------------------------------------------------------------------
export type SpatialPrivacyClassification =
  | 'INDIVIDUAL'
  | 'SHARED'
  | 'FAMILY'
  | 'GUEST'
  | 'PRIVATE'
  | 'SEMI_PRIVATE'
  | 'PUBLIC'
  | 'SERVICE'
  | 'UTILITY';

export interface IHumanInteractionNode {
  roomId: string;
  roomName: string;
  classifications: SpatialPrivacyClassification[];
  occupancyCapacity: number;
  interactionDensityScore: number;
}

export interface IInteractionEdge {
  sourceRoomId: string;
  targetRoomId: string;
  interactionType: 'CO_OCCUPANCY' | 'VISUAL_CONNECTIVITY' | 'ACOUSTIC_CONNECTIVITY' | 'SERVICE_ACCESS';
  strength: number;
}

export interface IHumanInteractionModel {
  interactionNodes: IHumanInteractionNode[];
  interactionEdges: IInteractionEdge[];
  interactionGraph: {
    nodes: string[];
    edges: Array<{ from: string; to: string; label: string; weight: number }>;
  };
  privacyZoningBreakdown: {
    individualRoomIds: string[];
    sharedRoomIds: string[];
    familyRoomIds: string[];
    guestRoomIds: string[];
    privateRoomIds: string[];
    semiPrivateRoomIds: string[];
    publicRoomIds: string[];
    serviceRoomIds: string[];
    utilityRoomIds: string[];
  };
}

// ----------------------------------------------------------------------------
// 5. Functional Dependency Types
// ----------------------------------------------------------------------------
export interface IFunctionalDependency {
  dependencyId: string;
  sourceRoomId: string;
  targetRoomId: string;
  sourceType: string;
  targetType: string;
  dependencyType: 'DIRECT_SERVICE' | 'ADJACENCY_REQUIRED' | 'ACCESS_CONTROL' | 'STORAGE_SERVICING';
  criticalityScore: number; // 0.0 to 1.0
  description: string;
}

export interface IFunctionalDependencyModel {
  dependencies: IFunctionalDependency[];
  dependencyGraph: {
    nodes: string[];
    edges: Array<{ from: string; to: string; relation: string; weight: number }>;
  };
  standardArchetypeChains: Array<{
    chainName: string;
    roomSequence: string[];
    isSatisfied: boolean;
  }>;
}

// ----------------------------------------------------------------------------
// 6. Space Importance Types
// ----------------------------------------------------------------------------
export type SpaceImportanceCategory =
  | 'PRIMARY'
  | 'SUPPORTING'
  | 'CRITICAL'
  | 'OPTIONAL'
  | 'INACTIVE'
  | 'FUTURE_EXPANSION';

export interface ISpaceImportanceRecord {
  roomId: string;
  roomName: string;
  category: SpaceImportanceCategory;
  architecturalImportanceScore: number; // 0.0 to 100.0
  centralityIndex: number;
  areaPercentage: number;
  rationale: string;
}

export interface ISpaceImportanceModel {
  importanceRecords: ISpaceImportanceRecord[];
  categoryBreakdown: Record<SpaceImportanceCategory, string[]>;
  primaryCentroidRoomId?: string;
}

// ----------------------------------------------------------------------------
// 7. Temporal Cognition Types
// ----------------------------------------------------------------------------
export interface ITemporalUsageProfile {
  roomId: string;
  morningUsageProb: number;   // 06:00 - 12:00
  afternoonUsageProb: number; // 12:00 - 18:00
  eveningUsageProb: number;   // 18:00 - 22:00
  nightUsageProb: number;     // 22:00 - 06:00
  peakUsageWindow: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'ALL_DAY';
}

export interface ITemporalCognitionModel {
  roomTemporalProfiles: ITemporalUsageProfile[];
  futureTimelineHooks: {
    seasonalUsage: {
      summerHighOccupancyRooms: string[];
      winterHighOccupancyRooms: string[];
      monsoonServiceZones: string[];
    };
    futureOccupancy: {
      projectedOccupantCount: number;
      densityPerSqMeter: number;
    };
    constructionPhase: {
      phaseNumber: number;
      structuralReadiness: string;
    };
    renovationPhase: {
      adaptabilityScore: number;
      demolitionRiskZones: string[];
    };
  };
}

// ----------------------------------------------------------------------------
// 8. Environmental Context Types
// ----------------------------------------------------------------------------
export interface IEnvironmentalContextRecord {
  roomId: string;
  naturalLightScore: number; // 0.0 to 1.0
  ventilationPotentialScore: number; // 0.0 to 1.0
  privacyPotentialScore: number; // 0.0 to 1.0
  accessibilityScore: number; // 0.0 to 1.0
  opennessIndex: number; // 0.0 to 1.0 (ratio of windows/doors to wall area)
  enclosureIndex: number; // 0.0 to 1.0 (1.0 - opennessIndex)
  exposureFacing: string; // e.g. "NORTH_EAST", "SOUTH", "INTERNAL"
}

export interface IEnvironmentalContextModel {
  environmentalRecords: IEnvironmentalContextRecord[];
  futureReserved: {
    weatherDataAvailable: false;
    climateZone: string;
    sunPathProjection: {
      solsticeAzimuthDeg: number;
      equinoxEquatorAngleDeg: number;
    };
  };
}

// ----------------------------------------------------------------------------
// 9. Spatial Narrative Types
// ----------------------------------------------------------------------------
export interface INarrativeStep {
  stepIndex: number;
  fromRoomId?: string;
  toRoomId: string;
  transitionType: 'ENTRANCE' | 'MAIN_CIRCULATION' | 'ZONE_CHANGE' | 'SERVICE_ENTRY' | 'TERMINAL_DESTINATION';
  spatialNarrativeLabel: string;
}

export interface ISpatialNarrativeModel {
  narrativeSequence: INarrativeStep[];
  narrativeGraph: {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ source: string; target: string; transition: string }>;
  };
  narrativeSummary: string; // Machine-formatted structured graph summary
}

// ----------------------------------------------------------------------------
// 10. Cognition Graph Types
// ----------------------------------------------------------------------------
export interface ICognitionGraphNode {
  id: string;
  label: string;
  type: 'ROOM' | 'BEHAVIOR' | 'ACTIVITY' | 'ZONE' | 'OBJECT';
  attributes: Record<string, any>;
}

export interface ICognitionGraphEdge {
  source: string;
  target: string;
  relationship: string;
  graphType: 'SPATIAL' | 'BEHAVIOR' | 'INTERACTION' | 'DEPENDENCY' | 'MOVEMENT' | 'NARRATIVE' | 'CONTEXT';
  weight: number;
}

export interface ICognitionGraph {
  nodes: ICognitionGraphNode[];
  edges: ICognitionGraphEdge[];
  subGraphs: {
    spatialGraphEdgeCount: number;
    behaviorGraphEdgeCount: number;
    interactionGraphEdgeCount: number;
    dependencyGraphEdgeCount: number;
    movementGraphEdgeCount: number;
    narrativeGraphEdgeCount: number;
    contextGraphEdgeCount: number;
  };
}

// ----------------------------------------------------------------------------
// 11. Spatial Context Types (Universal Normalized)
// ----------------------------------------------------------------------------
export interface ISpatialContextNormalized {
  normalizedObjects: Array<{ id: string; type: string; roomId: string; boundingBoxSqM: number }>;
  normalizedRooms: Array<{ id: string; name: string; type: string; areaSqM: number; perimeterM: number }>;
  normalizedActivities: Array<{ roomId: string; primary: string; secondaries: string[] }>;
  normalizedBehaviors: Array<{ roomId: string; behaviors: SclBehaviorType[] }>;
  normalizedDependencies: Array<{ from: string; to: string; type: string }>;
  normalizedHierarchy: Array<{ entityId: string; depth: number; path: string }>;
  normalizedNarratives: Array<{ step: number; room: string; transition: string }>;
}

// ----------------------------------------------------------------------------
// 12. Knowledge Context Generator Types (Exclusive KQE Package)
// ----------------------------------------------------------------------------
export interface IKnowledgeReadyCognitionContext {
  packageVersion: '1.0.0-SCL-COGNITION';
  propertyId: string;
  propertyName: string;
  knowledgeReadySpatialContext: any;
  knowledgeReadyBehaviorContext: any;
  knowledgeReadyActivityContext: any;
  knowledgeReadyDependencyContext: any;
  knowledgeReadyNarrativeContext: any;
  knowledgeReadyHierarchyContext: any;
}

// ----------------------------------------------------------------------------
// 13. Cognitive Explainability Types
// ----------------------------------------------------------------------------
export interface ICognitiveDecisionExplanation {
  entityId: string;
  decisionType: string;
  why: string;
  evidence: {
    geometry: string;
    objects: string[];
    relationships: string[];
    activities: string[];
    dependencies: string[];
  };
  confidence: number;
  unknownFactors: string[];
}

export interface ICognitiveExplainabilityModel {
  explanations: ICognitiveDecisionExplanation[];
  overallCognitionConfidence: number;
  unresolvedFactorsCount: number;
}

// ----------------------------------------------------------------------------
// 14. Cognitive Self Validation Types
// ----------------------------------------------------------------------------
export interface IValidationCognitionIssue {
  issueCode: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  affectedEntityIds: string[];
}

export interface ICognitiveSelfValidationModel {
  isValid: boolean;
  validationChecks: {
    disconnectedBehaviorsCount: number;
    impossibleDependenciesCount: number;
    circularReferencesCount: number;
    brokenNarrativesCount: number;
    invalidHierarchiesCount: number;
    missingContextCount: number;
    unknownActivitiesCount: number;
  };
  detectedIssues: IValidationCognitionIssue[];
}

// ----------------------------------------------------------------------------
// Future Reserved Hooks
// ----------------------------------------------------------------------------
export interface IFutureReservedCognitionHooks {
  digitalTwin: { enabled: false; twinId?: string };
  bim: { enabled: false; ifcSchemaVersion?: string };
  ifc: { enabled: false };
  spatialCognition3D: { enabled: false };
  ar: { enabled: false };
  vr: { enabled: false };
  iotSensors: { enabled: false; activeSensorCount: 0 };
  liveOccupancy: { enabled: false; currentOccupantCount: 0 };
  smartBuilding: { enabled: false };
  roboticsNavigation: { enabled: false; gridResolutionMeters: 0.1 };
}

// ----------------------------------------------------------------------------
// MAIN OUTPUT CONTRACT: ISpatialCognitionModel
// ----------------------------------------------------------------------------
export interface ISpatialCognitionModel {
  version: '1.0.0-SCL-SPATIAL-COGNITION' | '1.1.0-SCL-ENTERPRISE-HARDENING';
  propertyId: string;
  propertyName: string;
  timestamp: string;

  // 14 Engine Outputs (v1.0)
  hierarchyModel: ISpatialHierarchyModel;
  behaviorModel: ISpatialBehaviorModel;
  energyFlowModel: IEnergyFlowModel;
  interactionModel: IHumanInteractionModel;
  dependencyModel: IFunctionalDependencyModel;
  importanceModel: ISpaceImportanceModel;
  temporalModel: ITemporalCognitionModel;
  environmentalModel: IEnvironmentalContextModel;
  narrativeModel: ISpatialNarrativeModel;
  cognitionGraph: ICognitionGraph;
  spatialContext: ISpatialContextNormalized;
  knowledgeContext: IKnowledgeReadyCognitionContext;
  explainability: ICognitiveExplainabilityModel;
  validation: ICognitiveSelfValidationModel;

  // Reserved Hooks
  futureHooks: IFutureReservedCognitionHooks;

  // SCL v1.1 Enterprise Hardening Extensions
  spatialMemory?: ISpatialMemoryModel;
  identityRegistry?: ISpatialIdentityRegistryModel;
  propertyState?: ISpatialPropertyStateModel;
  floorModel?: IMultiFloorCognitionModel;
  eventRegistry?: ISpatialEventRegistryModel;
  scenarioRegistry?: IScenarioSnapshotRegistryModel;
  timeline?: IPropertyTimelineModel;
  versionManager?: ICognitiveVersionManagerModel;
  changeDetection?: IChangeDetectionModel;
  impactAnalysis?: IDownstreamImpactModel;
}
