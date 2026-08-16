export enum ApprovalStatus {
  DRAFT = "DRAFT",
  REVIEW = "REVIEW",
  APPROVED = "APPROVED",
  DEPRECATED = "DEPRECATED",
  REJECTED = "REJECTED"
}

export interface INamespace {
  id: string;
  name: string;
  version: string;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  metadata: Record<string, any>;
  compatibilityRules: Record<string, any>;
}

export interface IKnowledgeSource {
  id: string;
  title: string;
  author: string;
  edition: string;
  language: string;
  publicationDate?: string;
  approvalStatus: ApprovalStatus;
  namespaceId: string;
  version: string;
  metadata: Record<string, any>;
}
