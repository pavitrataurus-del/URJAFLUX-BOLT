// URJAFLUX Enterprise Digital Twin & Spatial Intelligence Platform
// Types definition covering Modules 1 through 15

export type TwinCategory = 
  | "BUILDING" 
  | "FLOOR" 
  | "ROOM" 
  | "WALL" 
  | "DOOR" 
  | "WINDOW" 
  | "FURNITURE" 
  | "EQUIPMENT";

export type TwinStatus = 
  | "OPERATIONAL" 
  | "WARNING" 
  | "FAULTED" 
  | "MAINTENANCE" 
  | "OFFLINE" 
  | "DECOMMISSIONED";

export type TwinLifecycleStage = 
  | "DESIGN" 
  | "AS_BUILT" 
  | "OPERATIONAL" 
  | "RENOVATION" 
  | "DECOMMISSIONED";

export interface BoundingBox3D {
  x: number; // Center X in meters
  y: number; // Center Y in meters
  z: number; // Center Z in meters
  dx: number; // Width
  dy: number; // Depth
  dz: number; // Height
}

export interface PolygonPoint2D {
  x: number;
  y: number;
}

export interface SpatialGeometry3D {
  bounds3D: BoundingBox3D;
  polygon2D: PolygonPoint2D[];
  elevation: number; // floor level height Z
  rotationDeg: number; // Yaw angle in degrees
  scale: [number, number, number];
}

export interface MaterialProperty {
  id: string;
  name: string;
  densityKgM3: number;
  thermalRValue: number;
  acousticAbsorptance: number; // 0 to 1
  colorHex: string;
}

export interface AssetInfo {
  assetTag: string;
  serialNumber: string;
  manufacturer: string;
  modelNumber: string;
  installationDate: string;
  warrantyExpiration: string;
  nextMaintenanceDate: string;
}

export interface TwinOwnership {
  organizationId: string;
  tenantId: string;
  department: string;
  custodian: string;
  ownerEmail: string;
}

export interface TwinDependency {
  targetTwinId: string;
  dependencyType: "POWER_SOURCE" | "HVAC_ZONE" | "STRUCTURAL_SUPPORT" | "DATA_UPLINK" | "FLOW_PIPELINE";
  isCritical: boolean;
  notes?: string;
}

export interface TwinVersionRecord {
  version: string; // e.g. "v1.2.0"
  timestamp: string;
  author: string;
  changeSummary: string;
  snapshotHash: string;
}

export interface TwinRelationship {
  relType: "CONTAINS" | "PARENT_OF" | "ADJACENT_TO" | "SERVICES" | "CONNECTED_TO";
  targetTwinId: string;
  targetCategory: TwinCategory;
}

