// ============================================================================
// URJAFLUX AI OS - SPATIAL COGNITION LAYER (SCL v1.1) TYPE DEFINITIONS
// Enterprise Hardening: Persistent Spatial Intelligence Data Contracts
// FOUNDER LOCKS:
// - No Vastu Analysis. No Remedy Selection. No Knowledge Evaluation.
// - No Confidence Scoring. No Conflict Resolution.
// - Only maintain persistent spatial cognition.
// ============================================================================

// ----------------------------------------------------------------------------
// ENGINE 15: Spatial Memory Engine Types
// ----------------------------------------------------------------------------
export type BlueprintVersionType =
  | 'ORIGINAL_BLUEPRINT'
  | 'CONSULTANT_VERSION'
  | 'CLIENT_VERIFIED_VERSION'
  | 'REVISED_BLUEPRINT'
  | 'REMEDY_APPLIED_VERSION'
  | 'FOLLOWUP_VERSION';

export interface IHistoricalSnapshot {
  snapshotId: string;
  versionType: BlueprintVersionType;
  createdAt: string;
  immutableHash: string;
  summary: string;
  snapshotData?: any;
}

export interface IVersionReference {
  versionId: string;
  versionType: BlueprintVersionType;
  parentVersionId?: string;
  description: string;
}

export interface IMemoryGraphNode {
  id: string;
  label: string;
  versionType: BlueprintVersionType;
  timestamp: string;
}

export interface IMemoryGraphEdge {
  source: string;
  target: string;
  relationship: 'EVOLVED_FROM' | 'REVISED_TO' | 'REMEDIED_BY';
}

