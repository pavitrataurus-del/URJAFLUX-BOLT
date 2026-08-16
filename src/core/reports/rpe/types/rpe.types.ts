// ============================================================================
// URJAFLUX AI OS - REPORT PREPARATION ENGINE (RPE) TYPES
// Presentation & Delivery Layer - Immutable Report Contracts & Data Models
// ============================================================================

import { IIntegratedConsultationPackage } from "../../../integrated_intelligence/types/iie.types";

// ----------------------------------------------------------------------------
// Delivery Strategy Options (Consultant Controlled Delivery Options)
// ----------------------------------------------------------------------------
export type DeliveryStrategy =
  | 'INTEGRATED_REPORT'         // All domains unified into one single report
  | 'SEPARATE_DOMAIN_REPORTS'   // Individual domain-specific reports (Vastu, Lal Kitab, Numerology, Astrology)
  | 'EXECUTIVE_SUMMARY'         // High-level 1-2 page overview for busy stakeholders
  | 'PRESENTATION_MODE'         // Slide-deck style visual cards for client pitch/walkthrough
  | 'DISCUSSION_MODE'           // Interactive collaborative agenda format for consultation calls
  | 'FOLLOWUP_REPORT'           // Milestone check-in after initial remedies
  | 'REMEDY_PROGRESS_REPORT'    // Tracking execution status of prescribed remedies
  | 'BEFORE_AFTER_COMPARISON'   // Spatial & energetic score shift comparison
  | 'ANNUAL_REVIEW';            // Yearly energetic tune-up and progressive review

// ----------------------------------------------------------------------------
// Report Types (Audience & Dynamic Extended Report Definitions)
// ----------------------------------------------------------------------------
export type StandardReportType =
  | 'CONSULTANT_REPORT'  // Complete transparency: evidence, confidence, conflicts, IDs, notes, overrides
  | 'HOMEOWNER_REPORT'    // Professional, simple, positive language, clean visuals, consultant-approved content
  | 'VISITOR_REPORT';     // Freemium teaser: limited findings, high-level issues, upgrade prompt

export type ReportTypeId =
  | StandardReportType
  | 'VASTU_REPORT'
  | 'LAL_KITAB_REPORT'
  | 'NUMEROLOGY_REPORT'
  | 'ASTROLOGY_REPORT'
  | 'COMPREHENSIVE_INTEGRATED'
  | 'EXECUTIVE_SUMMARY'
  | 'INVESTOR_REPORT'
  | 'ARCHITECT_REPORT'
  | 'BUILDER_REPORT'
  | 'CONTRACTOR_REPORT'
  | 'PROGRESS_REPORT'
  | 'FOLLOWUP_REPORT'
  | 'ANNUAL_REVIEW'
  | string;

export type ReportType = ReportTypeId;

export type ExportFormat = 'PDF' | 'DOCX' | 'HTML' | 'PRINT' | 'DIGITAL_SHARE' | 'PRESENTATION' | 'INTERACTIVE';

// ----------------------------------------------------------------------------
// Report Versioning Lifecycle (Correction 6)
// ----------------------------------------------------------------------------
export type ReportLifecycleState = 'DRAFT' | 'PUBLISHED' | 'REVISION' | 'ARCHIVED';

export interface IReportVersionMetadata {
  versionId: string;
  versionNumber: number; // e.g. 1.0, 1.1, 2.0
  state: ReportLifecycleState;
  createdAt: string;
  publishedAt?: string;
  createdByConsultantId: string;
  changeLogNote?: string;
  isImmutable: boolean;
}

// ----------------------------------------------------------------------------
// Snapshot Engine Contracts (Correction 7)
// ----------------------------------------------------------------------------
export interface IReportSnapshotPackage {
  snapshotId: string;
  consultationPackageId: string;
  snapshotTimestamp: string;
  frozenConsultationPackage: IIntegratedConsultationPackage;
  hashSignature: string;
}

// ----------------------------------------------------------------------------
// Brand Profile Manager Contracts (Correction 8)
// ----------------------------------------------------------------------------
export interface IBrandProfile {
  profileId: string;
  profileName: string;
  consultantId: string;
  isDefault: boolean;
  whiteLabelConfig: IWhiteLabelConfig;
}

// ----------------------------------------------------------------------------
// Media Asset Manager Contracts (Correction 9)
// ----------------------------------------------------------------------------
export type MediaAssetType =
  | 'BLUEPRINT'
  | 'OVERLAY_CHAKRA'
  | 'ROOM_IMAGE'
  | 'SITE_PHOTO'
  | 'BEFORE_AFTER_GRAPHIC'
  | 'ILLUSTRATION'
  | 'VIDEO'
  | 'VOICE_NOTE'
  | 'DOCUMENT'
  | 'ICON'
  | 'MODEL_3D';

