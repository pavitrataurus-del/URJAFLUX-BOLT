import { useState } from "react";
import { 
  Bot, 
  BookOpen, 
  ShieldCheck, 
  BrainCircuit, 
  CheckCircle2, 
  Sliders, 
  FileSearch, 
  UserCheck, 
  Layers 
} from "lucide-react";
import { DomainKnowledgePack, DomainAiAgent } from "../../types/industrySolutions";
import { DOMAIN_KNOWLEDGE_PACKS, DOMAIN_AI_AGENTS } from "../../services/industry_solutions/industrySolutionsService";

export const DomainKnowledgeAndAgentsPanel = () => {
  const [activeTab, setActiveTab] = useState<"AGENTS" | "KNOWLEDGE">("AGENTS");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(DOMAIN_AI_AGENTS[0].id);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string>(DOMAIN_KNOWLEDGE_PACKS[0].id);

  const selectedAgent = DOMAIN_AI_AGENTS.find(a => a.id === selectedAgentId) || DOMAIN_AI_AGENTS[0];
  const selectedKnowledge = DOMAIN_KNOWLEDGE_PACKS.find(k => k.id === selectedKnowledgeId) || DOMAIN_KNOWLEDGE_PACKS[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>MODULES 11 & 12 • DOMAIN KNOWLEDGE & SPECIALIZED AI AGENTS</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Vertical AI Orchestration & Regulatory Knowledge Libraries</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-loaded domain knowledge packs coupled with autonomous AI agents specifying permissions, reasoning scope, evidence requirements, and human approval policies.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-slate-800 rounded-xl p-1 bg-slate-950">
          <button
            onClick={() => setActiveTab("AGENTS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "AGENTS"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🤖 Domain AI Agents (M12)
          </button>
          <button
            onClick={() => setActiveTab("KNOWLEDGE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "KNOWLEDGE"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📚 Knowledge Libraries (M11)
          </button>
        </div>
      </div>

      {/* MODULE 12: DOMAIN AI AGENTS VIEW */}
      {activeTab === "AGENTS" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {DOMAIN_AI_AGENTS.map(agent => {
              const isSelected = selectedAgentId === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected 
                      ? "bg-slate-950 border-amber-500 shadow-lg shadow-amber-500/10" 
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] text-amber-400 font-bold block">{agent.industryId}</span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{agent.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold block w-fit">
                    {agent.humanApprovalPolicy}
                  </span>
                </div>
              );
            })}
          </div>

          {/* AGENT DETAIL CARDS */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">{selectedAgent.name}</h3>
                </div>
                <p className="text-slate-400 text-xs font-sans mt-0.5">{selectedAgent.roleTitle}</p>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                Policy: {selectedAgent.humanApprovalPolicy}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Reasoning Scope & Evidence Requirements */}
              <div className="space-y-4 font-sans text-xs">
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-amber-400" />
                    <span>Reasoning Scope</span>
                  </h4>
                  <p className="text-slate-300 text-xs">{selectedAgent.reasoningScope}</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-amber-400" />
                    <span>Evidence Requirements</span>
                  </h4>
                  <p className="text-slate-300 text-xs">{selectedAgent.evidenceRequirements}</p>
                </div>
              </div>

              {/* Capabilities, Permissions & Knowledge Sources */}
              <div className="space-y-4 font-sans text-xs">
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Agent Capabilities</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedAgent.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-200 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Knowledge Sources</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedAgent.knowledgeSources.map((ks, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 text-[10px] font-mono">
                        📖 {ks}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 11: KNOWLEDGE LIBRARIES VIEW */}
      {activeTab === "KNOWLEDGE" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOMAIN_KNOWLEDGE_PACKS.map(kp => (
              <div
                key={kp.id}
                onClick={() => setSelectedKnowledgeId(kp.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  selectedKnowledgeId === kp.id
                    ? "bg-slate-950 border-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-bold">{kp.industryId}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                    {kp.version}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white">{kp.domainName}</h4>
                <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{kp.summary}</p>

                <div className="p-2 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between text-[10px] text-slate-300 font-mono">
                  <span>Topics: <strong className="text-amber-400">{kp.topicCount}</strong></span>
                  <span>Rules: <strong className="text-amber-400">{kp.ruleCount}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* KNOWLEDGE PACK DETAILS */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedKnowledge.domainName}</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">{selectedKnowledge.summary}</p>
              </div>
              <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shrink-0">
                Status: {selectedKnowledge.activeStatus}
              </span>
            </div>

            {selectedKnowledge.externalDataDependency && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs font-sans">
                🌐 <strong>External Dependency:</strong> Requires active feed integration with {selectedKnowledge.externalDataDependency}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
