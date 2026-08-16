import { ImportDashboardModel } from './ImportDashboardModel';
import { healthMonitor } from '../monitoring/ImportHealthMonitor';
import { performanceMetrics } from '../monitoring/ImportPerformanceMetrics';
import { eventLogger } from '../monitoring/ImportEventLogger';
import { historyManager } from '../history/ImportHistoryManager';
import { retryManager } from '../recovery/RetryManager';
import { knowledgePopulationService } from '../services/KnowledgePopulationService';
import { ImportProgressTracker, IProgressTrackerData } from '../monitoring/ImportProgressTracker';

export class ImportDashboardService {
  private static instance: ImportDashboardService | null = null;
  private readonly activeTrackers = new Map<string, ImportProgressTracker>();

  private constructor() {}

  public static getInstance(): ImportDashboardService {
    if (!ImportDashboardService.instance) {
      ImportDashboardService.instance = new ImportDashboardService();
    }
    return ImportDashboardService.instance;
  }

  public registerActiveTracker(tracker: ImportProgressTracker): void {
    this.activeTrackers.set(tracker.importId, tracker);
  }

  public updateActiveTracker(tracker: ImportProgressTracker): void {
    if (this.activeTrackers.has(tracker.importId)) {
      this.activeTrackers.set(tracker.importId, tracker);
    }
  }

  public removeActiveTracker(importId: string): void {
    this.activeTrackers.delete(importId);
  }

  public getDashboardModel(): ImportDashboardModel {
    const queueState = knowledgePopulationService.getQueueState();
    const systemHealth = healthMonitor.sampleMetrics();
    const metricsSnapshot = performanceMetrics.getSnapshot();
    const historySummary = historyManager.getHistorySummary();
    const retryMetrics = retryManager.getRetryMetrics();
    const recentEvents = eventLogger.getRecentEvents(50);

    const activeImports: IProgressTrackerData[] = Array.from(this.activeTrackers.values()).map(
      (t) => t.toJSON()
    );

    const completedHistory = historyManager
      .getHistoryByStatus('SUCCESS')
      .map((r) => r.toJSON());

    const failedHistory = historyManager
      .getHistoryByStatus('FAILED')
      .map((r) => r.toJSON());

    return new ImportDashboardModel({
      timestamp: Date.now(),
      activeImports,
      completedImports: completedHistory,
      failedImports: failedHistory,
      queueState,
      systemHealth,
      performanceMetrics: metricsSnapshot,
      historySummary,
      retryMetrics,
      recentEvents
    });
  }
}

export const dashboardService = ImportDashboardService.getInstance();
