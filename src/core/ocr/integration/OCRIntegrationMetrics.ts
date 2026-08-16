import { OCRCompatibilityReport } from '../contracts/OCRCompatibilityReport';

export interface IOCRIntegrationMetricsData {
  readonly pipelineId: string;
  readonly documentId: string;
  readonly provider: string;
  readonly totalPipelineTimeMs: number;
  readonly ocrEngineTimeMs: number;
  readonly reconstructionTimeMs: number;
  readonly validationTimeMs: number;
  readonly bridgeTimeMs: number;
  readonly compatibilityScore: number;
  readonly totalPagesProcessed: number;
  readonly totalNodesMapped: number;
  readonly warningsCount: number;
  readonly errorsCount: number;
  readonly success: boolean;
  readonly timestamp: number;
}

export class OCRIntegrationMetrics implements IOCRIntegrationMetricsData {
  public readonly pipelineId: string;
  public readonly documentId: string;
  public readonly provider: string;
  public readonly totalPipelineTimeMs: number;
  public readonly ocrEngineTimeMs: number;
  public readonly reconstructionTimeMs: number;
  public readonly validationTimeMs: number;
  public readonly bridgeTimeMs: number;
  public readonly compatibilityScore: number;
  public readonly totalPagesProcessed: number;
  public readonly totalNodesMapped: number;
  public readonly warningsCount: number;
  public readonly errorsCount: number;
  public readonly success: boolean;
  public readonly timestamp: number;

  constructor(data: {
    pipelineId?: string;
    documentId: string;
    provider?: string;
    totalPipelineTimeMs: number;
    ocrEngineTimeMs?: number;
    reconstructionTimeMs?: number;
    validationTimeMs?: number;
    bridgeTimeMs?: number;
    compatibilityReport?: OCRCompatibilityReport;
    totalPagesProcessed?: number;
    totalNodesMapped?: number;
    errorsCount?: number;
    warningsCount?: number;
    success?: boolean;
  }) {
    this.pipelineId = data.pipelineId || `pipe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.documentId = data.documentId;
    this.provider = data.provider || 'MOCK_ENTERPRISE';
    this.totalPipelineTimeMs = data.totalPipelineTimeMs;
    this.ocrEngineTimeMs = data.ocrEngineTimeMs ?? 0;
    this.reconstructionTimeMs = data.reconstructionTimeMs ?? 0;
    this.validationTimeMs = data.validationTimeMs ?? 0;
    this.bridgeTimeMs = data.bridgeTimeMs ?? 0;

    const report = data.compatibilityReport;
    this.compatibilityScore = report ? report.compatibilityScore : 1.0;
    this.warningsCount = data.warningsCount ?? (report ? report.violations.filter(v => v.severity === 'WARNING').length : 0);
    this.errorsCount = data.errorsCount ?? (report ? report.violations.filter(v => v.severity === 'CRITICAL').length : 0);

    this.totalPagesProcessed = data.totalPagesProcessed ?? 0;
    this.totalNodesMapped = data.totalNodesMapped ?? 0;
    this.success = data.success !== undefined ? data.success : (this.errorsCount === 0);
    this.timestamp = Date.now();

    Object.freeze(this);
  }

  public toJSON(): IOCRIntegrationMetricsData {
    return {
      pipelineId: this.pipelineId,
      documentId: this.documentId,
      provider: this.provider,
      totalPipelineTimeMs: this.totalPipelineTimeMs,
      ocrEngineTimeMs: this.ocrEngineTimeMs,
      reconstructionTimeMs: this.reconstructionTimeMs,
      validationTimeMs: this.validationTimeMs,
      bridgeTimeMs: this.bridgeTimeMs,
      compatibilityScore: this.compatibilityScore,
      totalPagesProcessed: this.totalPagesProcessed,
      totalNodesMapped: this.totalNodesMapped,
      warningsCount: this.warningsCount,
      errorsCount: this.errorsCount,
      success: this.success,
      timestamp: this.timestamp
    };
  }
}
