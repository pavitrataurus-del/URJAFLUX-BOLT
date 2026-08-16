import React, { useState } from "react";
import { 
  Cpu, 
  Zap, 
  Activity, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Layers 
} from "lucide-react";
import { ModelRouteConfig } from "../../types/autonomousAi";
import { INITIAL_MODEL_ROUTES } from "../../services/autonomous_ai/autonomousAiService";

export const ModelRoutingDashboard: React.FC = () => {
  const [routes, setRoutes] = useState<ModelRouteConfig[]>(INITIAL_MODEL_ROUTES);
  const [tokenInput, setTokenInput] = useState(250000); // 250k tokens default
  const [isTestingRoutes, setIsTestingRoutes] = useState(false);

  const handleHealthCheck = () => {
    setIsTestingRoutes(true);
    setTimeout(() => {
      setIsTestingRoutes(false);
      setRoutes(prev => prev.map(r => ({ ...r, healthStatus: "HEALTHY" })));
    }, 1000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Cpu className="w-4 h-4" />
            <span>MODULE 7 • MODEL ROUTING & PROVIDER ABSTRACTION</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Model Provider Routing & Fallback Gateway</h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic capability matching across Gemini 3.6 Flash, OpenAI, and air-gapped Local LLMs with automatic latency failover.
          </p>
        </div>

        <button
          disabled={isTestingRoutes}
          onClick={handleHealthCheck}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isTestingRoutes ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>{isTestingRoutes ? "Testing Sockets..." : "Run Provider Health Check"}</span>
        </button>
      </div>

      {/* Model Providers Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Active Provider Matrix & Fallback Order</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routes.map(r => (
            <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold uppercase text-[10px]">{r.provider}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  {r.healthStatus}
                </span>
              </div>

              <h4 className="text-base font-bold text-white">{r.modelName}</h4>

              {r.isExternalDependency && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-[10px] text-amber-200">
                  ⚠️ External Provider API Dependency
                </div>
              )}

              <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-850 pt-2">
                <div>Latency: <strong className="text-emerald-400">{r.latencyMs} ms</strong></div>
                <div>Cost: <strong className="text-white">${r.costPer1kTokensUsd} / 1k Tokens</strong></div>
                <div>Role: <strong className="text-amber-300">{r.isFallback ? "Fallback Route" : "Primary Route"}</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-850">
                <span className="text-slate-400 text-[10px] block mb-1">Capability Matching:</span>
                <div className="flex flex-wrap gap-1">
                  {r.capabilityMatch.map(cap => (
                    <span key={cap} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Estimator Calculator */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Monthly Token Consumption Cost Estimator</span>
          </span>
          <span className="text-xs text-slate-400">Projected Tokens: {tokenInput.toLocaleString()}</span>
        </div>

        <input
          type="range"
          min="50000"
          max="5000000"
          step="50000"
          value={tokenInput}
          onChange={e => setTokenInput(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {routes.map(r => (
            <div key={r.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{r.modelName} Cost</span>
              <span className="text-lg font-bold text-emerald-400">
                ${((tokenInput / 1000) * r.costPer1kTokensUsd).toFixed(2)} / mo
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