export interface IMediaAsset {
  assetId: string;
  title: string;
  assetType: MediaAssetType;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  spatialZone?: string;
  roomId?: string;
  tags: string[];
  metadata?: Record<string, any>;
  uploadedAt: string;
}

// ----------------------------------------------------------------------------
// Report Object Model (ROM) - Hierarchical Tree Structure (Correction 10)
// ----------------------------------------------------------------------------
export type RomElementType = 'TEXT' | 'MEDIA' | 'TABLE' | 'CHART' | 'WIDGET';

export interface IRomElement {
  elementId: string;
  elementType: RomElementType;
  content: string | Record<string, any>;
  styleOverrides?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface IRomWidget {
  widgetId: string;
  widgetType: 'VASTU_16_ZONE_GAUGE' | 'ELEMENTAL_BAR' | 'QR_VERIFICATION' | 'CONSULTANT_CARD' | 'CUSTOM_INTERACTIVE';
  title: string;
  props: Record<string, any>;
}

export interface IRomBlock {
  blockId: string;
  type: 'TEXT' | 'CALLOUT' | 'METRIC' | 'TABLE' | 'DIAGRAM' | 'REMEDY_CARD' | 'PROMPT_CARD' | 'WIDGET_BLOCK';
  title?: string;
  elements: IRomElement[];
  widgets?: IRomWidget[];
  metadata?: Record<string, any>;
}

export interface IRomComponent {
  componentId: string;
  componentName: string;
  blocks: IRomBlock[];
  layoutGridCss?: string;
}

export interface IRomSection {
  sectionId: string;
  sectionCode: string; // e.g. 'SEC_EXEC_SUMMARY', 'SEC_OVERLAY_CHAKRA', etc.
  title: string;
  order: number;
  components: IRomComponent[];
  isLocked?: boolean;
  isConsultantOnly?: boolean;
  isVisible: boolean;
  customConsultantNotes?: string;
}

export interface IReportObjectModel {
  romId: string;
  reportTypeId: ReportTypeId;
  title: string;
  subtitle: string;
  sections: IRomSection[];
  mediaReferences: IMediaAsset[];
  versionMetadata: IReportVersionMetadata;
  snapshotId: string;
  brandProfileId: string;
}

// ----------------------------------------------------------------------------
// Section Registry Contracts (Correction 4)
// ----------------------------------------------------------------------------
export interface ISectionBuilderParams {
  consultation: IIntegratedConsultationPackage;
  deliveryOptions: IDeliveryOptions;
  mediaAssets?: IMediaAsset[];
  selectedDomains?: string[];
  /** Extension: module summaries & access tier for integrated client reports */
  moduleInsights?: {
    integratedScore?: number;
    numerologySummary?: string;
    lalKitabSummary?: string;
    dataCompletenessNote?: string;
    accessTier?: string;
    lockedModules?: string[];
    upsellMessage?: string;
  };
}

export interface ISectionDefinition {
  sectionCode: string;
  displayName: string;
  description: string;
  defaultOrder: number;
  isConsultantOnly?: boolean;
  buildSection: (params: ISectionBuilderParams) => IRomSection;
}

// ----------------------------------------------------------------------------
// Consultant Editing Layer Contracts (Correction 5)
// ----------------------------------------------------------------------------
export type ConsultantEditOperation =
  | 'SHOW_SECTION'
  | 'HIDE_SECTION'
  | 'REORDER_SECTIONS'
  | 'RENAME_SECTION'
  | 'MERGE_SECTIONS'
  | 'SPLIT_SECTION'
  | 'INSERT_NOTE'
  | 'LOCK_SECTION';

export interface IConsultantEditInstruction {
  instructionId: string;
  operation: ConsultantEditOperation;
  targetSectionId: string;
  secondarySectionId?: string; // for merge
  payload?: {
    newTitle?: string;
    newOrder?: number;
    noteText?: string;
    splitPointIndex?: number;
    isLocked?: boolean;
  };
}

// ----------------------------------------------------------------------------
// Dynamic Report Type Definition (Correction 1)
// ----------------------------------------------------------------------------
export interface IReportTypeDefinition {
  typeId: ReportTypeId;
  displayName: string;
  description: string;
  targetAudience: string;
  allowedDomains: string[]; // e.g. ['VASTU', 'LAL_KITAB'] or ['ALL']
  requiredSectionCodes: string[];
  optionalSectionCodes: string[];
  defaultLayoutColumns: number;
  defaultExportFormats: ExportFormat[];
}

// ----------------------------------------------------------------------------
// Supported Languages & Multi-Language Configuration
// ----------------------------------------------------------------------------
export type SupportedLanguage = 'ENGLISH' | 'HINDI' | 'HINGLISH' | string;

export interface ITranslationDictionary {
  language: SupportedLanguage;
  terms: Record<string, string>;
}

// ----------------------------------------------------------------------------
// White Labeling & Branding Configuration
// ----------------------------------------------------------------------------
export interface IWhiteLabelConfig {
  companyName: string;
  tagline?: string;
  logoUrl?: string;
  letterheadHeaderUrl?: string;
  letterheadFooterUrl?: string;
  addressLines?: string[];
  phone?: string;
  email?: string;
  website?: string;
  footerText?: string;
  disclaimerText?: string;
  showQrCode: boolean;
  qrTargetUrl?: string;
  digitalSignatureUrl?: string;
  watermarkText?: string;
  brandTheme: {
    primaryColorHex: string;    // e.g. #1E293B
    secondaryColorHex: string;  // e.g. #0F766E
    accentColorHex: string;     // e.g. #D97706
    backgroundColorHex: string; // e.g. #F8FAFC
    fontHeader: string;         // e.g. 'Playfair Display'
    fontBody: string;           // e.g. 'Plus Jakarta Sans'
  };
  typography: {
    baseFontSizePx: number;
    headingScaleRatio: number;
  };
}

// ----------------------------------------------------------------------------
// Delivery Options Input Contract
// ----------------------------------------------------------------------------
export interface IDeliveryOptions {
  deliveryStrategy: DeliveryStrategy;
  targetLanguage: SupportedLanguage;
  consultantCustomNotes?: string;
  clientGreetingName?: string;
  customReportTitle?: string;
  includeProductSpecs: boolean;
  include3DDiagrams: boolean;
  includeAlternativePathsInHomeowner: boolean;
  separateDomainSelection?: string[]; // e.g., ['VASTU', 'LAL_KITAB']
  accessTier?: "FREE" | "PAID_ONE_TIME" | "CONSULTANT" | "FOUNDER";
}

// ----------------------------------------------------------------------------
// Structured Report Document Elements
// ----------------------------------------------------------------------------
export interface IReportSectionBlock {
  blockId: string;
  type: 'TEXT' | 'CALLOUT' | 'METRIC' | 'TABLE' | 'DIAGRAM' | 'REMEDY_CARD' | 'PROMPT_CARD';
  title?: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface IReportSection {
  sectionId: string;
  title: string;
  order: number;
  blocks: IReportSectionBlock[];
  isConsultantOnly?: boolean;
}

export interface IReportTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  widthPercent?: number;
}

export interface IReportTable {
  tableId: string;
  caption: string;
  columns: IReportTableColumn[];
  rows: Array<Record<string, any>>;
}

export interface IReportDiagram {
  diagramId: string;
  diagramType: 'VASTU_16_ZONE_CHAKRA' | 'ELEMENTAL_BALANCE_CHART' | 'LAL_KITAB_HOUSE_GRID' | 'NUMEROLOGY_GRID' | 'BEFORE_AFTER_GAUGE';
  title: string;
  svgMarkup?: string;
  dataPoints: Array<{ label: string; value: number; category?: string }>;
}

export interface IReportSummaryItem {
  summaryId: string;
  headline: string;
  keyPoints: string[];
  overallEnergyScore?: number;
  grade?: string;
}

// ----------------------------------------------------------------------------
// Single Generated Report Document
// ----------------------------------------------------------------------------
export interface IReportDocument {
  documentId: string;
  reportType: ReportType;
  title: string;
  subtitle: string;
  targetAudience: string;
  language: SupportedLanguage;
  createdAt: string;
  sections: IReportSection[];
  tables: IReportTable[];
  diagrams: IReportDiagram[];
  summaries: IReportSummaryItem[];
}

// ----------------------------------------------------------------------------
// Master Output: IReportPackage
// ----------------------------------------------------------------------------
export interface IReportPackage {
  packageId: string;
  consultationPackageId: string;
  generatedTimestamp: string;
  rpeVersion: string;

  // 3 Primary Generated Versions
  consultantReport: IReportDocument;
  homeownerReport: IReportDocument;
  visitorReport: IReportDocument;

  // Metadata Layers
  deliveryMetadata: {
    strategy: DeliveryStrategy;
    language: SupportedLanguage;
    totalSectionsGenerated: number;
    isLockedForClient: boolean;
  };

  brandMetadata: {
    whiteLabelConfig: IWhiteLabelConfig;
    activeThemeName: string;
  };

  exportMetadata: {
    availableFormats: Array<'PDF' | 'DOCX' | 'HTML' | 'PRINT' | 'DIGITAL_SHARE'>;
    digitalShareToken: string;
    qrCodePayload: string;
    pdfPageEstimate: number;
  };
}
