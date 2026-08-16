// ============================================================================
// URJAFLUX AI OS - ENTERPRISE VALIDATION DASHBOARD (EVD v2.0)
// Founder Enterprise Operations Center - Data Contracts & Interfaces
// ============================================================================

import { IValidationFrameworkResult } from "../../uvf/types/uvf.types";
import { IEnterpriseDatasetRepository } from "../../edr/types/edr.types";

// ----------------------------------------------------------------------------
// Dashboard 1: System Overview
// ----------------------------------------------------------------------------
export interface ISystemOverview {
  platformStatus: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  engineStatusSummary: {
    totalEngines: number;
    healthyEnginesCount: number;
    degradedEnginesCount: number;
  };
  currentVersion: string;
  runningTasksCount: number;
  queueLength: number;
  activeSessionsCount: number;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  storageUsageMb: number;
  repositorySizeBytes: number;
}

// ----------------------------------------------------------------------------
// Dashboard 2: Engine Health
// ----------------------------------------------------------------------------
export interface IEngineHealthMetric {
  engineId: string;
  engineName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  executionTimeMs: number;
  averageRuntimeMs: number;
  failureCount: number;
  warningsCount: number;
  lastRunTimestamp: string;
  successRatePercentage: number;
}

export interface IEngineHealthDashboard {
  totalMonitoredEngines: number;
  engines: IEngineHealthMetric[];
}

// ----------------------------------------------------------------------------
// Dashboard 3: Live Pipeline
// ----------------------------------------------------------------------------
export interface IPipelineStepStatus {
  stepName: string;
  engine: string;
  status: 'COMPLETED' | 'RUNNING' | 'WAITING' | 'FAILED';
  executionTimeMs: number;
  order: number;
}

export interface ILivePipelineStatus {
  pipelineId: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  totalSteps: number;
  completedStepsCount: number;
  runningStepsCount: number;
  waitingStepsCount: number;
  failedStepsCount: number;
  totalDurationMs: number;
  steps: IPipelineStepStatus[];
}

// ----------------------------------------------------------------------------
// Dashboard 4: Validation Center
// ----------------------------------------------------------------------------
export interface IValidationCenterDashboard {
  activeRunId: string;
  totalValidationRunsRecorded: number;
  history: Array<{
    runId: string;
    timestamp: string;
    durationMs: number;
    triggeredBy: string;
    status: 'PASS' | 'FAIL';
  }>;
  executionQueueLength: number;
  averageExecutionDurationMs: number;
  regressionAlertsCount: number;
  overallStatus: 'RELEASE_READY' | 'RELEASE_BLOCKED';
}

// ----------------------------------------------------------------------------
// Dashboard 5: Blueprint Analytics
// ----------------------------------------------------------------------------
export interface IBlueprintAnalyticsDashboard {
  totalBlueprintCount: number;
  residentialCount: number;
  commercialCount: number;
  hospitalCount: number;
  templeCount: number;
  factoryCount: number;
  cadCount: number;
  googleEarthCount: number;
  overlayChakraCount: number;
  handDrawnCount: number;
  scannedCount: number;
  unknownCount: number;
}

// ----------------------------------------------------------------------------
// Dashboard 6: Knowledge Analytics
// ----------------------------------------------------------------------------
export interface IKnowledgeAnalyticsDashboard {
  knowledgeRecordsCount: number;
  booksCount: number;
  authorsCount: number;
  domainsCount: number;
  rulesCount: number;
  evidenceCount: number;
  citationsCount: number;
  relationshipGraphsCount: number;
  editionsCount: number;
}

// ----------------------------------------------------------------------------
// Dashboard 7: Performance Analytics
// ----------------------------------------------------------------------------
export interface IPerformanceAnalyticsDashboard {
  executionTimeTrendMs: number[];
  memoryTrendMb: number[];
  cpuTrendPercent: number[];
  graphSizeNodes: number;
  ruleEvaluationsCount: number;
  processingTimeMs: number;
  slowestEngines: Array<{ engineName: string; durationMs: number }>;
  fastestEngines: Array<{ engineName: string; durationMs: number }>;
}

