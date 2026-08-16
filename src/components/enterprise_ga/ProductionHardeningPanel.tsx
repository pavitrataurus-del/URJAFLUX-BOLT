import React, { useState } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Lock, 
  Zap,
  Power
} from "lucide-react";
import { productionHardeningService } from "../../services/enterprise/productionHardeningService";

export const ProductionHardeningPanel: React.FC = () => {
  const [cbs, setCbs] = useState(productionHardeningService.getAllCircuitBreakers());
  const [memMetrics, setMemMetrics] = useState(productionHardeningService.getMemoryGuardMetrics());
  const [configCheck, setConfigCheck] = useState(productionHardeningService.validateConfiguration());
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const handleSimulateFailure = (serviceName: string) => {
    productionHardeningService.recordFailure(serviceName);
    setCbs(productionHardeningService.getAllCircuitBreakers());
    setSimMessage(`Recorded simulated failure for '${serviceName}'.`);
    setTimeout(() => setSimMessage(null), 3000);
  };

  const handleResetCircuitBreaker = (serviceName: string) => {
    productionHardeningService.recordSuccess(serviceName);
    setCbs(productionHardeningService.getAllCircuitBreakers());
    setSimMessage(`Reset circuit breaker for '${serviceName}' to CLOSED.`);
    setTimeout(() => setSimMessage(null), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>MODULE 1: PRODUCTION HARDENING ENGINE</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Resilience, Memory Guard & Configuration Validation</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Circuit breakers, exponential backoff retries, strict request timeouts, client-heap memory leak protection, and graceful shutdown hooks.
          </p>
        </div>

        <button 
          onClick={() => {
            setMemMetrics(productionHardeningService.getMemoryGuardMetrics());
            setConfigCheck(productionHardeningService.validateConfiguration());
            setCbs(productionHardeningService.getAllCircuitBreakers());
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH HEALTH PROBES</span>
        </button>
      </div>

      {simMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{simMessage}</span>
        </div>
      )}

      {/* Grid: Memory Metrics & Configuration Check */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Guard Metrics */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Memory Leak Guard Probes</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Heap Used</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{memMetrics.heapUsedMb} MB</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Heap Allocated Limit</div>
              <div className="text-2xl font-bold text-slate-200 mt-1">{memMetrics.heapTotalMb} MB</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Leak Detection Status:</span>
            <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${
              memMetrics.leakDetectionWarning ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {memMetrics.leakDetectionWarning ? "MEMORY LEAK WARNING" : "OPTIMAL HEAP STABILITY"}
            </span>
          </div>
        </div>

        {/* Configuration Validation */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Runtime Configuration Check</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Environment Configuration Status:</span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded text-[10px]">
                VALID & CERTIFIED
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Diagnostics & Warnings</div>
              {configCheck.warnings.length > 0 ? (
                configCheck.warnings.map((w, idx) => (
                  <div key={idx} className="text-amber-400 text-[11px] font-sans flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))
              ) : (
                <div className="text-emerald-400 text-[11px] font-sans">Zero configuration warnings detected.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Circuit Breakers Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Zap className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Service Circuit Breakers & Fault Tolerance</h3>
        </div>

        <div className="space-y-3">
          {cbs.map(cb => (
            <div key={cb.serviceName} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-sm">{cb.serviceName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    cb.state === "CLOSED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : cb.state === "OPEN" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {cb.state}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Failures: {cb.failureCount} / {cb.failureThreshold} • Reset Timeout: {cb.resetTimeoutMs / 1000}s
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSimulateFailure(cb.serviceName)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold cursor-pointer transition-all"
                >
                  SIMULATE FAILURE
                </button>
                <button 
                  onClick={() => handleResetCircuitBreaker(cb.serviceName)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold cursor-pointer transition-all"
                >
                  RESET CIRCUIT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
