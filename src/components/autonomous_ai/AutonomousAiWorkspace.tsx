import React, { useState } from "react";
import { 
  Bot, 
  Cpu, 
  ShieldCheck, 
  BrainCircuit, 
  Lock, 
  Layers, 
  Clock, 
  Activity, 
  Award, 
  CheckCircle2, 
  Zap 
} from "lucide-react";
import { AgentRegistryPanel } from "./AgentRegistryPanel";
import { OrchestratorTaskMonitor } from "./OrchestratorTaskMonitor";
import { HumanApprovalCenterPanel } from "./HumanApprovalCenterPanel";
import { AiMemoryExplorerPanel } from "./AiMemoryExplorerPanel";
import { PolicyAndSecurityManager } from "./PolicyAndSecurityManager";
import { ModelRoutingDashboard } from "./ModelRoutingDashboard";
import { AutonomousWorkflowStudio } from "./AutonomousWorkflowStudio";
import { AiObservabilityAndGovernance } from "./AiObservabilityAndGovernance";
import { AutonomousAiCertificationReportView } from "./AutonomousAiCertificationReportView";

export const AutonomousAiWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "AGENTS" | "ORCHESTRATOR" | "APPROVALS" | "MEMORY" | "POLICIES" | "MODEL_ROUTING" | "WORKFLOWS" | "OBSERVABILITY" | "CERTIFICATION"
  >("AGENTS");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Bot className="w-4 h-4" />
            <span>URJAFLUX AI OS • ENTERPRISE AUTONOMOUS AI OPERATING PLATFORM</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
            Autonomous Multi-Agent AI OS
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Explainable, Governable, Auditable, and Human-Supervised Autonomous AI Architecture across 10 Domain-Specialized Agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AUTONOMOUS AI GA v3.0.0 READY</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {[
          { id: "AGENTS", label: "1 & 2. Multi-Agent Registry", icon: Bot },
          { id: "ORCHESTRATOR", label: "1 & 3. Orchestrator & Tasks", icon: Cpu },
          { id: "APPROVALS", label: "4. Human Approval Center", icon: ShieldCheck },
          { id: "MEMORY", label: "5. Tenant AI Memory", icon: BrainCircuit },
          { id: "POLICIES", label: "6 & 13. Policy & Security", icon: Lock },
          { id: "MODEL_ROUTING", label: "7. Model Provider Routing", icon: Layers },
          { id: "WORKFLOWS", label: "8 & 9. Reasoning & Workflows", icon: Zap },
          { id: "OBSERVABILITY", label: "10 & 11. Governance & Observability", icon: Activity },
          { id: "CERTIFICATION", label: "GA Autonomous AI Certification", icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Panel View */}
      <div className="pt-2">
        {activeTab === "AGENTS" && <AgentRegistryPanel />}
        {activeTab === "ORCHESTRATOR" && <OrchestratorTaskMonitor />}
        {activeTab === "APPROVALS" && <HumanApprovalCenterPanel />}
        {activeTab === "MEMORY" && <AiMemoryExplorerPanel />}
        {activeTab === "POLICIES" && <PolicyAndSecurityManager />}
        {activeTab === "MODEL_ROUTING" && <ModelRoutingDashboard />}
        {activeTab === "WORKFLOWS" && <AutonomousWorkflowStudio />}
        {activeTab === "OBSERVABILITY" && <AiObservabilityAndGovernance />}
        {activeTab === "CERTIFICATION" && <AutonomousAiCertificationReportView />}
      </div>
    </div>
  );
};
