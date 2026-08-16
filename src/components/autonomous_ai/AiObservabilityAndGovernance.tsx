import React, { useState } from "react";
import { 
  Activity, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  Layers 
} from "lucide-react";
import { AgentObservabilityMetrics } from "../../types/autonomousAi";
import { INITIAL_OBSERVABILITY_METRICS } from "../../services/autonomous_ai/autonomousAiService";

export const AiObservabilityAndGovernance: React.FC = () => {
  const [metrics] = useState<AgentObservabilityMetrics>(INITIAL_OBSERVABILITY_METRICS);
  const [activeTab, setActiveTab] = useState<"METRICS" | "REGISTRIES" | "AUDIT_LOGS">("METRICS");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Activity className="w-4 h-4" />
            <span>MODULE 10 & 11 • AI GOVERNANCE & OBSERVABILITY</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Enterprise AI Observability & Governance Console</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time execution telemetry, prompt/model/agent registries, policy violation tracking, and token cost analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("METRICS")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === "METRICS" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab("REGISTRIES")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === "REGISTRIES" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Registries</span>
          </button>

          <button
            onClick={() => setActiveTab("AUDIT_LOGS")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === "AUDIT_LOGS" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Logs</span>
          </button>
        </div>
      </div>

      {/* TELEMETRY TAB */}
      {activeTab === "METRICS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-xs">Total Tasks Executed</span>
              <div className="text-2xl font-bold text-white">{metrics.totalTasksExecuted.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400">Queue Depth: {metrics.activeQueueLength} active</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-xs">Avg Task Execution Time</span>
              <div className="text-2xl font-bold text-emerald-400">{metrics.avgTaskLatencyMs} ms</div>
              <span className="text-[10px] text-slate-500">P99 Latency: 420 ms</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-xs">Avg Approval Latency</span>
              <div className="text-2xl font-bold text-amber-300">{metrics.avgApprovalLatencyMinutes} min</div>
              <span className="text-[10px] text-slate-500">Auto-Escalations: 0</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-xs">Monthly AI Token Cost</span>
              <div className="text-2xl font-bold text-white">${metrics.estimatedMonthlyCostUsd.toFixed(2)}</div>
              <span className="text-[10px] text-emerald-400">142 Policy Violations Prevented</span>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRIES TAB */}
      {activeTab === "REGISTRIES" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-amber-300 font-bold uppercase text-[10px]">AGENT REGISTRY</span>
              <h4 className="text-sm font-bold text-white">10 Specialized Agents Registered</h4>
              <p className="text-slate-400 text-xs font-sans">All agent manifests declared with RBAC permissions and capabilities.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-amber-300 font-bold uppercase text-[10px]">MODEL REGISTRY</span>
              <h4 className="text-sm font-bold text-white">3 Provider Routes Configured</h4>
              <p className="text-slate-400 text-xs font-sans">Gemini 3.6 Flash, OpenAI GPT-4o, Local Mistral 7B.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-amber-300 font-bold uppercase text-[10px]">PROMPT REGISTRY</span>
              <h4 className="text-sm font-bold text-white">24 Versioned System Prompts</h4>
              <p className="text-slate-400 text-xs font-sans">Sanitized against prompt injection and zero PII leakage.</p>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === "AUDIT_LOGS" && (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Immutable Governance Audit Ledger</span>
          </h3>

          <div className="divide-y divide-slate-800 text-slate-300">
            {[
              { id: "AUD-101", time: "2026-07-27 14:30:02", action: "TASK_AWAITING_APPROVAL", agent: "AGENT_DIGITAL_TWIN", notes: "Zone 4 actuator calibration halted by Policy POL-CRITICAL-01" },
              { id: "AUD-100", time: "2026-07-27 10:15:18", action: "TASK_COMPLETED", agent: "AGENT_SPATIAL_ANALYSIS", notes: "Generated Vastu Heat Map with 96% confidence score" }
            ].map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-300">{log.id}</span>
                  <span className="text-emerald-400 font-bold">{log.action}</span>
                  <span className="text-slate-400 font-sans">{log.notes}</span>
                </div>
                <span className="text-slate-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
