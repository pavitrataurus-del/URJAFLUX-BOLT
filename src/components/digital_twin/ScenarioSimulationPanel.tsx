import React, { useState } from "react";
import { 
  TrendingUp, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  RotateCcw, 
  Layers, 
  ShieldCheck,
  Zap,
  Boxes
} from "lucide-react";
import { simulationEngine } from "../../services/digitalTwin/simulationEngine";
import { SimulationScenario } from "../../types/digitalTwin";

export const ScenarioSimulationPanel: React.FC = () => {
  const scenarios = simulationEngine.getScenarios();
  const [activeScenarioId, setActiveScenarioId] = useState<string>("SIM-SCEN-01");
  const [applyMsg, setApplyMsg] = useState<string | null>(null);

  const activeScenario = simulationEngine.getScenarioById(activeScenarioId);

  const handleApplyToMain = () => {
    if (!activeScenario) return;
    const ok = simulationEngine.applyScenarioToMain(activeScenario.id, "chief.architect@urjaflux.com");
    if (ok) {
      setApplyMsg(`Scenario '${activeScenario.title}' successfully merged and applied to Live Production Twin!`);
      setTimeout(() => setApplyMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>MODULE 6: DIGITAL TWIN SIMULATION ENGINE</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Hypothetical Layout Sandbox & Rule Impact Analysis</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Test hypothetical furniture moves, wall additions, and occupancy load changes without disturbing live operations. Compare Before vs After Vastu and Egress scores.
          </p>
        </div>

        {activeScenario && !activeScenario.isAppliedToMain && (
          <button 
            onClick={handleApplyToMain}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>APPLY SCENARIO TO MAIN TWIN</span>
          </button>
        )}
      </div>

      {applyMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{applyMsg}</span>
        </div>
      )}

      {/* Main Grid: Scenarios Selector & Before vs After Impact Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Saved Scenarios */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Scenarios Queue</h3>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {scenarios.map(scen => (
                <div 
                  key={scen.id} 
                  onClick={() => setActiveScenarioId(scen.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeScenarioId === scen.id 
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-300" 
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{scen.id}</span>
                    {scen.isAppliedToMain && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">
                        MERGED TO MAIN
                      </span>
                    )}
                  </div>
                  <div className="text-slate-100 font-sans font-semibold text-xs mt-1">{scen.title}</div>
                  <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                    <span>Score Delta: +{scen.overallScoreAfter - scen.overallScoreBefore} pts</span>
                    <span>{scen.hypotheticalChanges.length} Mutations</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Active Scenario Impact Report */}
        <div className="lg:col-span-2 space-y-4">
          {activeScenario ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              {/* Header Info */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">{activeScenario.id}</span>
                  <span className="text-[10px] font-mono text-slate-500">Created {new Date(activeScenario.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-base font-mono font-bold text-slate-100 mt-1">{activeScenario.title}</h3>
                <p className="text-xs font-sans text-slate-400 mt-1">{activeScenario.description}</p>
              </div>

              {/* Before vs After Score Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Baseline Score (Before)</div>
                  <div className="text-3xl font-mono font-bold text-slate-300 mt-1">{activeScenario.overallScoreBefore} / 100</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Simulated Score (After)</div>
                  <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">{activeScenario.overallScoreAfter} / 100</div>
                </div>
              </div>

              {/* Rule Impact Evaluations Table */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Rule Impact Evaluations</div>
                <div className="space-y-2 font-mono text-xs">
                  {activeScenario.impactResults.map(rule => (
                    <div key={rule.ruleId} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{rule.ruleName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{rule.beforeStatus} →</span>
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            rule.afterStatus === "PASS" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {rule.afterStatus}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] font-sans text-slate-400">{rule.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center font-mono text-xs text-slate-500 bg-slate-900/90 rounded-2xl border border-slate-800">
              Select a scenario from the queue to inspect impact metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
