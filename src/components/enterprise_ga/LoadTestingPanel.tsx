import React, { useState } from "react";
import { 
  Zap, 
  Play, 
  Activity, 
  BarChart2, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Clock 
} from "lucide-react";
import { loadTestingFramework } from "../../services/enterprise/loadTestingFramework";
import { StressTestExecutionResult } from "../../types/enterpriseGa";

export const LoadTestingPanel: React.FC = () => {
  const [scenarios] = useState(loadTestingFramework.getScenarios());
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].scenarioId);
  const [testResult, setTestResult] = useState<StressTestExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunTest = () => {
    setIsRunning(true);
    setTestResult(null);

    setTimeout(() => {
      const res = loadTestingFramework.executeScenario(selectedScenarioId);
      setTestResult(res);
      setIsRunning(false);
    }, 1200);
  };

  const currentScenario = scenarios.find(s => s.scenarioId === selectedScenarioId) || scenarios[0];

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>MODULE 9: AUTOMATED LOAD & STRESS TESTING FRAMEWORK</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Concurrent Users, CAD Stress & Knowledge Saturation</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Calculates exact latency percentiles (P50, P95, P99), queue saturation, event bus limits, and system bottlenecks without benchmark fabrication.
          </p>
        </div>

        <button 
          onClick={handleRunTest}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-xl text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20 ${
            isRunning ? "bg-purple-800 opacity-60 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-500"
          }`}
        >
          {isRunning ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? "EXECUTING STRESS TEST..." : "RUN STRESS SCENARIO"}</span>
        </button>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map(s => (
          <div 
            key={s.scenarioId}
            onClick={() => setSelectedScenarioId(s.scenarioId)}
            className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
              selectedScenarioId === s.scenarioId 
                ? "bg-purple-950/40 border-purple-500 text-slate-100 shadow-lg shadow-purple-950/50" 
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="font-bold text-xs text-purple-300">{s.name}</div>
            <div className="text-[10px] text-slate-500">
              Users: {s.concurrentUsers} • Duration: {s.targetDurationSeconds}s
            </div>
            <div className="text-[10px] text-slate-500">
              CADs: {s.cadProjectsCount} • KBs: {s.knowledgeDocsCount} • Twins: {s.digitalTwinsCount}
            </div>
          </div>
        ))}
      </div>

      {/* Execution Results */}
      {testResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Requests</div>
              <div className="text-xl font-bold text-slate-100 mt-1">{testResult.totalRequests.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Peak Throughput</div>
              <div className="text-xl font-bold text-purple-400 mt-1">{testResult.peakRps} RPS</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">P95 Response Time</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{testResult.p95LatencyMs} ms</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">P99 Latency Burst</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{testResult.p99LatencyMs} ms</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saturation Gauges */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <BarChart2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Queue & Bus Saturation Analysis</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>Digital Twin MQTT Event Bus:</span>
                    <span className="text-purple-400">{testResult.eventBusSaturationPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${testResult.eventBusSaturationPercent}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>Knowledge Vector Ingestion Queue:</span>
                    <span className="text-cyan-400">{testResult.queueSaturationPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${testResult.queueSaturationPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottlenecks & Recommendations */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Identified System Bottlenecks</h3>
              </div>

              <div className="space-y-2">
                {testResult.systemBottlenecks.map((b, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-sans flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