// Module 1 Base Digital Twin
export interface BaseDigitalTwin {
  id: string; // Persistent Twin ID (e.g., "TWIN-BLD-001")
  code: string;
  name: string;
  category: TwinCategory;
  status: TwinStatus;
  lifecycle: TwinLifecycleStage;
  geometry: SpatialGeometry3D;
  properties: Record<string, string | number | boolean>;
  materials: MaterialProperty[];
  asset?: AssetInfo;
  labels: string[];
  tags: string[];
  ownership: TwinOwnership;
  version: string;
  versionHistory: TwinVersionRecord[];
  relationships: TwinRelationship[];
  dependencies: TwinDependency[];
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

// Specialized Twin Interfaces
export interface BuildingTwin extends BaseDigitalTwin {
  category: "BUILDING";
  grossAreaSqM: number;
  floorsCount: number;
  address: string;
  yearBuilt: number;
}

export interface FloorTwin extends BaseDigitalTwin {
  category: "FLOOR";
  buildingTwinId: string;
  floorLevelIndex: number;
  elevationMeters: number;
  grossFloorAreaSqM: number;
}

export interface RoomTwin extends BaseDigitalTwin {
  category: "ROOM";
  floorTwinId: string;
  roomNumber: string;
  useCategory: "OFFICE" | "MEETING" | "CONFERENCE" | "UTILITY" | "CORRIDOR" | "RESTROOM" | "EXECUTIVE";
  maxOccupancy: number;
  usableAreaSqM: number;
  vastuZone?: string;
}

export interface WallTwin extends BaseDigitalTwin {
  category: "WALL";
  wallType: "EXTERIOR" | "INTERIOR_PARTITION" | "BEARING";
  thicknessMm: number;
  fireRatingHours: number;
  connectedRoomIds: string[];
}

export interface DoorTwin extends BaseDigitalTwin {
  category: "DOOR";
  wallTwinId: string;
  doorWidthMm: number;
  swingDirection: string;
  isFireDoor: boolean;
  isOpenState: boolean;
}

export interface WindowTwin extends BaseDigitalTwin {
  category: "WINDOW";
  wallTwinId: string;
  glazingType: "SINGLE" | "DOUBLE" | "TRIPLE" | "LOW_E";
  widthMm: number;
  heightMm: number;
  solarHeatGainCoeff: number;
}

export interface FurnitureTwin extends BaseDigitalTwin {
  category: "FURNITURE";
  roomTwinId: string;
  furnitureType: "DESK" | "CHAIR" | "TABLE" | "STORAGE" | "WORKSTATION";
  isMovable: boolean;
}

export interface EquipmentTwin extends BaseDigitalTwin {
  category: "EQUIPMENT";
  roomTwinId: string;
  equipmentType: "HVAC_AHU" | "POWER_PANEL" | "CHILLER" | "LIGHTING_CONTROLLER" | "TRANSFORMER" | "UPS";
  powerRatingKw: number;
  operatingHours: number;
}

export type AnyDigitalTwin = 
  | BuildingTwin 
  | FloorTwin 
  | RoomTwin 
  | WallTwin 
  | DoorTwin 
  | WindowTwin 
  | FurnitureTwin 
  | EquipmentTwin;

// Module 3: Change Tracking & History
export interface AuditChangeDiff {
  fieldPath: string;
  oldValue: any;
  newValue: any;
}

export interface TwinAuditEntry {
  id: string;
  twinId: string;
  twinCategory: TwinCategory;
  changeType: "CREATE" | "UPDATE" | "DELETE" | "SIMULATION_APPLY" | "RESTORE";
  diffs: AuditChangeDiff[];
  authorUser: string;
  authorRole: string;
  sourceSystem: "CAD_ENGINE" | "IOT_TELEMETRY" | "USER_INTERFACE" | "AI_RECOMMENDATION" | "BIM_IMPORT";
  timestamp: string;
  versionToken: string;
  reason: string;
}

export interface TwinSnapshot {
  snapshotId: string;
  title: string;
  timestamp: string;
  createdBy: string;
  twinCount: number;
  twins: Record<string, AnyDigitalTwin>;
  systemVersion: string;
}

// Module 4: BIM Interoperability
export interface IFCElementMetadata {
  ifcGuid: string;
  ifcEntityType: "IFCBUILDING" | "IFCBUILDINGSTOREY" | "IFCSPACE" | "IFCWALL" | "IFCDOOR" | "IFCWINDOW" | "IFCFURNISHINGELEMENT" | "IFCFLOWTERMINAL";
  propertySets: Record<string, Record<string, string | number>>;
}

export interface RevitMappingMetadata {
  revitCategory: string;
  familyName: string;
  typeName: string;
  levelName: string;
  phaseCreated: string;
}

export interface GeoreferenceCoordinates {
  epsgCode: string; // e.g. "EPSG:3857"
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  trueNorthOffsetDeg: number;
}

export interface BimModelFile {
  filename: string;
  fileFormat: "IFC" | "RVT" | "DWG" | "DXF" | "OBJ";
  fileSizeBytes: number;
  uploadedAt: string;
  importedElementsCount: number;
  status: "PARSED_SUCCESS" | "UNSUPPORTED_BINARY_FORMAT" | "WARNINGS" | "FAILED";
  unsupportedReason?: string;
  georeference?: GeoreferenceCoordinates;
}

// Module 5: Real-Time Synchronization
export interface OptimisticLockToken {
  twinId: string;
  version: number;
  eTag: string;
}

export type ConflictResolutionStrategy = "LAST_WRITE_WINS" | "FIELD_MERGE" | "MANUAL_OVERRIDE" | "SERVER_AUTHORITY";

export interface SyncConflict {
  id: string;
  twinId: string;
  fieldName: string;
  clientValue: any;
  serverValue: any;
  detectedAt: string;
  status: "OPEN" | "RESOLVED";
  resolvedValue?: any;
}

export interface TwinBranch {
  branchId: string;
  branchName: string; // e.g. "main" or "scenario-post-covid"
  baseSnapshotId: string;
  createdAt: string;
  stagedChangesCount: number;
}

// Module 6: Simulation Engine
export interface HypotheticalChange {
  id: string;
  twinId: string;
  action: "MODIFY_PROPERTY" | "MOVE_GEOMETRY" | "REMOVE_TWIN" | "ADD_TWIN";
  payload: any;
}

export interface RuleImpactResult {
  ruleId: string;
  ruleName: string;
  ruleCategory: "VASTU_COMPLIANCE" | "BUILDING_CODE" | "EGRESS_SAFETY" | "ENERGY_LOAD" | "OCCUPANCY_CAPACITY";
  beforeStatus: "PASS" | "WARN" | "FAIL";
  afterStatus: "PASS" | "WARN" | "FAIL";
  scoreDelta: number;
  details: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  baseBranchId: string;
  hypotheticalChanges: HypotheticalChange[];
  impactResults: RuleImpactResult[];
  overallScoreBefore: number;
  overallScoreAfter: number;
  isAppliedToMain: boolean;
}

// Module 7: Spatial Analytics
export interface RoomMetrics {
  roomId: string;
  roomName: string;
  grossAreaSqM: number;
  usableAreaSqM: number;
  perimeterM: number;
  ceilingHeightM: number;
  volumeCuM: number;
  maxOccupants: number;
}

export interface AreaAnalytics {
  usableAreaTotalSqM: number;
  circulationAreaTotalSqM: number;
  utilityAreaTotalSqM: number;
  efficiencyRatioPercent: number; // Usable / Gross
}

export interface AdjacencyMatrixItem {
  roomAId: string;
  roomAName: string;
  roomBId: string;
  roomBName: string;
  adjacencyType: "DIRECT_WALL" | "DOOR_CONNECTED" | "CORRIDOR_LINKED" | "FAR";
  distanceMeters: number;
}

export interface DensityMetric {
  roomId: string;
  areaSqM: number;
  currentOccupancy: number;
  densityPeoplePerSqM: number;
  status: "NORMAL" | "HIGH" | "OVERCROWDED";
}

// Module 8 & 9: IoT & Time Series
export type SensorType = 
  | "TEMPERATURE" 
  | "HUMIDITY" 
  | "POWER_METER" 
  | "MOTION" 
  | "AIR_QUALITY_CO2" 
  | "SMART_SWITCH" 
  | "OCCUPANCY_COUNT";

export interface TelemetryReading {
  sensorId: string;
  twinId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  quality: "GOOD" | "DEGRADED" | "ERROR";
  timestamp: string; // ISO String
}

export interface SensorAdapterConfig {
  sensorId: string;
  twinId: string;
  name: string;
  type: SensorType;
  mqttTopic: string;
  brokerHost: string;
  pollingIntervalSec: number;
  minThreshold: number;
  maxThreshold: number;
  isOnline: boolean;
  batteryLevelPercent?: number;
}

export interface TimeSeriesTrend {
  sensorId: string;
  sensorType: SensorType;
  avg24h: number;
  max24h: number;
  min24h: number;
  unit: string;
  trendDirection: "RISING" | "FALLING" | "STABLE";
  anomalyDetected: boolean;
}

// Module 10: Spatial AI Assistant
export interface SpatialAiQuery {
  queryText: string;
  targetTwinId?: string;
  contextScope: "BUILDING" | "FLOOR" | "ROOM" | "ALL";
}

export interface KnowledgeEvidence {
  sourceTitle: string;
  clauseReference: string;
  snippetText: string;
  relevanceScore: number;
}

export interface GroundedSpatialResponse {
  answerText: string;
  evidence: KnowledgeEvidence[];
  spatialContextSummary: string;
  ruleEvaluations: { ruleName: string; result: string; reason: string }[];
  actionableRecommendations: string[];
  confidenceScore: number;
}

// Module 13: Predictive Analytics
export interface AnomalyAlert {
  id: string;
  twinId: string;
  twinName: string;
  metricName: string;
  currentValue: number;
  expectedRange: [number, number];
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  recommendedAction: string;
}

export interface MaintenanceRecommendation {
  equipmentTwinId: string;
  equipmentName: string;
  healthIndexPercent: number; // 0 to 100
  estimatedRemainingLifeDays: number;
  recommendedService: string;
  confidenceScore: number;
}

// Module 14: Governance & Security
export interface TwinPermissionPolicy {
  role: "SUPER_ADMIN" | "FACILITY_MANAGER" | "VASTU_CONSULTANT" | "TENANT_VIEWER";
  canRead: boolean;
  canEditGeometry: boolean;
  canEditProperties: boolean;
  canRunSimulations: boolean;
  canControlIoT: boolean;
}

export interface ComplianceAuditLog {
  id: string;
  timestamp: string;
  tenantId: string;
  actor: string;
  action: string;
  resourceTwinId: string;
  complianceFramework: "ISO_19650_BIM" | "SOC2_TYPE2" | "URJAFLUX_GOVERNANCE";
  status: "COMPLIANT" | "FLAGGED";
  hashSignature: string;
}
