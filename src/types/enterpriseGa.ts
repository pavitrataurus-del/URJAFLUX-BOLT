/**
 * URJAFLUX AI OS - Enterprise GA (General Availability) Types & Interfaces
 * Comprehensive type definitions covering Modules 1 through 15:
 * Production Hardening, High Availability, Performance, Scalability, Security,
 * Compliance, Disaster Recovery, Observability, Load Testing, Database Reliability,
 * Release Engineering, Enterprise Operations Center, Cost Optimization,
 * Documentation, and GA Certification.
 */

export type HealthStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "MAINTENANCE";

// Module 1: Production Hardening
export interface CircuitBreakerState {
  serviceName: string;
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failureCount: number;
  failureThreshold: number;
  lastFailureTimestamp?: number;
  resetTimeoutMs: number;
}

export interface TimeoutPolicy {
  endpointName: string;
  timeoutMs: number;
  retryAttempts: number;
  backoffFactor: number;
}

// Module 2: High Availability
export interface ServiceHealthCheck {
  serviceId: string;
  serviceName: string;
  status: HealthStatus;
  liveness: boolean;
  readiness: boolean;
  responseTimeMs: number;
  lastCheckedAt: string;
  details: Record<string, string | number | boolean>;
}

export interface FailoverConfig {
  primaryRegion: string;
  secondaryRegion: string;
  autoFailoverEnabled: boolean;
  healthThresholdSeconds: number;
  activeRegion: string;
}

// Module 3: Performance Optimization
export interface CacheStats {
  cacheName: string;
  hitCount: number;
  missCount: number;
  hitRatioPercent: number;
  sizeBytes: number;
  maxCapacityBytes: number;
}

export interface MemoryGuardMetrics {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  leakDetectionWarning: boolean;
  gcPauseTimeMs: number;
}

// Module 4: Scalability
export interface ConnectionPoolStatus {
  poolName: string;
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
  waitQueueSize: number;
}

export interface QueueWorkerScalingStatus {
  queueName: string;
  pendingJobs: number;
  activeWorkers: number;
  minWorkers: number;
  maxWorkers: number;
  avgJobProcessingTimeMs: number;
}

// Module 5: Security Hardening
export interface RbacPolicy {
  role: "SUPER_ADMIN" | "ENTERPRISE_ADMIN" | "CONSULTANT" | "AUDITOR" | "END_USER";
  permissions: string[];
  mfaRequired: boolean;
  sessionTimeoutMinutes: number;
}

export interface RateLimitPolicy {
  identifier: string;
  maxRequestsPerMinute: number;
  currentRequests: number;
  isThrottled: boolean;
}

// Module 6: Compliance Readiness
export type ComplianceFramework = "ISO27001" | "SOC2_TYPE2" | "OWASP_ASVS" | "DPDP_INDIA" | "GDPR";

export interface ComplianceControl {
  id: string;
  framework: ComplianceFramework;
  controlCode: string;
  name: string;
  description: string;
  inAppStatus: "IMPLEMENTED_IN_APP" | "DEPLOYMENT_DEPENDENCY" | "PARTIAL";
  evidenceSnippet: string;
}

export interface ConsentRecord {
  userId: string;
  purposes: string[];
  grantedAt: string;
  ipAddressHash: string;
  isActive: boolean;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: "EXPORT" | "DELETE" | "RECTIFY";
  requestedAt: string;
  status: "PENDING" | "COMPLETED" | "VERIFYING";
  completionTimestamp?: string;
}

// Module 7: Disaster Recovery & Backup
export interface BackupJobMetadata {
  id: string;
  targetScope: "DATABASE" | "KNOWLEDGE_BASE" | "DIGITAL_TWIN" | "PLATFORM_CONFIG";
  timestamp: string;
  sizeBytes: number;
  checksumSha256: string;
  storageLocation: string;
  isVerified: boolean;
}

export interface DisasterRecoveryRunbook {
  rtoMinutesTarget: number; // Recovery Time Objective
  rpoMinutesTarget: number; // Recovery Point Objective
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    commandOrAction: string;
    responsibleRole: string;
  }[];
}

// Module 8: Observability
export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTimeMs: number;
  durationMs: number;
  statusCode: "OK" | "ERROR";
  attributes: Record<string, string>;
}

export interface SloMetric {
  name: string;
  targetPercent: number;
  currentPercent: number;
  errorBudgetRemainingPercent: number;
  windowDays: number;
}

// Module 9: Load & Stress Testing Framework
export interface StressTestScenarioConfig {
  scenarioId: string;
  name: string;
  concurrentUsers: number;
  cadProjectsCount: number;
  knowledgeDocsCount: number;
  digitalTwinsCount: number;
  targetDurationSeconds: number;
}

export interface StressTestExecutionResult {
  scenarioId: string;
  executedAt: string;
  durationSeconds: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  peakRps: number;
  eventBusSaturationPercent: number;
  queueSaturationPercent: number;
  systemBottlenecks: string[];
}

// Module 10: Database Reliability
export interface DatabaseMigrationRecord {
  version: string;
  filename: string;
  appliedAt: string;
  checksum: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
}

export interface SchemaValidationReport {
  tableName: string;
  totalRows: number;
  indexHealthPercent: number;
  unindexedForeignKeysCount: number;
  orphanedRecordsCount: number;
  isConsistent: boolean;
}

// Module 11: Release Engineering
export interface ReleaseMetadata {
  version: string; // e.g. "v2.5.0-GA"
  buildNumber: string;
  commitHash: string;
  releasedAt: string;
  releaseNotes: string[];
  isGaRelease: boolean;
}

export interface FeatureFlag {
  key: string;
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetRoles?: string[];
}

// Module 12: Enterprise Operations Center
export interface EocServiceSummary {
  serviceName: string;
  category: "CORE" | "CAD" | "KNOWLEDGE" | "TWIN" | "PLUGIN" | "SECURITY";
  status: HealthStatus;
  uptimePercent: number;
  activeRequests: number;
  p95LatencyMs: number;
}

// Module 13: Cost Optimization
export interface ResourceCostEstimate {
  category: "COMPUTE" | "STORAGE" | "AI_TOKENS" | "DATABASE" | "NETWORK";
  monthlyEstimateUsd: number;
  usageMetric: string;
  optimizationRecommendation: string;
}

// Module 14 & 15: Documentation & GA Certification
export interface CertificationChecklist {
  category: "PRODUCTION" | "SECURITY" | "RELIABILITY" | "COMPLIANCE";
  item: string;
  status: "IMPLEMENTED" | "VALIDATED" | "DEPLOYMENT_DEPENDENCY" | "FUTURE_ENHANCEMENT";
  notes: string;
}

export interface GaCertificationReportData {
  releaseVersion: string;
  readinessScorePercent: number;
  goNoGoDecision: "GO" | "NO_GO";
  summary: string;
  createdFiles: string[];
  modifiedFiles: string[];
  checklist: CertificationChecklist[];
  recommendedCloudTopology: string[];
  recommendedMonitoringStack: string[];
  recommendedBackupStrategy: string[];
  gitCommitMessage: string;
}
