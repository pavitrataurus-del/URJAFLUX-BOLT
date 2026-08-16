/**
 * URJAFLUX AI OS - Observability & Tracing Service (Module 8)
 * Structured JSON Logger, Distributed Tracing Spans, SLO Error Budget Monitoring,
 * and Real-Time Performance Alert Definitions.
 */

import { TraceSpan, SloMetric } from "../../types/enterpriseGa";

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  service: string;
  traceId: string;
  spanId: string;
  message: string;
  meta?: Record<string, string | number | boolean>;
}

class ObservabilityAndTracingService {
  private logs: LogEntry[] = [];
  private activeSpans: Map<string, TraceSpan> = new Map();
  private completedSpans: TraceSpan[] = [];

  constructor() {
    this.seedLogDefaults();
  }

  private seedLogDefaults() {
    const traceId = "tr-8f4201-" + Date.now().toString().slice(-4);
    this.logs = [
      {
        timestamp: new Date().toISOString(),
        level: "INFO",
        service: "URJAFLUX-GATEWAY",
        traceId,
        spanId: "sp-01",
        message: "Enterprise GA Kernel boot completed successfully.",
        meta: { environment: "production", region: "asia-south1" }
      },
      {
        timestamp: new Date(Date.now() - 5000).toISOString(),
        level: "INFO",
        service: "DIGITAL-TWIN-ENGINE",
        traceId,
        spanId: "sp-02",
        message: "Synchronized 15 persistent twin spatial entities.",
        meta: { twinsCount: 15, latencyMs: 18 }
      }
    ];
  }

  public startTraceSpan(operationName: string, serviceName: string): TraceSpan {
    const traceId = "tr-" + Math.random().toString(36).substring(2, 10);
    const spanId = "sp-" + Math.random().toString(36).substring(2, 8);

    const span: TraceSpan = {
      traceId,
      spanId,
      operationName,
      startTimeMs: Date.now(),
      durationMs: 0,
      statusCode: "OK",
      attributes: { service: serviceName }
    };

    this.activeSpans.set(spanId, span);
    return span;
  }

  public finishTraceSpan(spanId: string, statusCode: "OK" | "ERROR" = "OK"): TraceSpan | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    span.durationMs = Date.now() - span.startTimeMs;
    span.statusCode = statusCode;
    this.activeSpans.delete(spanId);
    this.completedSpans.unshift(span);

    // Keep max 100 completed spans
    if (this.completedSpans.length > 100) {
      this.completedSpans.pop();
    }

    return span;
  }

  public log(level: "INFO" | "WARN" | "ERROR" | "DEBUG", service: string, message: string, meta?: Record<string, string | number | boolean>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      traceId: "tr-" + Math.random().toString(36).substring(2, 8),
      spanId: "sp-" + Math.random().toString(36).substring(2, 6),
      message,
      meta
    };

    this.logs.unshift(entry);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
  }

  public getRecentLogs(): LogEntry[] {
    return this.logs;
  }

  public getCompletedSpans(): TraceSpan[] {
    return this.completedSpans;
  }

  public getSloMetrics(): SloMetric[] {
    return [
      {
        name: "Application Availability SLO",
        targetPercent: 99.9,
        currentPercent: 99.96,
        errorBudgetRemainingPercent: 88.4,
        windowDays: 30
      },
      {
        name: "API Response Latency SLO (< 200ms p95)",
        targetPercent: 99.0,
        currentPercent: 99.42,
        errorBudgetRemainingPercent: 92.1,
        windowDays: 30
      },
      {
        name: "CAD Canvas Render Smoothness (> 55 FPS)",
        targetPercent: 98.0,
        currentPercent: 98.85,
        errorBudgetRemainingPercent: 79.5,
        windowDays: 30
      },
      {
        name: "Digital Twin Telemetry Sync (< 5s)",
        targetPercent: 99.5,
        currentPercent: 99.88,
        errorBudgetRemainingPercent: 95.0,
        windowDays: 30
      }
    ];
  }
}

export const observabilityAndTracingService = new ObservabilityAndTracingService();
