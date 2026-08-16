import { IProgressTrackerData } from '../monitoring/ImportProgressTracker';
import { IHealthMetricsData } from '../monitoring/ImportHealthMonitor';
import { IPerformanceMetricsSnapshot } from '../monitoring/ImportPerformanceMetrics';
import { IImportHistoryRecordData } from '../history/ImportHistory';
import { IHistorySummaryData } from '../history/ImportHistoryManager';
import { IQueueStateData } from '../jobs/ImportQueue';
import { IImportEventData } from '../monitoring/ImportEventLogger';
import { IRetryMetricsData } from '../recovery/RetryManager';

export interface IImportDashboardModelData {
  readonly timestamp: number;
  readonly activeImports: readonly IProgressTrackerData[];
  readonly completedImports: readonly IImportHistoryRecordData[];
  readonly failedImports: readonly IImportHistoryRecordData[];
  readonly queueState: IQueueStateData;
  readonly systemHealth: IHealthMetricsData;
  readonly performanceMetrics: IPerformanceMetricsSnapshot;
  readonly historySummary: IHistorySummaryData;
  readonly retryMetrics: IRetryMetricsData;
  readonly recentEvents: readonly IImportEventData[];
}

export class ImportDashboardModel implements IImportDashboardModelData {
  public readonly timestamp: number;
  public readonly activeImports: readonly IProgressTrackerData[];
  public readonly completedImports: readonly IImportHistoryRecordData[];
  public readonly failedImports: readonly IImportHistoryRecordData[];
  public readonly queueState: IQueueStateData;
  public readonly systemHealth: IHealthMetricsData;
  public readonly performanceMetrics: IPerformanceMetricsSnapshot;
  public readonly historySummary: IHistorySummaryData;
  public readonly retryMetrics: IRetryMetricsData;
  public readonly recentEvents: readonly IImportEventData[];

  constructor(data: IImportDashboardModelData) {
    this.timestamp = data.timestamp;
    this.activeImports = Object.freeze([...data.activeImports]);
    this.completedImports = Object.freeze([...data.completedImports]);
    this.failedImports = Object.freeze([...data.failedImports]);
    this.queueState = Object.freeze({ ...data.queueState });
    this.systemHealth = Object.freeze({ ...data.systemHealth });
    this.performanceMetrics = Object.freeze({ ...data.performanceMetrics });
    this.historySummary = Object.freeze({ ...data.historySummary });
    this.retryMetrics = Object.freeze({ ...data.retryMetrics });
    this.recentEvents = Object.freeze([...data.recentEvents]);

    Object.freeze(this);
  }

  public toJSON(): IImportDashboardModelData {
    return {
      timestamp: this.timestamp,
      activeImports: this.activeImports,
      completedImports: this.completedImports,
      failedImports: this.failedImports,
      queueState: this.queueState,
      systemHealth: this.systemHealth,
      performanceMetrics: this.performanceMetrics,
      historySummary: this.historySummary,
      retryMetrics: this.retryMetrics,
      recentEvents: this.recentEvents
    };
  }
}
