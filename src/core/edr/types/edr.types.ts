// ============================================================================
// URJAFLUX AI OS - ENTERPRISE DATASET REPOSITORY (EDR v1.0)
// Purpose: Single source of truth for all datasets across UVF, Knowledge Stack,
// Spatial Engines, and future AI training pipelines.
// ============================================================================

export type BlueprintType =
  | 'RESIDENTIAL'
  | 'VILLA'
  | 'APARTMENT'
  | 'COMMERCIAL'
  | 'FACTORY'
  | 'HOSPITAL'
  | 'TEMPLE'
  | 'WAREHOUSE'
  | 'INDUSTRIAL'
  | 'MIXED_USE'
  | 'IRREGULAR'
  | 'TRIANGLE'
  | 'L_SHAPE'
  | 'HAND_DRAWN'
  | 'SCANNED'
  | 'CAD'
  | 'GOOGLE_EARTH'
  | 'OVERLAY_CHAKRA';

export type RootFolderCategory =
  | 'Blueprints'
  | 'GoogleEarth'
  | 'CAD'
  | 'OverlayChakra'
  | 'Knowledge'
  | 'GoldenOutputs'
  | 'Reports'
  | 'Scenarios'
  | 'Benchmarks'
  | 'Performance'
  | 'Regression'
  | 'ConsultantCases'
  | 'VisitorCases'
  | 'Archive';

export type ReviewStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

