import { ExecutionUserRole, WorkflowStatus } from '../execution/ExecutionTypes';
import { KnowledgeDomain } from '../reasoning/ReasoningTypes';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlertCategory =
  | 'OVERDUE_INSPECTION'
  | 'MISSING_EVIDENCE'
  | 'COMPLIANCE_FAILURE'
  | 'PROJECT_DELAY'
  | 'MAINTENANCE_DUE'
  | 'HIGH_RISK'
  | 'DIGITAL_TWIN_MISMATCH'
  | 'SENSOR_THRESHOLD_BREACH'
  | 'WORKFLOW_FAILURE';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'ROUTINE' | 'SCHEDULED';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export type InspectionScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';

export type ChangeType =
  | 'OBJECT_ADDED'
  | 'OBJECT_REMOVED'
  | 'OBJECT_RELOCATED'
  | 'DIRECTION_CHANGED'
  | 'LAYOUT_CHANGED'
  | 'EVIDENCE_UPDATED'
  | 'INSPECTION_UPDATED'
  | 'MEASUREMENT_CHANGED';

// ----------------------------------------------------
// COMMON BASE ENTITY INTERFACE
// ----------------------------------------------------
export interface IBaseMonitoringEntity {
  id: string; // UUID
  version: string;
  status: string;
  owner: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// PROPERTY ROOM / ZONE LAYOUT ITEM
// ----------------------------------------------------
export interface IDigitalTwinRoomZone {
  zoneId: string;
  zoneName: string; // e.g. Northeast (Ishan), Brahmasthan, Southwest
  directionAngleDeg: number;
  panchaTattvaElement: string;
  installedRemedies: Array<{
    remedyId: string;
    remedyTitle: string;
    installedDate: string;
    status: 'OPTIMAL' | 'REQUIRES_INSPECTION' | 'DEGRADED';
  }>;
  placedObjects: Array<{
    objectId: string;
    objectName: string;
    category: string;
    coordinateX: number;
    coordinateY: number;
  }>;
  sensorReadings: Array<{
    sensorId: string;
    sensorType: 'MAGNETIC_FIELD' | 'ACOUSTIC_FREQ' | 'PRANIC_VIBRATION' | 'LIGHT_LUX';
    value: number;
    unit: string;
    timestamp: string;
  }>;
}

// ----------------------------------------------------
// PROPERTY SNAPSHOT
// ----------------------------------------------------
export interface IPropertySnapshot extends IBaseMonitoringEntity {
  digitalTwinId: string;
  snapshotNumber: number;
  snapshotLabel: string;
  floorPlanVersion: string;
  roomZones: IDigitalTwinRoomZone[];
  overallHealthScore: number;
  complianceRating: number;
  totalRemediesInstalled: number;
  capturedEvidenceIds: string[];
  inspectionRecordIds: string[];
}

// ----------------------------------------------------
// DIGITAL TWIN MASTER
// ----------------------------------------------------
export interface IDigitalTwin extends IBaseMonitoringEntity {
  propertyId: string;
  propertyCode: string;
  propertyName: string;
  clientName: string;
  siteAddress: string;
  relatedProjectId: string;
  activeSnapshotId: string;
  snapshotsHistory: IPropertySnapshot[];
  primaryDomains: KnowledgeDomain[];
  overallHealthScore: number; // 0 - 100
  complianceScore: number; // 0 - 100
  maintenancePriority: 'URGENT' | 'HIGH' | 'ROUTINE' | 'LOW';
  lastInspectedAt: string;
  nextScheduledInspectionAt: string;
}

// ----------------------------------------------------
// CHANGE DETECTION EVENT
// ----------------------------------------------------
export interface IChangeEvent extends IBaseMonitoringEntity {
  digitalTwinId: string;
  previousSnapshotId: string;
  newSnapshotId: string;
  changeType: ChangeType;
  zoneId: string;
  description: string;
  detectedAt: string;
  detectedBy: string;
  severity: AlertSeverity;
  isResolved: boolean;
}

// ----------------------------------------------------
// ALERT ENTITY
// ----------------------------------------------------
export interface IMonitoringAlert extends IBaseMonitoringEntity {
  digitalTwinId: string;
  projectId?: string;
  alertCategory: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  alertStatus: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// ----------------------------------------------------
// MAINTENANCE RECORD & CALENDAR
// ----------------------------------------------------
export interface IMaintenanceRecord extends IBaseMonitoringEntity {
  digitalTwinId: string;
  remedyId?: string;
  title: string;
  maintenanceType: MaintenanceType;
  scheduledDate: string;
  completedDate?: string;
  assignedTo: string;
  assignedRole: ExecutionUserRole;
  maintenanceStatus: MaintenanceStatus;
  estimatedCostPlaceholder?: number;
  notes: string;
}

// ----------------------------------------------------
// INSPECTION SCHEDULE
// ----------------------------------------------------
export interface IInspectionSchedule extends IBaseMonitoringEntity {
  digitalTwinId: string;
  frequency: InspectionScheduleFrequency;
  nextDueDate: string;
  lastCompletedDate?: string;
  assignedInspector: string;
  isOverdue: boolean;
  checklistTemplateId?: string;
}

// ----------------------------------------------------
// COMPLIANCE RECORD
// ----------------------------------------------------
export interface IComplianceRecord extends IBaseMonitoringEntity {
  digitalTwinId: string;
  projectId: string;
  recommendationCompliancePercentage: number;
  executionCompliancePercentage: number;
  inspectionCompliancePercentage: number;
  documentationCompletenessPercentage: number;
  evidenceFreshnessPercentage: number;
  overallComplianceScore: number;
  evaluationTimestamp: string;
}

// ----------------------------------------------------
// TIMELINE EVENT (FOR REPLAY ENGINE)
// ----------------------------------------------------
export interface ITimelineEvent {
  eventId: string;
  digitalTwinId: string;
  projectId?: string;
  eventType: 'RECOMMENDATION' | 'EXECUTION' | 'INSPECTION' | 'EVIDENCE' | 'MAINTENANCE' | 'ALERT' | 'CHANGE' | 'COMPLIANCE';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actorRole: ExecutionUserRole;
  metadata?: Record<string, any>;
}

// ----------------------------------------------------
// HEALTH SCORE & DETERMINISTIC METRICS
// ----------------------------------------------------
export interface IPropertyHealthMetrics {
  digitalTwinId: string;
  propertyHealthScore: number; // 0 - 100
  maintenancePriorityScore: number; // 0 - 100
  inspectionPriorityScore: number; // 0 - 100
  complianceTrend: 'IMPROVING' | 'STABLE' | 'DEGRADED';
  riskTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  totalActiveAlerts: fontNumber;
  criticalAlertsCount: fontNumber;
}
type fontNumber = number;
