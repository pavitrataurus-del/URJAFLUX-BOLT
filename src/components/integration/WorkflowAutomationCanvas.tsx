// Module 4, 5 & 11: Visual Workflow Automation & Low-Code Canvas UI
import React, { useState } from "react";
import {
  GitBranch,
  Play,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle,
  XCircle,
  FileText,
  Zap,
  Terminal,
  Activity,
  ArrowRight
} from "lucide-react";
import { WorkflowDefinition, WorkflowExecutionLog } from "../../types/integrationPlatform";
import { WorkflowExecutionEngine } from "../../core/integration/WorkflowExecutionEngine";

export const WorkflowAutomationCanvas: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(() =>
    WorkflowExecutionEngine.getWorkflows()
  );
  const [selectedWf, setSelectedWf] = useState<WorkflowDefinition | null>(workflows[0] || null);
  const [executionLog, setExecutionLog] = useState<WorkflowExecutionLog | null>(null);

  const refreshWorkflows = () => {
    const list = WorkflowExecutionEngine.getWorkflows();
    setWorkflows(list);
    if (selectedWf) {
      const updated = list.find(w => w.id === selectedWf.id);
      if (updated) setSelectedWf(updated);
    }
  };

  const handleTestExecuteWorkflow = (wfId: string) => {
    const log = WorkflowExecutionEngine.executeWorkflow(wfId, {
      projectId: "PRJ-CAD-9901",
      complianceScore: 78.2,
      defectType: "BRAHMASTHAN_LOAD_OBSTRUCTION"
    });
    setExecutionLog(log);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 4, 5 & 11
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Low-Code Visual Canvas
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Visual Workflow Engine & Rule Automation
          </h2>
          <p className="text-xs text-slate-300">
            Design event-driven automations, evaluate system triggers, execute node pipelines, and trace debug logs.
          </p>
        </div>

        <button
          onClick={refreshWorkflows}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Workflows
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-600" /> Active Workflows ({workflows.length})
          </h3>

          <div className="space-y-2">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                onClick={() => setSelectedWf(wf)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedWf?.id === wf.id
                    ? "bg-indigo-50/80 border-indigo-400 shadow-sm"
                    : "bg-white border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 truncate">{wf.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {wf.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{wf.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Trigger: {wf.triggerRule || wf.triggerType}</span>
                  <span>Nodes: {wf.nodes.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Workflow Visual Canvas Preview & Debugger */}
        {selectedWf && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedWf.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedWf.id} | Version: v{selectedWf.version}</p>
                </div>

                <button
                  onClick={() => handleTestExecuteWorkflow(selectedWf.id)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Execute & Debug
                </button>
              </div>

              {/* Visual Nodes Chain */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Visual Execution Nodes Flow</h4>
                <div className="flex flex-col md:flex-row items-center gap-3 overflow-x-auto py-3 px-2">
                  {selectedWf.nodes.map((node, idx) => (
                    <React.Fragment key={node.id}>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-sm min-w-[180px] space-y-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase block w-fit">
                          {node.type}
                        </span>
                        <span className="font-bold text-xs text-slate-900 block">{node.label}</span>
                      </div>
                      {idx < selectedWf.nodes.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Execution Log Trace */}
              {executionLog && (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-600" /> Execution Debug Trace Log ({executionLog.durationMs}ms)
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {executionLog.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
                    {executionLog.stepsExecuted.map((step, idx) => (
                      <div key={idx} className="border-b border-slate-800 pb-2 last:border-none">
                        <span className="text-emerald-400 font-bold">[Step {idx + 1}] {step.nodeLabel}</span>
                        <span className="text-slate-500 text-[10px] ml-2">({step.durationMs}ms)</span>
                        <pre className="text-[11px] text-slate-400 mt-1">{JSON.stringify(step.output, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
