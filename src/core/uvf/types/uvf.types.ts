// ============================================================================
// URJAFLUX AI OS - UVF v1.0 TYPE DEFINITIONS
// URJAFLUX QA & Validation Framework (UVF)
// Enterprise Quality Platform Data Contracts & Result Interfaces
// FOUNDER LOCKS: UVF never changes platform behavior, rules, or reports. Only validates.
// ============================================================================

// ----------------------------------------------------------------------------
// Module 1: Test Discovery
// ----------------------------------------------------------------------------
export interface IDiscoveredComponent {
  componentId: string;
  name: string;
  category: 'ENGINE' | 'MODULE' | 'PIPELINE' | 'VALIDATOR' | 'API' | 'RULE' | 'DOMAIN';
  version: string;
  isRegistered: boolean;
}

export interface IExecutionPlan {
  planId: string;
  discoveredComponentsCount: number;
  components: IDiscoveredComponent[];
  testSuitesToExecute: string[];
  estimatedExecutionTimeMs: number;
}

// ----------------------------------------------------------------------------
// Module 2: Unit Test
// ----------------------------------------------------------------------------
export interface IUnitTestResult {
  engineName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  executionTimeMs: number;
  failures: Array<{ testName: string; errorMessage: string; stackTrace?: string }>;
}

// ----------------------------------------------------------------------------
// Module 3: End to End Pipeline
// ----------------------------------------------------------------------------
export interface IPipelineStepVerification {
  stepName: 'SRE' | 'BMUE' | 'BSUE' | 'SCL' | 'KQE' | 'KCoE' | 'KIE' | 'KCE' | 'CRE' | 'IIE' | 'RPE';
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  executionTimeMs: number;
  hasContext: boolean;
  contractViolations: string[];
}

export interface IE2EPipelineResult {
  pipelineId: string;
  status: 'PASS' | 'FAIL';
  totalDurationMs: number;
  stepVerifications: IPipelineStepVerification[];
  missingContextKeys: string[];
  brokenContractsCount: number;
}

// ----------------------------------------------------------------------------
// Module 4: Blueprint Validation
// ----------------------------------------------------------------------------
export type BlueprintArchetype =
  | 'RESIDENTIAL'
  | 'APARTMENT'
  | 'VILLA'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'HOSPITAL'
  | 'TEMPLE'
  | 'WAREHOUSE'
  | 'FACTORY'
  | 'SCHOOL'
  | 'HOTEL'
  | 'FARM'
  | 'L_SHAPE'
  | 'TRIANGLE'
  | 'IRREGULAR'
  | 'OVERLAY_CHAKRA'
  | 'GOOGLE_EARTH'
  | 'CAD_EXPORT'
  | 'HAND_DRAWN'
  | 'SCANNED';

export interface IBlueprintTestRecord {
  blueprintId: string;
  archetype: BlueprintArchetype;
  expectedRoomsCount: number;
  detectedRoomsCount: number;
  expectedObjectsCount: number;
  detectedObjectsCount: number;
  expectedZonesCount: number;
  detectedZonesCount: number;
  expectedActivitiesCount: number;
  detectedActivitiesCount: number;
  isContextValid: boolean;
  accuracyScore: number; // 0 - 100
}

export interface IBlueprintValidationReport {
  totalBlueprintsTested: number;
  passedBlueprintsCount: number;
  averageAccuracyScore: number;
  testRecords: IBlueprintTestRecord[];
}

// ----------------------------------------------------------------------------
// Module 5: Golden Output
// ----------------------------------------------------------------------------
export interface IGoldenOutputComparison {
  blueprintId: string;
  jsonMatch: boolean;
  reportMatch: boolean;
  ruleMatchesMatch: boolean;
  remediesMatch: boolean;
  confidenceMatch: boolean;
  conflictsMatch: boolean;
  overallMatchScore: number; // 0 - 100
  diffKeys: string[];
}

export interface IGoldenOutputResult {
  totalGoldenBlueprints: number;
  matchingCount: number;
  comparisons: IGoldenOutputComparison[];
}