// ----------------------------------------------------------------------------
// Dashboard 8: Failure Analytics
// ----------------------------------------------------------------------------
export interface IFailureAnalyticsDashboard {
  totalFailuresCount: number;
  failureTimeline: Array<{ timestamp: string; failureId: string; engine: string; rootCause: string }>;
  failureHeatmap: Array<{ engine: string; failureCount: number; riskLevel: string }>;
  topFailures: Array<{
    failureId: string;
    rootCause: string;
    engine: string;
    frequency: number;
    severity: string;
  }>;
}

// ----------------------------------------------------------------------------
// Dashboard 9: Regression Center
// ----------------------------------------------------------------------------
export interface IRegressionCenterDashboard {
  hasRegression: boolean;
  outputChangesCount: number;
  ruleChangesCount: number;
  schemaChangesCount: number;
  apiChangesCount: number;
  performanceChangesCount: number;
  regressionSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ----------------------------------------------------------------------------
// Dashboard 10: Coverage Center
// ----------------------------------------------------------------------------
export interface ICoverageCenterDashboard {
  overallCoveragePercentage: number;
  engineCoveragePercentage: number;
  moduleCoveragePercentage: number;
  pipelineCoveragePercentage: number;
  ruleCoveragePercentage: number;
  knowledgeCoveragePercentage: number;
  blueprintCoveragePercentage: number;
  workflowCoveragePercentage: number;
  datasetCoveragePercentage: number;
}

// ----------------------------------------------------------------------------
// Dashboard 11: Dataset Center
// ----------------------------------------------------------------------------
export interface IDatasetCenterDashboard {
  totalDatasetsCount: number;
  blueprintRepositoryCount: number;
  knowledgeRepositoryCount: number;
  goldenRepositoryCount: number;
  scenarioRepositoryCount: number;
  benchmarkRepositoryCount: number;
  datasetVersionsCount: number;
  datasetGrowthRatePercentage: number;
  repositoryHealth: 'OPTIMAL' | 'ATTENTION_REQUIRED' | 'DEGRADED';
}

// ----------------------------------------------------------------------------
// Dashboard 12: Audit Center
// ----------------------------------------------------------------------------
export interface IAuditCenterDashboard {
  evidenceIntegrityVerified: boolean;
  citationIntegrityVerified: boolean;
  knowledgeTraceabilityVerified: boolean;
  consultantDecisionsAuditedCount: number;
  snapshotsCount: number;
  auditTimeline: Array<{ timestamp: string; action: string; verifiedBy: string }>;
}

// ----------------------------------------------------------------------------
// Dashboard 13: Founder Constitution
// ----------------------------------------------------------------------------
export interface IFounderCenterDashboard {
  founderComplianceScore: number;
  architectureDriftScore: number;
  boundaryViolationsCount: number;
  responsibilityViolationsCount: number;
  immutableContractStatus: 'VERIFIED_IMMUTABLE' | 'VIOLATED';
}

// ----------------------------------------------------------------------------
// Dashboard 14: Security Center
// ----------------------------------------------------------------------------
export interface ISecurityCenterDashboard {
  permissionStatus: 'ENFORCED' | 'DEGRADED';
  immutableAssetsVerified: boolean;
  securityAlertsCount: number;
  repositoryIntegrityVerified: boolean;
  accessViolationsCount: number;
}

// ----------------------------------------------------------------------------
// Dashboard 15: Release Center
// ----------------------------------------------------------------------------
export interface IReleaseCenterDashboard {
  currentBuildId: string;
  typeScriptStatus: 'PASS' | 'FAIL';
  buildStatus: 'PASS' | 'FAIL';
  unitTestsStatus: 'PASS' | 'FAIL';
  regressionTestsStatus: 'PASS' | 'FAIL';
  coveragePercentage: number;
  qualityScore: number;
  releaseDecision: 'RELEASE_READY' | 'RELEASE_BLOCKED';
  releaseBlockers: string[];
}

// ----------------------------------------------------------------------------
// Dashboard 16: Quality Center
// ----------------------------------------------------------------------------
export interface IQualityCenterDashboard {
  platformQualityScore: number;
  engineScores: Record<string, number>;
  riskIndex: number;
  readinessIndex: number;
  performanceIndex: number;
  regressionIndex: number;
}

// ----------------------------------------------------------------------------
// Dashboard 17: Search Center
// ----------------------------------------------------------------------------
export interface ISearchCenterQueryResult {
  query: string;
  blueprintsMatchesCount: number;
  rulesMatchesCount: number;
  knowledgeMatchesCount: number;
  datasetsMatchesCount: number;
  reportsMatchesCount: number;
  failuresMatchesCount: number;
  validationRunsMatchesCount: number;
  auditRecordsMatchesCount: number;
  totalMatchesCount: number;
}

// ----------------------------------------------------------------------------
// Dashboard 18: Timeline Center
// ----------------------------------------------------------------------------
export interface ITimelineCenterDashboard {
  projectTimeline: Array<{ timestamp: string; milestone: string; status: string }>;
  validationTimeline: Array<{ timestamp: string; runId: string; status: string }>;
  datasetTimeline: Array<{ timestamp: string; datasetId: string; action: string }>;
  releaseTimeline: Array<{ timestamp: string; version: string; releaseState: string }>;
  failureTimeline: Array<{ timestamp: string; failureId: string; rootCause: string }>;
}

// ----------------------------------------------------------------------------
// Dashboard 19: Live Alert Center
// ----------------------------------------------------------------------------
export interface ILiveAlertItem {
  alertId: string;
  category: 'PERFORMANCE' | 'REGRESSION' | 'ARCHITECTURE' | 'SECURITY' | 'VALIDATION' | 'FOUNDER';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
}

export interface ILiveAlertCenterDashboard {
  activeAlertsCount: number;
  alerts: ILiveAlertItem[];
}

// ----------------------------------------------------------------------------
// Dashboard 20: Executive Command Center
// ----------------------------------------------------------------------------
export interface IExecutiveCommandCenter {
  overallPlatformHealth: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL';
  currentBuildId: string;
  runningPipelinesCount: number;
  qualityScore: number;
  coveragePercentage: number;
  performanceIndex: number;
  failuresCount: number;
  architectureDriftScore: number;
  founderComplianceScore: number;
  releaseReadiness: 'RELEASE_READY' | 'RELEASE_BLOCKED';
}

// ----------------------------------------------------------------------------
// MAIN OUTPUT CONTRACT: IEnterpriseValidationDashboard
// ----------------------------------------------------------------------------
export interface IEnterpriseValidationDashboard {
  version: '2.0.0-EVD-ENTERPRISE-OPERATIONS-CENTER';
  timestamp: string;
  systemOverview: ISystemOverview;
  engineHealth: IEngineHealthDashboard;
  pipelineStatus: ILivePipelineStatus;
  validationCenter: IValidationCenterDashboard;
  blueprintAnalytics: IBlueprintAnalyticsDashboard;
  knowledgeAnalytics: IKnowledgeAnalyticsDashboard;
  performanceAnalytics: IPerformanceAnalyticsDashboard;
  failureAnalytics: IFailureAnalyticsDashboard;
  regressionCenter: IRegressionCenterDashboard;
  coverageCenter: ICoverageCenterDashboard;
  datasetCenter: IDatasetCenterDashboard;
  auditCenter: IAuditCenterDashboard;
  founderCenter: IFounderCenterDashboard;
  securityCenter: ISecurityCenterDashboard;
  releaseCenter: IReleaseCenterDashboard;
  qualityCenter: IQualityCenterDashboard;
  searchCenter: ISearchCenterQueryResult;
  timelineCenter: ITimelineCenterDashboard;
  alertCenter: ILiveAlertCenterDashboard;
  executiveCommandCenter: IExecutiveCommandCenter;
}
