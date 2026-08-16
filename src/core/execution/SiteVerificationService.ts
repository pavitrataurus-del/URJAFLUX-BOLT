import {
  ISiteInspection,
  InspectionComplianceStatus,
  ExecutionUserRole,
  IExecutionEvidence,
  EvidenceType,
  IApprovalRecord,
  ApprovalTier,
  ApprovalDecision,
} from './ExecutionTypes';
import { ProjectExecutionRegistry } from './ProjectExecutionRegistry';

export class SiteVerificationService {
  private registry: ProjectExecutionRegistry;

  constructor() {
    this.registry = ProjectExecutionRegistry.getInstance();
  }

  public recordInspection(params: {
    projectId: string;
    taskId: string;
    inspectorName: string;
    inspectorRole: ExecutionUserRole;
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
  }): ISiteInspection {
    const inspectionId = `insp-${Date.now()}`;
    const now = new Date().toISOString();

    const inspection: ISiteInspection = {
      id: inspectionId,
      version: '1.0.0',
      status: 'APPROVED',
      owner: params.inspectorName,
      createdBy: params.inspectorName,
      updatedBy: params.inspectorName,
      createdAt: now,
      updatedAt: now,
      projectId: params.projectId,
      taskId: params.taskId,
      inspectorName: params.inspectorName,
      inspectorRole: params.inspectorRole,
      inspectionDate: now,
      locationDetails: params.locationDetails,
      observations: params.observations,
      complianceStatus: params.complianceStatus,
      measurementsTaken: params.measurementsTaken,
      evidenceIds: params.evidenceIds,
      correctiveActionsRequired: params.correctiveActionsRequired,
    };

    this.registry.addInspection(inspection);
    return inspection;
  }

  public uploadEvidence(params: {
    title: string;
    description?: string;
    evidenceType: EvidenceType;
    fileUrl: string;
    uploaderName: string;
    uploaderRole: ExecutionUserRole;
    relatedTaskId: string;
    relatedRecommendationId: string;
    relatedProjectId: string;
    latitude?: number;
    longitude?: number;
    measurementVal?: { numericalValue: number; unit: string; parameterName: string };
  }): IExecutionEvidence {
    const evId = `ev-${Date.now()}`;
    const now = new Date().toISOString();

    const evidence: IExecutionEvidence = {
      id: evId,
      version: '1.0.0',
      status: 'APPROVED',
      owner: params.uploaderName,
      createdBy: params.uploaderName,
      updatedBy: params.uploaderName,
      createdAt: now,
      updatedAt: now,
      title: params.title,
      description: params.description,
      evidenceType: params.evidenceType,
      fileUrl: params.fileUrl,
      uploaderName: params.uploaderName,
      uploaderRole: params.uploaderRole,
      relatedTaskId: params.relatedTaskId,
      relatedRecommendationId: params.relatedRecommendationId,
      relatedProjectId: params.relatedProjectId,
      gpsCoordinates: params.latitude && params.longitude ? { latitude: params.latitude, longitude: params.longitude } : undefined,
      measurementValue: params.measurementVal,
      immutableChecksum: `SHA256:${Math.random().toString(36).substring(2, 15)}`,
      timestamp: now,
    };

    this.registry.addEvidence(evidence);
    return evidence;
  }

  public submitApprovalDecision(params: {
    projectId: string;
    taskId?: string;
    approvalTier: ApprovalTier;
    approverName: string;
    approverRole: ExecutionUserRole;
    decision: ApprovalDecision;
    comments: string;
    signatureMetadata?: string;
  }): IApprovalRecord {
    const apprId = `appr-${Date.now()}`;
    const now = new Date().toISOString();

    const approval: IApprovalRecord = {
      id: apprId,
      version: '1.0.0',
      status: params.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      owner: params.approverName,
      createdBy: params.approverName,
      updatedBy: params.approverName,
      createdAt: now,
      updatedAt: now,
      projectId: params.projectId,
      taskId: params.taskId,
      approvalTier: params.approvalTier,
      approverName: params.approverName,
      approverRole: params.approverRole,
      decision: params.decision,
      comments: params.comments,
      digitalSignatureHash: `SIG-RSA2048:${params.signatureMetadata || Math.random().toString(36).substring(2, 12)}`,
      decisionTimestamp: now,
    };

    this.registry.addApproval(approval);
    return approval;
  }
}
