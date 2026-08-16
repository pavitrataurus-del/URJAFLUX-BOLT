import { useEffect, useRef } from 'react';
import { metricsCollector } from './MetricsCollector';
import { structuredLogger } from './StructuredLogger';

export class PerformanceProfiler {
  public static markStart(name: string): string {
    const markName = `${name}_start_${Date.now()}`;
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(markName);
    }
    return markName;
  }

  public static markEnd(name: string, startMarkName: string, category: 'CAD_IMPORT' | 'RASTER_VECTOR' | 'RULE_ENGINE' | 'GEMINI_AI' | 'API_LATENCY' | 'RENDER_FPS' | 'MEMORY' | 'SYSTEM' = 'SYSTEM'): number {
    const endMarkName = `${name}_end_${Date.now()}`;
    let durationMs = 0;

    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      try {
        performance.mark(endMarkName);
        const measureName = `${name}_measure`;
        performance.measure(measureName, startMarkName, endMarkName);
        const entries = performance.getEntriesByName(measureName);
        if (entries.length > 0) {
          durationMs = entries[entries.length - 1].duration;
        }
      } catch (e) {
        // Fallback calculation if mark missing
        durationMs = 0;
      }
    }

    metricsCollector.recordMetric(name, category, durationMs);
    if (durationMs > 200) {
      structuredLogger.warn('PerformanceProfiler', `Slow execution detected: ${name} took ${Math.round(durationMs)}ms`, { durationMs, category });
    }

    return durationMs;
  }
}

export function useComponentRenderProfiler(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const duration = performance.now() - startTime.current;
    if (duration > 100) {
      metricsCollector.recordMetric(`Render:${componentName}`, 'SYSTEM', duration, 'WARNING', { renderCount: renderCount.current });
    }
    startTime.current = performance.now();
  });
}
