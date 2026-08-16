export type SystemHealthStatus = 'EXCELLENT' | 'GOOD' | 'DEGRADED' | 'CRITICAL';

export interface IHealthMetricsData {
  readonly status: SystemHealthStatus;
  readonly cpuUsagePercent: number;
  readonly memoryUsagePercent: number;
  readonly memoryUsedBytes: number;
  readonly memoryTotalBytes: number;
  readonly processingSpeedItemsPerSec: number;
  readonly queueLength: number;
  readonly repositoryLatencyMs: number;
  readonly cacheEfficiencyRatio: number;
  readonly timestamp: number;
}

export class ImportHealthMonitor {
  private static instance: ImportHealthMonitor | null = null;

  private currentCpuUsage = 15.0; // Simulated enterprise baseline
  private currentMemoryUsedBytes = 256 * 1024 * 1024;
  private currentMemoryTotalBytes = 2048 * 1024 * 1024;
  private currentProcessingSpeed = 45.0;
  private currentQueueLength = 0;
  private currentRepoLatencyMs = 8.5;
  private currentCacheHitRatio = 0.94;

  private constructor() {}

  public static getInstance(): ImportHealthMonitor {
    if (!ImportHealthMonitor.instance) {
      ImportHealthMonitor.instance = new ImportHealthMonitor();
    }
    return ImportHealthMonitor.instance;
  }

  public updateTelemetry(data: {
    cpuUsagePercent?: number;
    memoryUsedBytes?: number;
    memoryTotalBytes?: number;
    processingSpeedItemsPerSec?: number;
    queueLength?: number;
    repositoryLatencyMs?: number;
    cacheEfficiencyRatio?: number;
  }): void {
    if (data.cpuUsagePercent !== undefined) this.currentCpuUsage = data.cpuUsagePercent;
    if (data.memoryUsedBytes !== undefined) this.currentMemoryUsedBytes = data.memoryUsedBytes;
    if (data.memoryTotalBytes !== undefined) this.currentMemoryTotalBytes = data.memoryTotalBytes;
    if (data.processingSpeedItemsPerSec !== undefined) this.currentProcessingSpeed = data.processingSpeedItemsPerSec;
    if (data.queueLength !== undefined) this.currentQueueLength = data.queueLength;
    if (data.repositoryLatencyMs !== undefined) this.currentRepoLatencyMs = data.repositoryLatencyMs;
    if (data.cacheEfficiencyRatio !== undefined) this.currentCacheHitRatio = data.cacheEfficiencyRatio;
  }

  public sampleMetrics(): IHealthMetricsData {
    const memPercent = Math.min(
      100,
      Number(((this.currentMemoryUsedBytes / this.currentMemoryTotalBytes) * 100).toFixed(1))
    );

    const status = this.evaluateHealthStatus(
      this.currentCpuUsage,
      memPercent,
      this.currentRepoLatencyMs,
      this.currentQueueLength
    );

    return Object.freeze({
      status,
      cpuUsagePercent: Number(this.currentCpuUsage.toFixed(1)),
      memoryUsagePercent: memPercent,
      memoryUsedBytes: this.currentMemoryUsedBytes,
      memoryTotalBytes: this.currentMemoryTotalBytes,
      processingSpeedItemsPerSec: Number(this.currentProcessingSpeed.toFixed(1)),
      queueLength: this.currentQueueLength,
      repositoryLatencyMs: Number(this.currentRepoLatencyMs.toFixed(1)),
      cacheEfficiencyRatio: Number(this.currentCacheHitRatio.toFixed(2)),
      timestamp: Date.now()
    });
  }

  public getSystemHealth(): SystemHealthStatus {
    return this.sampleMetrics().status;
  }

  private evaluateHealthStatus(
    cpu: number,
    memPercent: number,
    latencyMs: number,
    queueLen: number
  ): SystemHealthStatus {
    if (cpu > 90 || memPercent > 90 || latencyMs > 500) {
      return 'CRITICAL';
    }
    if (cpu > 75 || memPercent > 75 || latencyMs > 200 || queueLen > 50) {
      return 'DEGRADED';
    }
    if (cpu > 50 || memPercent > 50 || latencyMs > 100) {
      return 'GOOD';
    }
    return 'EXCELLENT';
  }
}

export const healthMonitor = ImportHealthMonitor.getInstance();
