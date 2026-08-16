import React from "react";
import { History, Users, UserCheck, Activity, Brain, Clock, ShieldAlert } from "lucide-react";
import { IExpertExecutionResult, IRecommendation } from "../models/ReasoningModels";

export default function ReasoningSidebar({ activeTab, onTabChange, executionResults, recommendations, selectedExpertId, onSelectExpert, isAdmin }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 bg-[#0d1424] shrink-0 border-b border-slate-800 gap-1 overflow-x-auto no-scrollbar">
        <TabButton icon={Users} label="Experts" active={activeTab === "experts"} onClick={() => onTabChange("experts")} />
        <TabButton icon={History} label="History" active={activeTab === "history"} onClick={() => onTabChange("history")} />
        <TabButton icon={UserCheck} label="Reviews" active={activeTab === "reviews"} onClick={() => onTabChange("reviews")} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "experts" && <ExpertOrchestrator results={executionResults} selectedExpertId={selectedExpertId} onSelect={onSelectExpert} />}
        {activeTab === "history" && <SessionHistory />}
        {activeTab === "reviews" && <HumanReviewConsole recommendations={recommendations} isAdmin={isAdmin} />}
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap transition-colors ${
        active ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function ExpertOrchestrator({ results, selectedExpertId, onSelect }: any) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center p-4">
        <Brain className="w-8 h-8 text-slate-600 mb-3 mx-auto opacity-50" />
        <p className="text-xs text-slate-400">No experts executed. Run analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Multi-Expert Collaboration</div>
      <div className="space-y-2">
        {results.map((res: IExpertExecutionResult) => (
          <div 
            key={res.expertId}
            onClick={() => onSelect(res.expertId)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedExpertId === res.expertId 
                ? "bg-purple-500/10 border-purple-500/30 text-purple-100" 
                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs">{res.expertId}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                res.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>{res.status}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {res.executionTimeMs}ms</span>
              <span>Recs: {res.recommendations?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionHistory() {
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Recent Sessions</div>
      <div className="text-center p-4">
        <History className="w-8 h-8 text-slate-600 mb-3 mx-auto opacity-50" />
        <p className="text-xs text-slate-400">History will appear here after analysis.</p>
      </div>
    </div>
  );
}

function HumanReviewConsole({ recommendations, isAdmin }: any) {
  const pending = recommendations.filter((r: IRecommendation) => r.status === "PENDING_REVIEW");

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex justify-between items-center">
        Pending Reviews
        {isAdmin && <span className="text-rose-400 text-[9px] border border-rose-500/30 px-1 rounded">ADMIN</span>}
      </div>
      
      {pending.length === 0 ? (
        <div className="text-center p-4">
          <ShieldAlert className="w-8 h-8 text-slate-600 mb-3 mx-auto opacity-50" />
          <p className="text-xs text-slate-400">No pending reviews.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((rec: IRecommendation) => (
            <div key={rec.id} className="bg-slate-800/50 p-2 border border-slate-700 rounded text-xs">
              <div className="font-bold text-slate-200 truncate">{rec.category}</div>
              <div className="text-slate-400 text-[10px] mt-1 line-clamp-2">{rec.description}</div>
              <div className="mt-2 flex justify-end gap-2">
                <button className="px-2 py-0.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded text-[10px] font-bold">REJECT</button>
                <button className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-[10px] font-bold">APPROVE</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
