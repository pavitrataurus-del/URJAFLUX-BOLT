import React, { useState } from "react";
import { 
  Play, 
  RotateCw, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Activity, 
  FileText, 
  AlertTriangle 
} from "lucide-react";
import { ScheduledAiTask, ReasoningPipelineStep } from "../../types/autonomousAi";
import { INITIAL_SCHEDULED_WORKFLOWS, STANDARD_REASONING_PIPELINE } from "../../services/autonomous_ai/autonomousAiService";

export const AutonomousWorkflowStudio: React.FC = () => {
  const [workflows, setWorkflows] = useState<ScheduledAiTask[]>(INITIAL_SCHEDULED_WORKFLOWS);
  const [pipelineSteps, setPipelineSteps] = useState<ReasoningPipelineStep[]>(STANDARD_REASONING_PIPELINE);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeTab, setActiveTab] = useState<"WORKFLOWS" | "PIPELINE">("WORKFLOWS");

  const handleRunPipelineSimulation = () => {
    setIsRunningPipeline(true);
    let stepIndex = 0;

    const interval = setInterval(() => {
      setPipelineSteps(prev => prev.map((s, idx) => {
        if (idx === stepIndex) {
          return { ...s, status: "IN_PROGRESS" };
        } else if (idx < stepIndex) {
          return { ...s, status: "COMPLETED", outputSummary: "Verified successfully" };
        }
        return s;
      }));

      stepIndex++;
      if (stepIndex > pipelineSteps.length) {
        clearInterval(interval);
        setIsRunningPipeline(false);
        setPipelineSteps(prev => prev.map(s => ({ ...s, status: "COMPLETED", outputSummary: "Verified successfully" })));
      }
    }, 400);
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, enabled: !w.enabled };
      }
      return w;
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            <span>MODULE 8 & 9 • REASONING PIPELINE & AUTONOMOUS WORKFLOWS</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">12-Step Reasoning Pipeline & Scheduled Autonomous AI</h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end evidence verification, policy validation, multi-agent collaboration, and scheduled background sweeps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("WORKFLOWS")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === "WORKFLOWS" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Scheduled Workflows</span>
          </button>

          <button
            onClick={() => setActiveTab("PIPELINE")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === "PIPELINE" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>12-Step Pipeline</span>
          </button>
        </div>
      </div>

      {/* SCHEDULED WORKFLOWS TAB */}
      {activeTab === "WORKFLOWS" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map(wf => (
              <div key={wf.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-bold uppercase">{wf.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    wf.enabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
                  }`}>
                    {wf.enabled ? "CRON ACTIVE" : "PAUSED"}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{wf.title}</h4>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-[11px] text-slate-300">
                  <div>Cron Expression: <strong className="text-emerald-400">{wf.cronExpression}</strong></div>
                  <div>Target Agent: <strong className="text-amber-300">{wf.targetAgentId}</strong></div>
                  <div>Next Trigger: <span className="text-slate-400">{wf.nextRunTimestamp}</span></div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 text-[10px]">Last Run: {wf.lastRunTimestamp}</span>
                  <button
                    onClick={() => handleToggleWorkflow(wf.id)}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-[10px]"
                  >
                    {wf.enabled ? "Pause Job" : "Enable Cron"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12-STEP PIPELINE TAB */}
      {activeTab === "PIPELINE" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Full 12-Step Explainable Reasoning Flow</h3>
              <p className="text-xs text-slate-400 font-sans">Simulate step-by-step query execution across intent, context, policy, and evidence.</p>
            </div>

            <button
              disabled={isRunningPipeline}
              onClick={handleRunPipelineSimulation}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunningPipeline ? (
                <RotateCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
              <span>{isRunningPipeline ? "Executing Reasoning Step..." : "Run Pipeline Execution"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pipelineSteps.map(step => (
              <div key={step.stepNumber} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-bold">STEP {step.stepNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    step.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                    step.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse" :
                    "bg-slate-900 text-slate-500"
                  }`}>
                    {step.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-white">{step.stepName}</div>
                <p className="text-[11px] text-slate-400 font-sans">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
