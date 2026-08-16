import React, { useState } from "react";
import { 
  Activity, 
  Terminal, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Search, 
  Cpu 
} from "lucide-react";
import { observabilityAndTracingService } from "../../services/enterprise/observabilityAndTracingService";

export const ObservabilityPanel: React.FC = () => {
  const [logs, setLogs] = useState(observabilityAndTracingService.getRecentLogs());
  const [slos] = useState(observabilityAndTracingService.getSloMetrics());
  const [completedSpans, setCompletedSpans] = useState(observabilityAndTracingService.getCompletedSpans());
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  const handleSimulateTrace = () => {
    const span = observabilityAndTracingService.startTraceSpan("KNOWLEDGE_VECTOR_SEARCH", "KNOWLEDGE_SERVICE");
    setTimeout(() => {
      observabilityAndTracingService.finishTraceSpan(span.spanId, "OK");
      observabilityAndTracingService.log("INFO", "KNOWLEDGE_SERVICE", `Vector search trace completed in 42ms`, { spanId: span.spanId });
      setLogs([...observabilityAndTracingService.getRecentLogs()]);
      setCompletedSpans([...observabilityAndTracingService.getCompletedSpans()]);
      setNotification(`Executed test trace span '${span.operationName}' (${span.traceId}).`);
      setTimeout(() => setNotification(null), 3000);
    }, 150);
  };

  const filteredLogs = logs.filter(l => filterLevel === "ALL" || l.level === filterLevel);

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>MODULE 8: ENTERPRISE OBSERVABILITY & TRACING</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Structured JSON Logging, Tracing & SLO Error Budgets</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Correlation ID context tracking, distributed OpenTelemetry-compatible span tracing, and real-time error budget burn-rate alerts.
          </p>
        </div>

        <button 
          onClick={handleSimulateTrace}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
        >
          <Play className="w-3.5 h-3.5" />
          <span>TRIGGER TEST TRACE SPAN</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid: SLO Error Budgets & Distributed Tracing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLO Error Budgets */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Service Level Objectives (SLO) Error Budgets</h3>
          </div>

          <div className="space-y-3">
            {slos.map(slo => (
              <div key={slo.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{slo.name}</span>
                  <span className="text-emerald-400 font-bold text-[10px]">
                    {slo.currentPercent}% (Target: {slo.targetPercent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${slo.errorBudgetRemainingPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Error Budget Remaining:</span>
                  <span className="font-bold text-amber-400">{slo.errorBudgetRemainingPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distributed Trace Spans */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Distributed Trace Spans</h3>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {completedSpans.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No completed spans yet. Click 'Trigger Test Trace Span' above.</div>
            ) : (
              completedSpans.map(s => (
                <div key={s.spanId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{s.operationName}</span>
                    <span className="text-emerald-400">{s.durationMs} ms</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Trace ID: {s.traceId} • Span ID: {s.spanId} • Status: {s.statusCode}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Structured JSON Log Viewer */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Structured JSON Telemetry Log Stream</h3>
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "INFO", "WARN", "ERROR"].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  filterLevel === lvl ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-[11px]">
          {filteredLogs.map((l, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`font-bold ${
                  l.level === "INFO" ? "text-cyan-400" : l.level === "WARN" ? "text-amber-400" : "text-rose-400"
                }`}>
                  [{l.level}] {l.service}
                </span>
                <span className="text-[10px] text-slate-500">{new Date(l.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-slate-200">{l.message}</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Trace: {l.traceId} • Span: {l.spanId}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
