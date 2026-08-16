export type VastuDocumentCategory =
  | 'Residential Vastu'
  | 'Commercial Vastu'
  | 'Industrial Vastu'
  | 'Apartment Vastu'
  | 'Temple Architecture'
  | 'Factories'
  | 'Hospitals'
  | 'Hotels'
  | 'Schools'
  | 'Offices'
  | 'Landscape'
  | 'Urban Planning'
  | 'Traditional Texts'
  | 'Research';

export type VastuEntityType =
  | 'Room'
  | 'Direction'
  | 'Zone'
  | 'Element'
  | 'Object'
  | 'Rule'
  | 'Recommendation'
  | 'Remedy'
  | 'Yantra'
  | 'Chakra'
  | 'Planet'
  | 'Number'
  | 'Symbol'
  | 'Mantra'
  | 'Material'
  | 'Shape'
  | 'Geometry'
  | 'Energy Field'
  | 'Deities'
  | 'Doshas'
  | 'Positive Conditions'
  | 'Negative Conditions';

export type VastuRelationshipType =
  | 'LOCATED_IN'
  | 'ASSOCIATED_WITH'
  | 'CAUSES'
  | 'AFFECTS'
  | 'BALANCES'
  | 'REMEDIES'
  | 'RULES'
  | 'GOVERNS'
  | 'SUPPORTS'
  | 'CONFLICTS_WITH';

export type ExpertReviewStatus =
  | 'Pending'
  | 'Reviewed'
  | 'Approved'
  | 'Rejected'
  | 'Needs Revision';

export interface IVastuDocumentMetadata {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  edition?: string;
  publicationYear?: number;
  language: string;
  documentType: 'Printed Book' | 'Scanned Book' | 'OCR PDF' | 'Native PDF' | 'Image' | 'Research Paper' | 'Ancient Text' | 'Notes' | 'DOCX' | 'TXT' | 'Markdown';
  knowledgeDomain: 'Vastu Shastra' | 'Sthapatya Veda' | 'Mayamatam' | 'Manasara' | 'Samarangana Sutradhara';
  category: VastuDocumentCategory;
  subject: string;
  keywords: string[];
  pageCount: number;
  ocrConfidence: number;
  uploadDate: string;
  uploadedBy: string;
  approvalStatus: ExpertReviewStatus;
  version: string;
  qualityScore: number;
}

export interface IVastuEntity {
  id: string;
  name: string;
  type: VastuEntityType;
  canonicalName: string;
  aliases: string[];
  description: string;
  attributes: Record<string, any>;
  sourceDocumentId: string;
  sourcePage?: number;
  confidence: number;
  approvalStatus: ExpertReviewStatus;
}

export interface IVastuRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: VastuRelationshipType;
  description: string;
  weight: number;
  sourceDocumentId: string;
  sourcePage?: number;
  approvalStatus: ExpertReviewStatus;
  isBidirectional?: boolean;
}

export interface IVastuKnowledgeConflict {
  id: string;
  entityIdOrTopic: string;
  topicName: string;
  sourceAId: string;
  sourceATitle: string;
  statementA: string;
  sourceBId: string;
  sourceBTitle: string;
  statementB: string;
  conflictType: 'Direct Contradiction' | 'Remedy Discrepancy' | 'Directional Mismatch' | 'Severity Variance';
  reviewStatus: ExpertReviewStatus;
  expertNotes?: string;
  reviewedBy?: string;
  detectedAt: string;
}

export interface IVastuQualityScoreBreakdown {
  overallScore: number;
  ocrQualityScore: number;
  metadataCompletenessScore: number;
  ontologyCompletenessScore: number;
  relationshipDensityScore: number;
  embeddingQualityScore: number;
  expertApprovalScore: number;
  qualityGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  recommendations: string[];
}
