import { KnowledgeDomain } from '../reasoning/ReasoningTypes';

export type ReportStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'APPROVED'
  | 'DELIVERED'
  | 'REVISED'
  | 'ARCHIVED';

export type ReportType =
  | 'EXECUTIVE_SUMMARY'
  | 'TECHNICAL_ANALYSIS'
  | 'PROPERTY_AUDIT'
  | 'SITE_INSPECTION'
  | 'MONITORING_TELEMETRY'
  | 'COMPLIANCE_CERTIFICATE'
  | 'DIGITAL_TWIN'
  | 'CONSULTATION_SUMMARY'
  | 'MAINTENANCE_SCHEDULE'
  | 'CLIENT_PRESENTATION'
  | 'RESIDENTIAL_VASTU'
  | 'COMMERCIAL_VASTU'
  | 'INDUSTRIAL_VASTU'
  | 'TEMPLE_COMPLIANCE'
  | 'SCHOOL_REPORT'
  | 'HOSPITAL_REPORT';

export type ExportFormat = 'PDF' | 'DOCX' | 'HTML' | 'MARKDOWN' | 'JSON' | 'PRINT' | 'EMAIL' | 'CLOUD_SHARE';
export type LanguageCode = 'en' | 'hi';

export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'FIELD_ENGINEER' | 'END_USER' | 'OWNER' | 'REVIEWER' | 'VIEWER' | 'EDITOR' | 'APPROVER';

export interface IBaseEntity {
  id: string;
  uuid: string;
  version: number;
  status: ReportStatus;
  ownerId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReportMetadata {
  title: string;
  subtitle?: string;
  reportType: ReportType;
  propertyId?: string;
  propertyName?: string;
  projectId?: string;
  projectTitle?: string;
  authorName: string;
  authorRole: UserRole;
  clientName?: string;
  language: LanguageCode;
  tags: string[];
}

export interface IReportBranding {
  brandingId: string;
  companyName: string;
  tagline: string;
  primaryColor: string; // Hex color e.g., #059669
  secondaryColor: string; // Hex color e.g., #0284c7
  accentColor: string; // Hex color e.g., #d97706
  logoUrl?: string;
  clientLogoUrl?: string;
  headerText: string;
  footerText: string;
  watermarkText?: string;
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Playfair Display' | 'Roboto Mono';
  showQrCode: boolean;
  qrCodeTargetUrl?: string;
  
  // Enterprise White Label extensions:
  consultantName?: string;
  consultantRole?: string;
  companyEmail?: string;
  companyPhone?: string;
  digitalSignatureUrl?: string;
  stampUrl?: string;
  showPageNumbers?: boolean;
}

export interface IReportCitation {
  citationId: string;
  domain: KnowledgeDomain;
  sourceBook: string;
  chapterVerse?: string;
  author?: string;
  reliabilityScore: number;
  excerptText?: string;
  linkedRuleId?: string;
}

export interface IReportAttachment {
  attachmentId: string;
  attachmentType: 'FLOOR_PLAN' | 'PROPERTY_PHOTO' | 'MONITORING_CHART' | 'TIMELINE_GRAPH' | 'EVIDENCE_IMAGE' | 'DIGITAL_TWIN_VIEW' | 'QR_CODE' | 'CAD_SCREENSHOT' | 'PDF_ATTACHMENT';
  title: string;
  description?: string;
  assetUrl: string;
  sourceDomain: string;
  timestamp: string;
  caption?: string;
}

export type BlockType =
  | 'HEADING'
  | 'PARAGRAPH'
  | 'CHECKLIST'
  | 'IMAGE'
  | 'GALLERY'
  | 'FLOOR_PLAN'
  | 'DRAWING'
  | 'CHART'
  | 'TABLE'
  | 'DIVIDER'
  | 'QUOTE'
  | 'ALERT'
  | 'OBSERVATION'
  | 'RECOMMENDATION'
  | 'REMEDY'
  | 'CHAKRA'
  | 'COMPASS'
  | 'PAGE_BREAK'
  | 'SIGNATURE'
  | 'CUSTOM_HTML';

export interface IReportBlock {
  blockId: string;
  type: BlockType;
  content: any; // Block content (text, images, checklist arrays, key-value objects)
  isVisible: boolean;
  isLocked: boolean;
  orderIndex: number;
}

export interface IReportSectionData {
  sectionId: string;
  sectionKey: string; // e.g., 'EXECUTIVE_SUMMARY', 'KNOWLEDGE_FINDINGS', 'COVER_PAGE', etc.
  title: string;
  subTitle?: string;
  orderIndex: number;
  isVisible: boolean;
  isLocked?: boolean;
  isCollapsed?: boolean;
  contentMarkdown: string;
  structuredData?: Record<string, any>;
  citations?: IReportCitation[];
  attachments?: IReportAttachment[];
  subSections?: IReportSectionData[];
  
  // Dynamic modular block-level items:
  blocks?: IReportBlock[];
}

export interface IReportTemplate {
  templateId: string;
  templateName: string;
  description: string;
  recommendedReportType: ReportType;
  defaultSectionsKeys: string[];
  defaultBranding: IReportBranding;
  isCustom: boolean;
}

// Enterprise Version History
export interface IReportVersion {
  versionId: string;
  versionNumber: number;
  timestamp: string;
  author: string;
  revisionNotes: string;
  sectionsSnapshot: IReportSectionData[];
  brandingSnapshot?: IReportBranding;
}

// Enterprise Comments System
export interface IReportComment {
  commentId: string;
  sectionId?: string; // Optional context-bound section
  author: string;
  authorRole: UserRole;
  text: string;
  timestamp: string;
  isResolved: boolean;
  highlightedText?: string;
}

export interface IReport extends IBaseEntity {
  reportNumber: string; // e.g. URF-REP-2026-001
  metadata: IReportMetadata;
  branding: IReportBranding;
  sections: IReportSectionData[];
  attachments: IReportAttachment[];
  allCitations: IReportCitation[];
  exportJobsCount: number;
  approvedBy?: string;
  approvedAt?: string;

  // Enterprise Report Engine fields:
  reportId?: string; // Mapped alias
  identityId: string; // Identity ID (Client)
  propertyId: string; // Property ID
  consultationId?: string; // Consultation ID
  consultantId: string; // Consultant ID
  reportVersion: string; // Dynamic version string
  reportStatus: ReportStatus;
  createdDate: string;
  updatedDate: string;
  publishedDate?: string;
  deliveredDate?: string;
  archiveStatus: boolean;

  // Reusable sub-systems
  versions?: IReportVersion[];
  comments?: IReportComment[];
  permissions?: Record<string, UserRole>; // Role mappings e.g., "usr-id" -> "EDITOR"
}

export interface IReportExportJob {
  jobId: string;
  reportId: string;
  format: ExportFormat;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  requestedBy: string;
  generatedFileUrl?: string;
  fileSizeBytes?: number;
  createdAt: string;
  completedAt?: string;
}

export interface IReportAuditLog {
  auditId: string;
  reportId: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'EXPORTED' | 'APPROVED' | 'ARCHIVED';
  performedBy: string;
  userRole: UserRole;
  details: string;
  timestamp: string;
}