export interface IAuditHistoryEntry {
  auditId: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

export interface ISpatialMemoryModel {
  propertyMemoryTimeline: Array<{ version: BlueprintVersionType; timestamp: string }>;
  historicalSnapshots: IHistoricalSnapshot[];
  versionReferences: IVersionReference[];
  memoryGraph: {
    nodes: IMemoryGraphNode[];
    edges: IMemoryGraphEdge[];
  };
  auditHistory: IAuditHistoryEntry[];
}

// ----------------------------------------------------------------------------
// ENGINE 16: Spatial Identity Engine Types
// ----------------------------------------------------------------------------
export type SpatialEntityType = 'ROOM' | 'OBJECT' | 'DOOR' | 'WINDOW' | 'WALL' | 'ZONE' | 'SPACE';

export interface IPersistentIdentity {
  persistentId: string;
  entityType: SpatialEntityType;
  permanentCode: string;
  createdTimestamp: string;
  currentName: string;
  currentLocationHash: string;
}

export interface IIdentityHistoryRecord {
  persistentId: string;
  nameChanges: Array<{ oldName: string; newName: string; timestamp: string }>;
  locationChanges: Array<{ oldLocationHash: string; newLocationHash: string; timestamp: string }>;
}

export interface IIdentityMapping {
  persistentId: string;
  ephemeralId: string;
  entityType: SpatialEntityType;
}

export interface ISpatialIdentityRegistryModel {
  persistentIds: string[];
  identityRegistry: IPersistentIdentity[];
  identityHistory: IIdentityHistoryRecord[];
  identityMapping: IIdentityMapping[];
}

// ----------------------------------------------------------------------------
// ENGINE 17: Spatial State Engine Types
// ----------------------------------------------------------------------------
export type PropertyLifecycleState =
  | 'BLUEPRINT_DRAFT'
  | 'APPROVED_BLUEPRINT'
  | 'UNDER_CONSTRUCTION'
  | 'COMPLETED'
  | 'EXISTING'
  | 'RENOVATED'
  | 'CONSULTANT_MODIFIED'
  | 'CLIENT_VERIFIED'
  | 'REMEDY_PENDING'
  | 'REMEDY_PARTIALLY_APPLIED'
  | 'REMEDY_COMPLETED';

export interface IStateTransitionRecord {
  transitionId: string;
  fromState: PropertyLifecycleState;
  toState: PropertyLifecycleState;
  timestamp: string;
  triggeredBy: string;
  remarks: string;
}

export interface ISpatialPropertyStateModel {
  currentState: PropertyLifecycleState;
  previousState?: PropertyLifecycleState;
  stateTimeline: Array<{ state: PropertyLifecycleState; timestamp: string }>;
  stateTransitionHistory: IStateTransitionRecord[];
}

// ----------------------------------------------------------------------------
// ENGINE 18: Multi Floor Cognition Engine Types
// ----------------------------------------------------------------------------
export type SclFloorType =
  | 'BASEMENT'
  | 'GROUND_FLOOR'
  | 'FIRST_FLOOR'
  | 'SECOND_FLOOR'
  | 'THIRD_FLOOR'
  | 'TERRACE'
  | 'PODIUM'
  | 'PARKING'
  | 'SPLIT_LEVEL'
  | 'DUPLEX'
  | 'TRIPLEX';

export interface IVerticalRelationshipEdge {
  sourceFloor: SclFloorType;
  targetFloor: SclFloorType;
  connectionType: 'STAIRCASE' | 'ELEVATOR' | 'LIGHTWELL' | 'UTILITY_SHAFT';
  description: string;
}

export interface IFloorDependency {
  sourceFloor: SclFloorType;
  targetFloor: SclFloorType;
  dependencyType: 'STRUCTURAL' | 'PLUMBING_STACK' | 'ELECTRICAL_RISER' | 'EGRESS';
  criticality: number;
}

export interface IMultiFloorCognitionModel {
  floors: Array<{ floorId: string; floorType: SclFloorType; floorLevel: number; roomIds: string[] }>;
  verticalRelationshipGraph: { edges: IVerticalRelationshipEdge[] };
  floorDependencyGraph: { dependencies: IFloorDependency[] };
  interFloorConnectivity: Array<{ connectionId: string; type: string; connectsFloors: SclFloorType[]; roomIds: string[] }>;
  verticalNarrative: string;
  sharedUtilities: Array<{ utilityName: string; spansFloors: SclFloorType[]; roomIds: string[] }>;
}

// ----------------------------------------------------------------------------
// ENGINE 19: Spatial Event Engine Types
// ----------------------------------------------------------------------------
export type SpatialEventType =
  | 'WALL_ADDED'
  | 'WALL_REMOVED'
  | 'DOOR_SHIFTED'
  | 'KITCHEN_SHIFTED'
  | 'BEDROOM_CONVERTED'
  | 'TOILET_REMOVED'
  | 'OBJECT_INSTALLED'
  | 'OBJECT_REMOVED'
  | 'NORTH_CORRECTED'
  | 'SCALE_UPDATED';

export interface ISpatialEvent {
  eventId: string;
  eventType: SpatialEventType;
  timestamp: string;
  description: string;
  affectedSpaces: string[];
  affectedObjects: string[];
  affectedKnowledgeContext: string[];
}

export interface ISpatialEventRegistryModel {
  eventTimeline: ISpatialEvent[];
  eventGraph: {
    nodes: Array<{ id: string; type: string }>;
    edges: Array<{ source: string; target: string; relation: string }>;
  };
  affectedSpacesSummary: string[];
  affectedObjectsSummary: string[];
  affectedKnowledgeContextSummary: string[];
}

// ----------------------------------------------------------------------------
// ENGINE 20: Change Detection Engine Types
// ----------------------------------------------------------------------------
export type SpatialChangeType =
  | 'NEW_ROOM'
  | 'REMOVED_ROOM'
  | 'SHIFTED_WALL'
  | 'OBJECT_MOVEMENT'
  | 'DOOR_CHANGE'
  | 'WINDOW_CHANGE'
  | 'ROOM_SIZE_CHANGE'
  | 'ZONE_CHANGE';

export interface ISpatialDifference {
  diffId: string;
  changeType: SpatialChangeType;
  entityId: string;
  entityName: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface IChangeDetectionModel {
  differenceReport: ISpatialDifference[];
  changeGraph: {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ source: string; target: string; type: string }>;
  };
  impactReport: {
    totalChanges: number;
    criticalChangesCount: number;
    summary: string;
  };
}

// ----------------------------------------------------------------------------
// ENGINE 21: Scenario Snapshot Engine Types
// ----------------------------------------------------------------------------
export type SclScenarioType =
  | 'CURRENT_PROPERTY'
  | 'SCENARIO_A'
  | 'SCENARIO_B'
  | 'SCENARIO_C'
  | 'CONSULTANT_PROPOSAL'
  | 'CLIENT_PROPOSAL'
  | 'FUTURE_EXPANSION';

export interface IScenarioRecord {
  scenarioId: string;
  scenarioType: SclScenarioType;
  name: string;
  description: string;
  isIsolated: true;
  createdAt: string;
  roomCount: number;
}

export interface IScenarioComparison {
  scenarioAId: string;
  scenarioBId: string;
  roomCountDelta: number;
  areaDeltaSqM: number;
  keyDifferences: string[];
}

export interface IScenarioSnapshotRegistryModel {
  scenarioRegistry: IScenarioRecord[];
  scenarioGraph: {
    nodes: Array<{ id: string; type: string }>;
    edges: Array<{ source: string; target: string; relationship: string }>;
  };
  scenarioComparisons: IScenarioComparison[];
}

// ----------------------------------------------------------------------------
// ENGINE 22: Property Timeline Engine Types
// ----------------------------------------------------------------------------
export type TimelineMilestoneType =
  | 'BLUEPRINT_CREATED'
  | 'CONSULTATION'
  | 'REPORT_GENERATED'
  | 'REMEDY_INSTALLED'
  | 'VERIFICATION'
  | 'FOLLOWUP'
  | 'ANNUAL_REVIEW';

export interface ITimestoneRecord {
  milestoneId: string;
  milestoneType: TimelineMilestoneType;
  title: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'SCHEDULED';
  details: string;
}

export interface IPropertyTimelineModel {
  milestones: ITimestoneRecord[];
  currentMilestone: TimelineMilestoneType;
  nextScheduledMilestone?: TimelineMilestoneType;
  timelineProgressPercentage: number;
}

// ----------------------------------------------------------------------------
// ENGINE 23: Cognitive Version Manager Types
// ----------------------------------------------------------------------------
export interface ICognitiveVersionRecord {
  versionId: string;
  semanticVersion: string;
  timestamp: string;
  isCompatibleWithV10: boolean;
  migrationNotes: string;
}

export interface IRollbackPoint {
  rollbackId: string;
  versionId: string;
  snapshotTimestamp: string;
  description: string;
}

export interface ICognitiveVersionManagerModel {
  currentVersionId: string;
  versionHistory: ICognitiveVersionRecord[];
  compatibility: {
    bsueCompatible: boolean;
    kqeCompatible: boolean;
    sclV10Compatible: true;
  };
  migrationHistory: Array<{ fromVersion: string; toVersion: string; migratedAt: string }>;
  rollbackPoints: IRollbackPoint[];
  snapshotReferences: string[];
}

// ----------------------------------------------------------------------------
// ENGINE 24: Downstream Impact Engine Types
// ----------------------------------------------------------------------------
export interface IDownstreamImpactModel {
  impactPackage: {
    triggerEvent: string;
    affectedRooms: string[];
    affectedActivities: string[];
    affectedRelationships: string[];
    affectedContext: string[];
    affectedKnowledgeQueries: string[];
    affectedReports: string[];
  };
  knowledgeDelta: {
    invalidatedContextKeys: string[];
    newContextKeys: string[];
  };
  contextDelta: {
    roomCountDelta: number;
    behaviorCountDelta: number;
  };
}