// ----------------------------------------------------------------------------
// Module 6: Regression
// ----------------------------------------------------------------------------
export interface IRegressionReport {
  hasRegression: boolean;
  outputChangesCount: number;
  ruleChangesCount: number;
  contextChangesCount: number;
  reportChangesCount: number;
  performanceChangesCount: number;
  apiChangesCount: number;
  schemaChangesCount: number;
  detectedRegressions: Array<{ category: string; description: string; impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKING' }>;
}

// ----------------------------------------------------------------------------
// Module 7: Contract Validation
// ----------------------------------------------------------------------------
export interface IContractValidationResult {
  interfacesValid: boolean;
  jsonSchemasValid: boolean;
  enumsValid: boolean;
  idsValid: boolean;
  relationshipsValid: boolean;
  versionCompatible: boolean;
  backwardCompatible: boolean;
  contractErrors: string[];
}

// ----------------------------------------------------------------------------
// Module 8: Performance Benchmark
// ----------------------------------------------------------------------------
export interface IPerformanceMetric {
  metricName: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'CRITICAL';
}

export interface IPerformanceReport {
  processingTimeMs: number;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  graphSizeNodes: number;
  ruleCountEvaluated: number;
  queryTimeMs: number;
  reportTimeMs: number;
  peakMemoryMb: number;
  metrics: IPerformanceMetric[];
  performanceTrends: string[];
}

// ----------------------------------------------------------------------------
// Module 9: Audit Validation
// ----------------------------------------------------------------------------
export interface IAuditValidationReport {
  evidenceHashesVerified: boolean;
  citationChainsValid: boolean;
  ruleTraceabilityValid: boolean;
  knowledgeTraceabilityValid: boolean;
  consultantDecisionsAudited: boolean;
  snapshotsValid: boolean;
  timelineIntegrityValid: boolean;
  auditIssues: string[];
}

// ----------------------------------------------------------------------------
// Module 10: Explainability Validation
// ----------------------------------------------------------------------------
export interface IExplainabilityValidationReport {
  hasEvidenceInAllDecisions: boolean;
  hasReasonInAllDecisions: boolean;
  hasContextInAllDecisions: boolean;
  hasRelationshipsInAllDecisions: boolean;
  hasRuleTriggerInAllDecisions: boolean;
  hasConfidenceExplanationInAllDecisions: boolean;
  hasAuditTrailInAllDecisions: boolean;
  complianceScore: number; // 0 - 100
  missingExplainabilityItems: string[];
}

// ----------------------------------------------------------------------------
// Module 11: Security Validation
// ----------------------------------------------------------------------------
export interface ISecurityValidationReport {
  immutableKnowledgeVerified: boolean;
  immutableReportsVerified: boolean;
  immutableSnapshotsVerified: boolean;
  immutableAuditLogsVerified: boolean;
  permissionBoundariesVerified: boolean;
  roleIsolationVerified: boolean;
  securityVulnerabilitiesCount: number;
  securityIssues: string[];
}

// ----------------------------------------------------------------------------
// Module 12: Dataset Manager
// ----------------------------------------------------------------------------
export interface IDatasetInfo {
  datasetId: string;
  name: string;
  category: 'BLUEPRINT' | 'KNOWLEDGE' | 'REPORT' | 'SCENARIO' | 'REGRESSION' | 'BENCHMARK';
  itemCount: number;
  version: string;
  tags: string[];
}

export interface IDatasetManagerSummary {
  totalDatasets: number;
  datasets: IDatasetInfo[];
}

// ----------------------------------------------------------------------------
// Module 13: Scenario Test
// ----------------------------------------------------------------------------
export interface IScenarioTestResult {
  scenarioName: string;
  status: 'PASS' | 'FAIL';
  executionTimeMs: number;
  findingsCount: number;
  comparisonSummary: string;
}

export interface IScenarioTestReport {
  scenariosTestedCount: number;
  results: IScenarioTestResult[];
}

// ----------------------------------------------------------------------------
// Module 14: Multi Domain Validation
// ----------------------------------------------------------------------------
export interface IMultiDomainValidationReport {
  vastuDomainVerified: boolean;
  lalKitabDomainVerified: boolean;
  numerologyDomainVerified: boolean;
  astrologyDomainVerified: boolean;
  crossDomainConsistency: boolean;
  domainIsolationMaintained: boolean;
  knowledgeLinkageValid: boolean;
  domainIssues: string[];
}

// ----------------------------------------------------------------------------
// Module 15: Load Test
// ----------------------------------------------------------------------------
export interface ILoadTestResult {
  concurrencyLevel: 100 | 500 | 1000 | 5000;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  memoryPeakMb: number;
  scalabilityFactor: number;
}

export interface ILoadTestReport {
  loadTests: ILoadTestResult[];
  maxSupportedConcurrency: number;
}

// ----------------------------------------------------------------------------
// Module 16: Stress Test
// ----------------------------------------------------------------------------
export interface IStressTestCase {
  caseName: string;
  description: string;
  gracefulDegradation: boolean;
  hallucinationDetected: false; // UVF strict requirement: never hallucinate
  handledError: boolean;
}

export interface IStressTestReport {
  casesTestedCount: number;
  passedCasesCount: number;
  hallucinationsCount: 0;
  cases: IStressTestCase[];
}

// ----------------------------------------------------------------------------
// Module 17: Consultant Workflow Validator
// ----------------------------------------------------------------------------
export interface IConsultantWorkflowReport {
  consultationFlowValid: boolean;
  overrideMechanismValid: boolean;
  approvalFlowValid: boolean;
  reportGenerationValid: boolean;
  versionHistoryIntegrity: boolean;
  snapshotsValid: boolean;
  reAnalysisValid: boolean;
  workflowIssues: string[];
}

// ----------------------------------------------------------------------------
// Module 18: Visitor Workflow Validator
// ----------------------------------------------------------------------------
export interface IVisitorWorkflowReport {
  freeVisitorFlowValid: boolean;
  oneTimePaidVisitorFlowValid: boolean;
  premiumVisitorFlowValid: boolean;
  subscriptionVisitorFlowValid: boolean;
  contentRestrictionsEnforced: boolean;
  licensingEnforced: boolean;
  reportRenderingValid: boolean;
  visitorIssues: string[];
}

// ----------------------------------------------------------------------------
// Module 19: Quality Score Engine
// ----------------------------------------------------------------------------
export interface IQualityScoreReport {
  platformQualityScore: number; // 0 - 100
  engineScores: Record<string, number>;
  codeCoveragePercentage: number;
  riskIndex: number; // 0 - 100 (lower is better)
  regressionIndex: number; // 0 - 100 (lower is better)
  performanceIndex: number; // 0 - 100 (higher is better)
  readinessIndex: number; // 0 - 100 (higher is better)
}

// ----------------------------------------------------------------------------
// Module 20: Release Gate Engine
// ----------------------------------------------------------------------------
export interface IReleaseGateDecision {
  isReleaseReady: boolean;
  checks: {
    typeScriptPass: boolean;
    buildPass: boolean;
    unitTestsPass: boolean;
    integrationPass: boolean;
    regressionPass: boolean;
    performancePass: boolean;
    auditPass: boolean;
    securityPass: boolean;
    explainabilityPass: boolean;
    goldenDatasetPass: boolean;
  };
  decisionSummary: string;
  blockers: string[];
}

// ----------------------------------------------------------------------------
// UVF v1.1 Correction 1: Enterprise Test Repository
// ----------------------------------------------------------------------------
export interface ITestCaseExecutionRecord {
  executionId: string;
  timestamp: string;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  durationMs: number;
  errorMessage?: string;
}

export interface ITestCase {
  caseId: string;
  name: string;
  category: 'BLUEPRINT' | 'KNOWLEDGE' | 'REGRESSION' | 'PERFORMANCE' | 'WORKFLOW' | 'SECURITY' | 'GOLDEN_DATASET' | 'SCENARIO';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  input: Record<string, unknown> | string;
  expectedOutput: Record<string, unknown> | string;
  validationMethod: string;
  tags: string[];
  version: string;
  author: string;
  createdDate: string;
  executionHistory: ITestCaseExecutionRecord[];
}

export interface ITestSuite {
  suiteId: string;
  name: string;
  category: string;
  description: string;
  testCaseIds: string[];
}

export interface ITestCollection {
  collectionId: string;
  name: string;
  description: string;
  suiteIds: string[];
}

export interface ITestRegistry {
  registeredSuitesCount: number;
  registeredCasesCount: number;
  registeredCollectionsCount: number;
  isSynchronized: boolean;
}

export interface ITestRepositorySummary {
  totalTestCases: number;
  totalTestSuites: number;
  totalTestCollections: number;
  categoriesBreakdown: Record<string, number>;
  testSuites: ITestSuite[];
  testCases: ITestCase[];
  testCollections: ITestCollection[];
  testRegistry: ITestRegistry;
  runnerResult: {
    executedCount: number;
    passedCount: number;
    failedCount: number;
    durationMs: number;
  };
}

// ----------------------------------------------------------------------------
// UVF v1.1 Correction 2: Golden Dataset Version Manager
// ----------------------------------------------------------------------------
export interface IGoldenDatasetVersionRecord {
  version: string;
  createdAt: string;
  author: string;
  changeLog: string;
  snapshotHash: string;
  isApproved: boolean;
  approvedBy?: string;
}

export interface IGoldenDatasetVersionInfo {
  datasetId: string;
  name: string;
  category: 'BLUEPRINT' | 'KNOWLEDGE' | 'REPORT' | 'RULE' | 'EXPECTED_OUTPUT';
  currentVersion: string;
  versionHistory: IGoldenDatasetVersionRecord[];
  metadata: Record<string, unknown>;
  tags: string[];
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  isApproved: boolean;
  approvedBy?: string;
  canRollback: boolean;
  rollbackTargetVersion?: string;
}

export interface IGoldenDatasetVersionReport {
  totalManagedDatasets: number;
  lockedDatasetsCount: number;
  approvedDatasetsCount: number;
  blueprintVersionsCount: number;
  knowledgeVersionsCount: number;
  reportVersionsCount: number;
  ruleVersionsCount: number;
  expectedOutputVersionsCount: number;
  datasets: IGoldenDatasetVersionInfo[];
  historicalSnapshotsCount: number;
  comparisonSummary: {
    totalDiffsDetected: number;
    alignedDatasetsCount: number;
  };
}

// ----------------------------------------------------------------------------
// UVF v1.1 Correction 3: Continuous Validation Pipeline
// ----------------------------------------------------------------------------
export interface IValidationRunRecord {
  runId: string;
  timestamp: string;
  durationMs: number;
  triggeredBy: 'DEVELOPER' | 'PRE_BUILD' | 'PRE_RELEASE' | 'NIGHTLY' | 'SCHEDULED' | 'REGRESSION' | 'AUTOMATIC_QUEUE';
  branch: string;
  commitId: string;
  buildId: string;
  status: 'PASS' | 'FAIL';
  summary: string;
}

export interface IContinuousValidationReport {
  activeRun: IValidationRunRecord;
  developerValidation: { status: 'PASS' | 'FAIL'; passed: boolean; durationMs: number };
  preBuildValidation: { status: 'PASS' | 'FAIL'; passed: boolean; durationMs: number };
  preReleaseValidation: { status: 'PASS' | 'FAIL'; passed: boolean; durationMs: number };
  nightlyValidation: { status: 'PASS' | 'FAIL'; passed: boolean; durationMs: number };
  scheduledValidation: { status: 'PASS' | 'FAIL'; passed: boolean; durationMs: number };
  regressionValidation: { status: 'PASS' | 'FAIL'; passed: boolean; durationMs: number };
  automaticQueue: Array<{ queueId: string; taskName: string; priority: number; status: 'PENDING' | 'RUNNING' | 'COMPLETED' }>;
  validationHistory: IValidationRunRecord[];
  validationDashboard: {
    totalRuns: number;
    successRatePercentage: number;
    averageDurationMs: number;
    activeQueueLength: number;
    lastSuccessfulRunId: string;
  };
}

// ----------------------------------------------------------------------------
// UVF v1.1 Correction 4: Coverage Analysis Engine
// ----------------------------------------------------------------------------
export interface ICoverageMetric {
  category: 'ENGINE' | 'MODULE' | 'FUNCTION' | 'PIPELINE' | 'RULE' | 'BLUEPRINT' | 'KNOWLEDGE' | 'DATASET' | 'WORKFLOW' | 'REPORT';
  coveredCount: number;
  totalCount: number;
  coveragePercentage: number;
  uncoveredItems: string[];
}

export interface ICoverageHeatmapNode {
  componentName: string;
  category: string;
  coverageScore: number;
  heatLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL_UNCOVERED';
}

export interface ICoverageReport {
  overallCoveragePercentage: number;
  engineCoverage: ICoverageMetric;
  moduleCoverage: ICoverageMetric;
  functionCoverage: ICoverageMetric;
  pipelineCoverage: ICoverageMetric;
  ruleCoverage: ICoverageMetric;
  blueprintCoverage: ICoverageMetric;
  knowledgeCoverage: ICoverageMetric;
  datasetCoverage: ICoverageMetric;
  workflowCoverage: ICoverageMetric;
  reportCoverage: ICoverageMetric;
  uncoveredAreas: Array<{ areaName: string; category: string; description: string }>;
  coverageHeatmaps: ICoverageHeatmapNode[];
}

// ----------------------------------------------------------------------------
// UVF v1.1 Correction 5: Failure Analytics Engine
// ----------------------------------------------------------------------------
export interface IFailureRecord {
  failureId: string;
  rootCause: string;
  engine: string;
  module: string;
  functionName: string;
  blueprint: string;
  knowledgeRecord: string;
  dataset: string;
  scenario: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  probability: number;
  frequency: number;
  regressionLink: string;
  suggestedInvestigation: string;
  historicalOccurrences: number;
  trendAnalysis: string;
}

export interface IFailureAnalyticsReport {
  totalFailures: number;
  activeFailuresCount: number;
  failureDashboard: {
    totalFailuresRecorded: number;
    criticalFailuresCount: number;
    unresolvedCount: number;
    meanTimeToDetectMs: number;
  };
  failureTimeline: Array<{ timestamp: string; failureId: string; engine: string; severity: string; rootCause: string }>;
  failureHeatmap: Array<{ engine: string; failureCount: number; riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' }>;
  topFailures: IFailureRecord[];
  historicalTrends: string[];
}

// ----------------------------------------------------------------------------
// UVF v1.1 Founder Constitution & Architecture Drift
// ----------------------------------------------------------------------------
export interface IFounderBoundaryCheck {
  engineName: string;
  prohibitedResponsibility: string;
  status: 'COMPLIANT' | 'VIOLATION';
  isolationVerified: boolean;
  details: string;
}

export interface IFounderComplianceReport {
  isFounderCompliant: boolean;
  complianceScore: number;
  boundaryChecks: IFounderBoundaryCheck[];
  architectureBoundaryViolations: Array<{ engine: string; violation: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' }>;
  responsibilityViolations: Array<{ engine: string; responsibilityBreached: string }>;
  immutableContractValidation: {
    knowledgeContractsImmutable: boolean;
    reportContractsImmutable: boolean;
    confidenceContractsImmutable: boolean;
    runtimeBehaviorUnchanged: boolean;
  };
}

export interface IArchitectureDriftReport {
  hasArchitecturalDrift: boolean;
  driftScore: number;
  detectedDrifts: Array<{ component: string; driftType: string; description: string; impact: string }>;
  architectureBoundaryHealth: 'PERFECT' | 'MINOR_DRIFT' | 'CRITICAL_DRIFT';
}

// ----------------------------------------------------------------------------
// MAIN OUTPUT CONTRACT: IValidationFrameworkResult
// ----------------------------------------------------------------------------
export interface IValidationFrameworkResult {
  version: '1.1.0-UVF-ENTERPRISE-HARDENED' | '1.0.0-UVF-ENTERPRISE';
  timestamp: string;
  executionSummary: {
    totalDurationMs: number;
    passedSuitesCount: number;
    failedSuitesCount: number;
    overallStatus: 'RELEASE_READY' | 'RELEASE_BLOCKED';
  };
  executionPlan: IExecutionPlan;
  engineResults: IUnitTestResult[];
  pipelineResults: IE2EPipelineResult;
  blueprintValidation: IBlueprintValidationReport;
  goldenOutput: IGoldenOutputResult;
  regressionReport: IRegressionReport;
  contractValidation: IContractValidationResult;
  performanceReport: IPerformanceReport;
  auditReport: IAuditValidationReport;
  explainabilityReport: IExplainabilityValidationReport;
  securityReport: ISecurityValidationReport;
  datasetSummary: IDatasetManagerSummary;
  scenarioReport: IScenarioTestReport;
  multiDomainValidation: IMultiDomainValidationReport;
  loadTestReport: ILoadTestReport;
  stressTestReport: IStressTestReport;
  consultantWorkflowReport: IConsultantWorkflowReport;
  visitorWorkflowReport: IVisitorWorkflowReport;
  qualityScoreReport: IQualityScoreReport;
  releaseDecision: IReleaseGateDecision;

  // Extended UVF v1.1 Hardening Outputs
  testRepositorySummary: ITestRepositorySummary;
  coverageReport: ICoverageReport;
  datasetVersionReport: IGoldenDatasetVersionReport;
  continuousValidationReport: IContinuousValidationReport;
  failureAnalytics: IFailureAnalyticsReport;
  founderComplianceReport: IFounderComplianceReport;
  architectureDriftReport: IArchitectureDriftReport;
}