// ----------------------------------------------------------------------------
// Dataset Metadata (Engine 8)
// ----------------------------------------------------------------------------
export interface IDatasetMetadata {
  datasetId: string;
  hash: string;
  checksum: string;
  createdBy: string;
  approvedBy?: string;
  reviewStatus: ReviewStatus;
  tags: string[];
  category: RootFolderCategory;
  version: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Engine 1: Blueprint Repository
// ----------------------------------------------------------------------------
export interface IBlueprintDatasetItem {
  blueprintId: string;
  name: string;
  blueprintType: BlueprintType;
  propertyType: string;
  scaleRatio: string;
  dimensionsMeter: { width: number; height: number };
  roomCount: number;
  metadata: IDatasetMetadata;
  vectorPath?: string;
  imageUri?: string;
}

export interface IBlueprintRepositoryReport {
  totalBlueprintsCount: number;
  typeBreakdown: Record<BlueprintType, number>;
  items: IBlueprintDatasetItem[];
}

// ----------------------------------------------------------------------------
// Engine 2: Knowledge Repository
// ----------------------------------------------------------------------------
export interface IKnowledgeBookInfo {
  bookId: string;
  title: string;
  authors: string[];
  edition: string;
  publicationYear: number;
  domain: string;
}

export interface IKnowledgeRecordItem {
  recordId: string;
  title: string;
  domain: 'VASTU' | 'LAL_KITAB' | 'NUMEROLOGY' | 'ASTROLOGY';
  bookInfo: IKnowledgeBookInfo;
  evidence: string[];
  citations: string[];
  rulePackages: string[];
  relationshipGraphsNodesCount: number;
  metadata: IDatasetMetadata;
}

export interface IKnowledgeRepositoryReport {
  totalKnowledgeRecordsCount: number;
  booksCount: number;
  authorsCount: number;
  rulePackagesCount: number;
  records: IKnowledgeRecordItem[];
}

// ----------------------------------------------------------------------------
// Engine 3: Golden Output Repository
// ----------------------------------------------------------------------------
export interface IGoldenOutputDatasetItem {
  goldenId: string;
  blueprintId: string;
  expectedSpatialContext: {
    roomNodeCount: number;
    zoneAssignments: Record<string, string>;
    boundaryIntegrity: boolean;
  };
  expectedKnowledgeResults: {
    matchedRulesCount: number;
    doshaScore: number;
    remediesSuggestedCount: number;
  };
  expectedConfidence: {
    overallConfidenceScore: number;
    confidenceInterval: [number, number];
  };
  expectedConflicts: {
    hasConflicts: boolean;
    conflictCount: number;
    resolvedStatus: string;
  };
  expectedIntegratedReports: {
    jsonReportValid: boolean;
    pdfReportValid: boolean;
    executiveSummary: string;
  };
  metadata: IDatasetMetadata;
}

export interface IGoldenOutputRepositoryReport {
  totalGoldenOutputsCount: number;
  items: IGoldenOutputDatasetItem[];
}

// ----------------------------------------------------------------------------
// Engine 4: Scenario Repository
// ----------------------------------------------------------------------------
export type ScenarioType =
  | 'CURRENT'
  | 'FUTURE'
  | 'CONSULTANT_PROPOSAL'
  | 'CLIENT_PROPOSAL'
  | 'ALTERNATIVE_LAYOUT'
  | 'RENOVATION'
  | 'EXPANSION';

export interface IScenarioDatasetItem {
  scenarioId: string;
  name: string;
  scenarioType: ScenarioType;
  propertyId: string;
  description: string;
  modificationsCount: number;
  remediesApplied: string[];
  metadata: IDatasetMetadata;
}

export interface IScenarioRepositoryReport {
  totalScenariosCount: number;
  typeBreakdown: Record<ScenarioType, number>;
  items: IScenarioDatasetItem[];
}

// ----------------------------------------------------------------------------
// Engine 5: Benchmark Repository
// ----------------------------------------------------------------------------
export interface IBenchmarkDatasetItem {
  benchmarkId: string;
  name: string;
  category: 'EXECUTION' | 'PERFORMANCE' | 'MEMORY' | 'STRESS';
  concurrencyLevel: number;
  executionTimeMs: number;
  memoryPeakMb: number;
  cpuPeakPercent: number;
  throughputOpsPerSec: number;
  metadata: IDatasetMetadata;
}

export interface IBenchmarkRepositoryReport {
  totalBenchmarksCount: number;
  items: IBenchmarkDatasetItem[];
}

// ----------------------------------------------------------------------------
// Engine 6: Dataset Version Manager
// ----------------------------------------------------------------------------
export interface IDatasetVersionRecord {
  version: string;
  createdAt: string;
  author: string;
  changeLog: string;
  snapshotHash: string;
  isApproved: boolean;
  approvedBy?: string;
  reviewNotes?: string;
}

export interface IDatasetVersionInfo {
  datasetId: string;
  category: RootFolderCategory;
  currentVersion: string;
  versionHistory: IDatasetVersionRecord[];
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  isApproved: boolean;
  approvedBy?: string;
  reviewStatus: ReviewStatus;
  canRollback: boolean;
  rollbackTargetVersion?: string;
}

export interface IDatasetVersionManagerReport {
  totalManagedVersionsCount: number;
  lockedCount: number;
  approvedCount: number;
  underReviewCount: number;
  datasetVersions: IDatasetVersionInfo[];
}

// ----------------------------------------------------------------------------
// Engine 7: Dataset Search Engine
// ----------------------------------------------------------------------------
export interface IDatasetSearchParams {
  tags?: string[];
  category?: RootFolderCategory;
  blueprintType?: BlueprintType;
  propertyType?: string;
  knowledgeDomain?: string;
  author?: string;
  edition?: string;
  dateFrom?: string;
  dateTo?: string;
  queryText?: string;
}

export interface IDatasetSearchResultItem {
  datasetId: string;
  name: string;
  category: RootFolderCategory;
  version: string;
  relevanceScore: number;
  tags: string[];
  metadata: IDatasetMetadata;
}

export interface IDatasetSearchResult {
  searchParams: IDatasetSearchParams;
  totalResultsCount: number;
  durationMs: number;
  results: IDatasetSearchResultItem[];
}

// ----------------------------------------------------------------------------
// Engine 8: Dataset Metadata Engine
// ----------------------------------------------------------------------------
export interface IDatasetMetadataRegistryReport {
  totalRegisteredDatasetsCount: number;
  byCategoryCount: Record<RootFolderCategory, number>;
  byStatusCount: Record<ReviewStatus, number>;
  metadataRegistry: Record<string, IDatasetMetadata>;
}

// ----------------------------------------------------------------------------
// Engine 9: Dataset Integrity Engine
// ----------------------------------------------------------------------------
export interface IDatasetIntegrityIssue {
  issueId: string;
  datasetId: string;
  issueType: 'CORRUPTION' | 'DUPLICATE' | 'BROKEN_REFERENCE' | 'HASH_MISMATCH';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface IDatasetIntegrityReport {
  isIntegrityValid: boolean;
  totalDatasetsVerified: number;
  corruptedCount: number;
  duplicatesCount: number;
  brokenReferencesCount: number;
  hashIntegrityVerified: boolean;
  issues: IDatasetIntegrityIssue[];
}

// ----------------------------------------------------------------------------
// Engine 10: Dataset Export Engine
// ----------------------------------------------------------------------------
export type DatasetExportFormat = 'JSON' | 'ZIP' | 'CSV' | 'MARKDOWN' | 'SQL';

export interface IDatasetExportResult {
  exportId: string;
  datasetId: string;
  format: DatasetExportFormat;
  exportedAt: string;
  fileSizeBytes: number;
  contentOrPayloadUri: string;
  isSQLSchemaReady: boolean;
}

export interface IDatasetExportReport {
  supportedFormats: DatasetExportFormat[];
  activeExportsCount: number;
  exports: IDatasetExportResult[];
}

// ----------------------------------------------------------------------------
// Root Folder Structure Summary
// ----------------------------------------------------------------------------
export interface IRootFolderStructure {
  blueprintsCount: number;
  googleEarthCount: number;
  cadCount: number;
  overlayChakraCount: number;
  knowledgeCount: number;
  goldenOutputsCount: number;
  reportsCount: number;
  scenariosCount: number;
  benchmarksCount: number;
  performanceCount: number;
  regressionCount: number;
  consultantCasesCount: number;
  visitorCasesCount: number;
  archiveCount: number;
  folderTree: Array<{
    folderName: RootFolderCategory;
    itemsCount: number;
    subFolders?: string[];
  }>;
}

// ----------------------------------------------------------------------------
// MAIN OUTPUT CONTRACT: IEnterpriseDatasetRepository
// ----------------------------------------------------------------------------
export interface IEnterpriseDatasetRepository {
  version: '1.0.0-EDR-ENTERPRISE';
  timestamp: string;
  rootStructure: IRootFolderStructure;
  blueprintRepository: IBlueprintRepositoryReport;
  knowledgeRepository: IKnowledgeRepositoryReport;
  goldenOutputRepository: IGoldenOutputRepositoryReport;
  scenarioRepository: IScenarioRepositoryReport;
  benchmarkRepository: IBenchmarkRepositoryReport;
  versionManager: IDatasetVersionManagerReport;
  metadataRegistry: IDatasetMetadataRegistryReport;
  integrityReport: IDatasetIntegrityReport;
  exportReport: IDatasetExportReport;
}
