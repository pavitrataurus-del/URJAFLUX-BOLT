import { PluginRegistry } from "./PluginRegistry";

export interface PluginMetricsPoint {
  pluginId: string;
  timestamp: string;
  loadTimeMs: number;
  cpuUsagePct: number;
  memoryUsageMb: number;
  apiCallVolume: number;
  failuresCount: number;
}

export class PluginObservability {
  private static instance: PluginObservability | null = null;
  private metricsHistory: PluginMetricsPoint[] = [];

  private constructor() {
    this.seedDefaultMetrics();
  }

  public static getInstance(): PluginObservability {
    if (!PluginObservability.instance) {
      PluginObservability.instance = new PluginObservability();
    }
    return PluginObservability.instance;
  }

  private seedDefaultMetrics() {
    const now = Date.now();
    const registry = PluginRegistry.getInstance();
    const plugins = registry.getPlugins();

    plugins.forEach(p => {
      // Create 5 historical points for each installed plugin
      for (let i = 4; i >= 0; i--) {
        const timeOffset = i * 2 * 60 * 60 * 1000; // 2 hours steps
        this.metricsHistory.push({
          pluginId: p.id,
          timestamp: new Date(now - timeOffset).toISOString(),
          loadTimeMs: Math.floor(Math.random() * 80) + 120,
          cpuUsagePct: +(1 + Math.random() * 4).toFixed(1),
          memoryUsageMb: +(10 + Math.random() * 15).toFixed(1),
          apiCallVolume: Math.floor(Math.random() * 100) + 200 * (4 - i),
          failuresCount: Math.random() > 0.85 ? 1 : 0
        });
      }
    });
  }

  public getHistory(pluginId?: string): PluginMetricsPoint[] {
    if (pluginId) {
      return this.metricsHistory.filter(m => m.pluginId === pluginId);
    }
    return this.metricsHistory;
  }

  public logMetric(pluginId: string, metric: Omit<PluginMetricsPoint, "pluginId" | "timestamp">) {
    this.metricsHistory.push({
      pluginId,
      timestamp: new Date().toISOString(),
      ...metric
    });

    // Cap history length at 500 records
    if (this.metricsHistory.length > 500) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Summarizes complete extensibility telemetry for DOMAIN-016 integration.
   */
  public generateEnterpriseReport() {
    const registry = PluginRegistry.getInstance();
    const plugins = registry.getPlugins();

    const report = plugins.map(p => {
      const history = this.getHistory(p.id);
      const totalCalls = history.reduce((sum, h) => sum + h.apiCallVolume, 0);
      const avgCpu = history.reduce((sum, h) => sum + h.cpuUsagePct, 0) / (history.length || 1);
      const avgMem = history.reduce((sum, h) => sum + h.memoryUsageMb, 0) / (history.length || 1);
      const totalErrors = history.reduce((sum, h) => sum + h.failuresCount, 0);

      return {
        pluginId: p.id,
        name: p.name,
        category: p.category,
        totalCalls,
        avgCpuPct: +avgCpu.toFixed(2),
        avgMemoryMb: +avgMem.toFixed(2),
        totalErrors,
        reliabilityPct: +(((totalCalls - totalErrors) / (totalCalls || 1)) * 100).toFixed(2)
      };
    });

    return report;
  }
}
