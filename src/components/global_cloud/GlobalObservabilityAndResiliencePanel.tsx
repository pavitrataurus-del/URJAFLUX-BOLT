import { useState } from "react";
import { 
  Activity, 
  BarChart3, 
  Zap, 
  ShieldAlert, 
  Sliders, 
  CheckCircle2, 
  Radio, 
  Server, 
  Clock 
} from "lucide-react";
import { SloMetric } from "../../types/globalCloudPlatform";
import { SLO_METRICS } from "../../services/global_cloud/globalCloudService";

export const GlobalObservabilityAndResiliencePanel = () => {
  const [slos, setSlos] = useState<SloMetric[]>(SLO_METRICS);
  const [circuitIsolated, setCircuitIsolated] = useState(false);
  const [circuitMessage, setCircuitMessage] = useState("");

  const handleToggleCircuitIsolation = () => {
    const nextState = !circuitIsolated;
    setCircuitIsolated(nextState);
    if (nextState) {
      setCircuitMessage("Simulated regional fault: Secondary region westeurope circuit isolated. Traffic failed over to us-central1.");
    } else {
      setCircuitMessage("Circuit isolation restored. westeurope re-integrated into global traffic pool.");
    }
    setTimeout(() => setCircuitMessage(""), 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
            <Activity className="w-4 h-4" />
            <span>MODULES 7 & 9 • OBSERVABILITY & RESILIENCE ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Global SLO Error Budget Tracking & Fault Circuit Isolation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SLI/SLO monitoring, distributed trace correlation, error budget health, and multi-region fault isolation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
            SLO TARGET: 99.99% AVERAGE
          </span>
        </div>
      </div>

      {/* SECTION 1: GLOBAL SERVICE LEVEL OBJECTIVES (SLOs) & ERROR BUDGETS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Service Level Objectives & Remaining Error Budgets</span>
          <span className="text-sky-400 font-bold">Module 7 • Global Observability</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slos.map(slo => (
            <div key={slo.serviceName} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">SLO Target: {slo.sloTargetPercentage}%</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  {slo.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">{slo.serviceName}</h4>
                <div className="text-lg font-bold text-sky-400 mt-1">{slo.currentSliPercentage}% SLI</div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-850">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Error Budget Left:</span>
                  <strong className="text-emerald-300">{slo.errorBudgetRemainingPercentage}%</strong>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${slo.errorBudgetRemainingPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: PLATFORM RESILIENCE & CIRCUIT ISOLATION */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              <span>Module 9 • Platform Resilience & Regional Circuit Isolation</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Instantly isolate degraded cloud regions or networks to prevent global cascading failures.
            </p>
          </div>

          <button
            onClick={handleToggleCircuitIsolation}
            className={`px-4 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center gap-2 ${
              circuitIsolated 
                ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-600/30" 
                : "bg-slate-950 hover:bg-slate-900 text-sky-300 border-sky-500/50"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{circuitIsolated ? "Restore Regional Circuit" : "Test Fault Isolation"}</span>
          </button>
        </div>

        {circuitMessage && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs font-sans animate-pulse">
            ⚡ {circuitMessage}
          </div>
        )}

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block font-mono">Fault Containment</span>
            <strong className="text-white">Isolated Fault Domains</strong>
            <p className="text-slate-400 text-[11px] mt-1">Cross-region blast radius limited to individual cloud VPC boundaries.</p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block font-mono">Queue Recovery</span>
            <strong className="text-white">Exponential Backoff & Jitter</strong>
            <p className="text-slate-400 text-[11px] mt-1">Prevents thundering herd problems on API gateway recovery.</p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block font-mono">Graceful Degradation</span>
            <strong className="text-white">Static Fallback Modes</strong>
            <p className="text-slate-400 text-[11px] mt-1">CAD engine switches to cached vector views if live AI pipeline is degraded.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
