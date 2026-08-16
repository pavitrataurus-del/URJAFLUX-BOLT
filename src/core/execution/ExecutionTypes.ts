import { IRecommendation, KnowledgeDomain } from '../reasoning/ReasoningTypes';

export type ExecutionUserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'FIELD_ENGINEER' | 'END_USER';

export type WorkflowStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'BLOCKED'
  | 'INSPECTION_PENDING'
  | 'VERIFICATION_PENDING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'ARCHIVED';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EvidenceType =
  | 'IMAGE'
  | 'VIDEO'
  | 'PDF'
  | 'REPORT'
  | 'DRAWING'
  | 'VOICE_NOTE'
  | 'MEASUREMENT'
  | 'DIGITAL_SIGNATURE';

export type InspectionComplianceStatus =
  | 'FULLY_COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'PENDING_REINSPECTION';

export type ApprovalTier =
  | 'FIELD_ENGINEER'
  | 'SENIOR_CONSULTANT'
  | 'PROJECT_MANAGER'
  | 'ADMINISTRATOR';

export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'REQUESTED_CHANGES' | 'PENDING';

export type IssueSeverity = 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'MINOR';
export type RiskProbability = 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskImpact = 'HIGH' | 'MEDIUM' | 'LOW';

// ----------------------------------------------------
// COMMON METADATA INTERFACE
// ----------------------------------------------------
export interface IBaseExecutionEntity {
  id: string; // UUID
  version: string;
  status: WorkflowStatus;
  owner: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// EVIDENCE & MEDIA
// ----------------------------------------------------
export interface IExecutionEvidence extends IBaseExecutionEntity {
  title: string;
  description?: string;
  evidenceType: EvidenceType;
  fileUrl: string;
  fileSizeBytes?: number;
  mimeType?: string;
  uploaderName: string;
  uploaderRole: ExecutionUserRole;
  relatedTaskId: string;
  relatedRecommendationId: string;
  relatedProjectId: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  measurementValue?: {
    numericalValue: number;
    unit: string;
    parameterName: string;
  };
  immutableChecksum: string;
  timestamp: string;
}

// ----------------------------------------------------
// CHECKLISTS & INSPECTIONS
// ----------------------------------------------------
export interface IChecklistItemRequirement {
  requirePhoto: boolean;
  requireVideo: boolean;
  requireDocument: boolean;
  requireSignature: boolean;
  requireGPS: boolean;
  requireMeasurement: boolean;
  requireNotes: boolean;
}

export interface IChecklistItem {
  id: string;
  label: string;
  description?: string;
  isCompleted: boolean;
  requirements: IChecklistItemRequirement;
  completedBy?: string;
  completedAt?: string;
  capturedEvidenceIds: string[];
  notes?: string;
  measurementResult?: string;
}

export interface IChecklistTemplate extends IBaseExecutionEntity {
  title: string;
  category: string;
  items: IChecklistItem[];
}

export interface ISiteInspection extends IBaseExecutionEntity {
  projectId: string;
  taskId: string;
  inspectorName: string;
  inspectorRole: ExecutionUserRole;
  inspectionDate: string;
  locationDetails: string;
  observations: string;
  complianceStatus: InspectionComplianceStatus;
  measurementsTaken: Array<{
    parameter: string;
    expectedRange: string;
    actualValue: string;
    isPass: boolean;
  }>;
  evidenceIds: string[];
  correctiveActionsRequired?: string;
}

// ----------------------------------------------------
// APPROVALS
// ----------------------------------------------------
export interface IApprovalRecord extends IBaseExecutionEntity {
  projectId: string;
  taskId?: string;
  milestoneId?: string;
  approvalTier: ApprovalTier;
  approverName: string;
  approverRole: ExecutionUserRole;
  decision: ApprovalDecision;
  comments: string;
  digitalSignatureHash: string;
  ipAddress?: string;
  decisionTimestamp: string;
}

// ----------------------------------------------------
// ISSUES & RISKS
// ----------------------------------------------------
export interface IExecutionIssue extends IBaseExecutionEntity {
  projectId: string;
  taskId?: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  assignedTo: string;
  resolutionHistory: Array<{
    timestamp: string;
    actionBy: string;
    notes: string;
    resultingStatus: string;
  }>;
}

export interface IExecutionRisk extends IBaseExecutionEntity {
  projectId: string;
  taskId?: string;
  title: string;
  description: string;
  probability: RiskProbability;
  impact: RiskImpact;
  mitigationStrategy: string;
  escalationPerson: string;
  isTriggered: boolean;
}

// ----------------------------------------------------
// TASKS & DEPENDENCIES
// ----------------------------------------------------
export interface IExecutionTask extends IBaseExecutionEntity {
  projectId: string;
  phaseId: string;
  milestoneId?: string;
  parentTaskId?: string; // For Subtasks
  originatingRecommendationId: string;
  originatingReasoningChainId?: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  assignedTo: string;
  assignedRole: ExecutionUserRole;
  dueDate: string;
  estimatedDurationHours: number;
  actualDurationHours: number;
  dependencies: string[]; // Task IDs that must be completed first
  checklists: IChecklistItem[];
  evidenceIds: string[];
  inspectionIds: string[];
  approvalIds: string[];
  labels: string[];
  completionPercentage: number;
}

// ----------------------------------------------------
// MILESTONES & PHASES
// ----------------------------------------------------
export interface IExecutionMilestone extends IBaseExecutionEntity {
  projectId: string;
  phaseId: string;
  title: string;
  description: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  requiredApprovalTiers: ApprovalTier[];
  isMilestoneApproved: boolean;
  tasksCount: number;
  tasksCompletedCount: number;
}

export interface IExecutionPhase extends IBaseExecutionEntity {
  projectId: string;
  phaseNumber: number;
  title: string;
  description: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  tasks: IExecutionTask[];
  milestones: IExecutionMilestone[];
  phaseCompletionPercentage: number;
}

// ----------------------------------------------------
// PROJECT MASTER ENTITY
// ----------------------------------------------------
export interface IExecutionProject extends IBaseExecutionEntity {
  projectCode: string;
  title: string;
  clientName: string;
  siteAddress: string;
  originatingSessionId?: string;
  originatingRecommendationIds: string[];
  primaryDomains: KnowledgeDomain[];
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  phases: IExecutionPhase[];
  issues: IExecutionIssue[];
  risks: IExecutionRisk[];
  overallProgressPercentage: number;
  evidenceCount: number;
  inspectionCount: number;
  approvalCount: number;
  budgetEstimated?: number;
}

// ----------------------------------------------------
// ACTIVITY LOG & AUDIT
// ----------------------------------------------------
export interface IExecutionActivityLog {
  logId: string;
  projectId: string;
  entityType: 'PROJECT' | 'TASK' | 'CHECKLIST' | 'INSPECTION' | 'EVIDENCE' | 'APPROVAL' | 'ISSUE' | 'RISK';
  entityId: string;
  action: string;
  performedBy: string;
  performedByRole: ExecutionUserRole;
  timestamp: string;
  details: string;
  previousState?: string;
  newState?: string;
}

// ----------------------------------------------------
// PROGRESS METRICS SUMMARY
// ----------------------------------------------------
export interface IExecutionProgressMetrics {
  projectId: string;
  overallProgressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  pendingInspectionTasks: number;
  totalPhases: number;
  completedPhases: number;
  totalMilestones: number;
  achievedMilestones: number;
  evidenceCoveragePercentage: number; // % of tasks with required evidence
  inspectionComplianceRate: number; // % of fully compliant inspections
  openIssuesCount: number;
  criticalRisksCount: number;
  scheduleDelayDays: number;
}
