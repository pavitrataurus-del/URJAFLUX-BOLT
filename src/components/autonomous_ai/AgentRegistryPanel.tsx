import React, { useState } from "react";
import { 
  Bot, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Search, 
  Settings, 
  ArrowRight, 
  Database, 
  FileText 
} from "lucide-react";
import { AgentConfig, AgentId } from "../../types/autonomousAi";
import { INITIAL_AGENT_REGISTRY } from "../../services/autonomous_ai/autonomousAiService";

export const AgentRegistryPanel: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>(INITIAL_AGENT_REGISTRY);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(INITIAL_AGENT_REGISTRY[0]);

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Bot className="w-4 h-4" />
            <span>MODULE 2 • MULTI-AGENT PLATFORM & REGISTRY</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">Specialized AI Agent Capability Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">
            10 Domain-Specific Agents with declared permissions, inputs, outputs, capabilities, and health metrics.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search agents or capabilities..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Agent Cards List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredAgents.map(agent => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-bold uppercase">{agent.category}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {agent.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{agent.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">{agent.title}</p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-850 text-[10px] text-slate-400">
                  <span>Health: <strong className="text-emerald-400">{agent.healthScore}%</strong></span>
                  <span>Executions: <strong className="text-white">{agent.totalExecutions.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Details Panel */}
        {selectedAgent && (
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>{selectedAgent.category} • ID: {selectedAgent.id}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedAgent.name}</h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">{selectedAgent.title}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Success Rate</span>
                <span className="text-2xl font-bold text-emerald-400">{selectedAgent.successRate}%</span>
              </div>
            </div>

            {/* Declared Capabilities */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Declared Capabilities</span>
              </h3>

              <div className="space-y-2">
                {selectedAgent.capabilities.map(cap => (
                  <div key={cap.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">{cap.name}</span>
                      <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        Required: {cap.requiredPermission}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{cap.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions & Dependencies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-slate-400 font-bold block text-xs">Granted System Permissions</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedAgent.permissions.map(perm => (
                    <span key={perm} className="px-2 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-slate-400 font-bold block text-xs">Collaborating Dependencies</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedAgent.dependencies.length > 0 ? (
                    selectedAgent.dependencies.map(dep => (
                      <span key={dep} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        {dep}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[11px] font-sans">None (Self-Contained Autonomous Agent)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Inputs & Outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-slate-400 font-bold block text-xs">Accepted Input Specs</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  {selectedAgent.inputs.map(inp => (
                    <li key={inp}>{inp}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-slate-400 font-bold block text-xs">Produced Output Payloads</span>
                <ul className="list-disc list-inside text-emerald-300 space-y-1 text-[11px]">
                  {selectedAgent.outputs.map(out => (
                    <li key={out}>{out}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
