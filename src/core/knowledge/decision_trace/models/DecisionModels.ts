export enum DecisionStatus {
  PROPOSED = "PROPOSED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
  SUPERSEDED = "SUPERSEDED"
}

export interface IEvidenceReference {
  id: string;
  knowledgeSource: string;
  documentId?: string;
  book?: string;
  edition?: string;
  pageNumber?: number;
  paragraph?: string;
  ontologyConcept?: string;
  graphNodeId?: string;
  graphEdgeId?: string;
  checksum: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export interface IConfidenceScores {
  ocrConfidence?: number;
  ontologyConfidence?: number;
  geometryConfidence?: number;
  graphConfidence?: number;
  expertConfidence?: number;
  compositeConfidence: number;
}

export interface IDecisionAuditRecord {
  id: string;
  decisionId: string;
  action: "CREATED" | "UPDATED" | "APPROVED" | "REJECTED" | "OVERRIDDEN" | "ARCHIVED" | "REVISED";
  timestamp: number;
  author: string;
  reason?: string;
  previousVersionId?: string;
  metadata?: Record<string, any>;
}

export interface IDecisionTrace {
  id: string;
  timestamp: number;
  projectId: string;
  twinId: string;
  namespace: string;
  expertsInvolved: string[];
  inputObjectIds: string[];
  evidenceReferences: IEvidenceReference[];
  rulesReferenced: string[];
  knowledgeSource: string;
  confidence: IConfidenceScores;
  status: DecisionStatus;
  version: string;
  auditTrail: IDecisionAuditRecord[];
  metadata?: Record<string, any>;
}

export interface IStructuredExplanation {
  decisionId: string;
  summary: string;
  evidenceSummary: string[];
  rulesConsulted: string[];
  expertsConsulted: string[];
  confidenceBreakdown: IConfidenceScores;
  alternativePathsConsidered: string[];
  validationStatus: "VALID" | "INVALID" | "PENDING";
}
