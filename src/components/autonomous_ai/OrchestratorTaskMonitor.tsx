import React, { useState } from "react";
import { 
  Play, 
  RotateCw, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  Layers, 
  Plus, 
  FileText, 
  BookOpen, 
  Shield 
} from "lucide-react";
import { AiTask, AgentId, TaskPriority, TaskStatus } from "../../types/autonomousAi";
import { INITIAL_AI_TASKS } from "../../services/autonomous_ai/autonomousAiService";

export const OrchestratorTaskMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<AiTask[]>(INITIAL_AI_TASKS);
  const [selectedTask, setSelectedTask] = useState<AiTask | null>(INITIAL_AI_TASKS[0]);

  // New task form state
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAgent, setNewTaskAgent] = useState<AgentId>("AGENT_SPATIAL_ANALYSIS");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("HIGH");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const createdTask: AiTask = {
      id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: "TENANT-URJA-CORP",
      title: newTaskTitle,
      description: newTaskDesc || "Autonomous analysis and execution task.",
      priority: newTaskPriority,
      status: "QUEUED",
      primaryAgentId: newTaskAgent,
      collaboratingAgentIds: ["AGENT_KNOWLEDGE", "AGENT_COMPLIANCE"],
      riskLevel: newTaskPriority === "CRITICAL" ? "CRITICAL" : "MEDIUM",
      requiresHumanApproval: newTaskPriority === "CRITICAL",
      dependencies: [],
      inputContext: { initiatedBy: "User Admin", query: newTaskTitle },
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toLocaleString(),
      executionLogs: [
        { timestamp: "Just now", stepName: "Orchestrator Ingestion", status: "INFO", message: "Task accepted into priority queue" }
      ]
    };

    setTasks(prev => [createdTask, ...prev]);
    setSelectedTask(createdTask);
    setIsCreatingTask(false);
    setNewTaskTitle("");
    setNewTaskDesc("");

    // Simulate task processing after 1.5s
    setTimeout(() => {
      setTasks(prev => prev.map(t => {
        if (t.id === createdTask.id) {
          if (createdTask.requiresHumanApproval) {
            return {
              ...t,
              status: "AWAITING_APPROVAL",
              approvalRequestId: `APP-${Math.floor(9000 + Math.random() * 900)}`,
              executionLogs: [
                ...t.executionLogs,
                { timestamp: "1s ago", stepName: "Policy Check", status: "WARNING", message: "High Risk detected. Sent to Human Approval Center." }
              ]
            };
          } else {
            return {
              ...t,
              status: "COMPLETED",
              completedAt: new Date().toLocaleString(),
              outputResult: {
                summary: `Successfully completed ${createdTask.title}`,
                explanation: `Synthesized findings using ${createdTask.primaryAgentId}. Verified ground truth against enterprise knowledge base with citations.`,
                citations: ["URJAFLUX Architectural Standard 2026", "Enterprise Governance Rules"],
                confidenceScore: 97,
                artifactsGenerated: ["output_summary.pdf"]
              },
              executionLogs: [
                ...t.executionLogs,
                { timestamp: "1s ago", stepName: "Execution Finished", status: "SUCCESS", message: "Agent collaboration executed with 97% confidence." }
              ]
            };
          }
        }
        return t;
      }));
    }, 1500);
  };

  const handleRetryTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: "RUNNING",
          retryCount: t.retryCount + 1,
          executionLogs: [
            ...t.executionLogs,
            { timestamp: "Just now", stepName: "Retry Ingress", status: "INFO", message: `Initiating retry attempt #${t.retryCount + 1}` }
          ]
        };
      }
      return t;
    }));

    setTimeout(() => {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: "COMPLETED",
            completedAt: new Date().toLocaleString(),
            outputResult: {
              summary: "Task retried successfully",
              explanation: "Execution recovered following orchestrator failover protocol.",
              citations: ["Orchestrator Failover Manual v1.2"],
              confidenceScore: 95
            }
          };
        }
        return t;
      }));
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Cpu className="w-4 h-4" />
            <span>MODULE 1 & 3 • CENTRAL AI ORCHESTRATOR & TASK QUEUE</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">Autonomous Task Scheduling & Execution Monitor</h2>
          <p className="text-xs text-slate-400 mt-1">
            Priority queueing, capability routing, dependency graph evaluation, retry policies, and live execution history.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTask(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New AI Task</span>
        </button>
      </div>

      {/* New Task Dispatch Modal / Form */}
      {isCreatingTask && (
        <form onSubmit={handleCreateTask} className="bg-slate-950 border border-emerald-500/50 p-5 rounded-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <span>Dispatch Task to AI Orchestrator</span>
            <button type="button" onClick={() => setIsCreatingTask(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Automated CAD Vastu Audit for Building B"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Target Primary Agent</label>
              <select
                value={newTaskAgent}
                onChange={e => setNewTaskAgent(e.target.value as AgentId)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="AGENT_SPATIAL_ANALYSIS">Spatial & Cad Analysis Agent</option>
                <option value="AGENT_KNOWLEDGE">Enterprise Knowledge Agent</option>
                <option value="AGENT_COMPLIANCE">Compliance & Safety Agent</option>
                <option value="AGENT_DIGITAL_TWIN">Digital Twin & Sensor Agent</option>
                <option value="AGENT_WORKFLOW_AUTOMATION">Workflow Automation Agent</option>
                <option value="AGENT_REPORT_GENERATION">Report Generation Agent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Description / Input Payload</label>
            <textarea
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              placeholder="Provide context or prompt query..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Priority:</span>
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setNewTaskPriority(p)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                    newTaskPriority === p ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingTask(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Dispatch Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Grid Queue & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Task Queue List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {tasks.map(t => {
            const isSelected = selectedTask?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected 
                    ? "bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">{t.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    t.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                    t.status === "AWAITING_APPROVAL" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                    "bg-slate-800 text-slate-300"
                  }`}>
                    {t.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{t.title}</h4>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                  <span className="text-emerald-400 font-bold">{t.primaryAgentId}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                    {t.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Task Details & Execution Log */}
        {selectedTask && (
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                  <span>TASK ID: {selectedTask.id}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">PRIORITY: {selectedTask.priority}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedTask.title}</h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">{selectedTask.description}</p>
              </div>

              <button
                onClick={() => handleRetryTask(selectedTask.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trigger Retry</span>
              </button>
            </div>

            {/* Output Result Summary (If finished) */}
            {selectedTask.outputResult && (
              <div className="bg-slate-900/90 border border-emerald-500/40 p-5 rounded-2xl space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Synthesized Execution Result</span>
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    Confidence: {selectedTask.outputResult.confidenceScore}%
                  </span>
                </div>

                <p className="text-white font-bold text-sm">{selectedTask.outputResult.summary}</p>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">{selectedTask.outputResult.explanation}</p>

                {/* Citations */}
                {selectedTask.outputResult.citations.length > 0 && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
                    <span className="text-slate-400 font-bold block mb-1">Knowledge Citations:</span>
                    <ul className="list-disc list-inside text-emerald-300 space-y-0.5">
                      {selectedTask.outputResult.citations.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Execution Timeline Logs */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Task Execution Logs & Timeline</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedTask.executionLogs.map((log, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-start gap-3">
                    <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">{log.timestamp}</span>
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">{log.stepName}</span>
                      <p className="text-[11px] text-slate-300 font-sans mt-0.5">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
