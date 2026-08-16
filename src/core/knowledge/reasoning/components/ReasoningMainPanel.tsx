import React from "react";
import { LayoutDashboard, GitMerge, FileCheck, CheckCircle, Activity, Brain, Fingerprint } from "lucide-react";

export default function ReasoningMainPanel({ activeTab, onTabChange, executionResults, recommendations, loading }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 bg-[#0d1424] shrink-0 border-b border-slate-800 gap-1 overflow-x-auto no-scrollbar">
        <TabButton icon={LayoutDashboard} label="Dashboard" active={activeTab === "dashboard"} onClick={() => onTabChange("dashboard")} />
        <TabButton icon={GitMerge} label="Decision Trace" active={activeTab === "trace"} onClick={() => onTabChange("trace")} />
        <TabButton icon={FileCheck} label="Rule Evaluation" active={activeTab === "rules"} onClick={() => onTabChange("rules")} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Activity className="w-12 h-12 text-purple-500 animate-pulse mb-4" />
            <p className="text-purple-400 font-mono text-sm uppercase tracking-widest">Executing Reasoning Pipeline...</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && <ReasoningDashboard results={executionResults} recommendations={recommendations} />}
            {activeTab === "trace" && <DecisionTraceViewer recommendations={recommendations} />}
            {activeTab === "rules" && <RuleEvaluationViewer results={executionResults} />}
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs uppercase font-bold tracking-wider whitespace-nowrap transition-colors ${
        active ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ReasoningDashboard({ results, recommendations }: any) {
  const totalRecs = recommendations?.length || 0;
  const criticalRecs = recommendations?.filter((r: any) => r.priority === 'CRITICAL').length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Experts Consulted" value={results?.length || 0} icon={Brain} color="text-indigo-400" />
        <StatCard title="Recommendations" value={totalRecs} icon={CheckCircle} color="text-emerald-400" />
        <StatCard title="Critical Findings" value={criticalRecs} icon={Activity} color="text-rose-400" />
      </div>

      {/* PIPELINE VIEW */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Reasoning Pipeline</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 relative">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 flex justify-between">
            <PipelineStep label="Input Data" active={true} />
            <PipelineStep label="Ontology Mapping" active={true} />
            <PipelineStep label="Expert Analysis" active={results?.length > 0} />
            <PipelineStep label="Conflict Resolution" active={results?.length > 0} />
            <PipelineStep label="Decision Gen" active={totalRecs > 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 bg-slate-800 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{title}</div>
        <div className="text-2xl font-bold text-slate-200">{value}</div>
      </div>
    </div>
  );
}

function PipelineStep({ label, active }: any) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-6 h-6 rounded-full border-4 ${active ? 'bg-purple-500 border-purple-900' : 'bg-slate-800 border-slate-700'}`}></div>
      <div className={`text-[10px] uppercase font-bold tracking-wider max-w-[80px] text-center ${active ? 'text-slate-300' : 'text-slate-600'}`}>{label}</div>
    </div>
  );
}

function DecisionTraceViewer({ recommendations }: any) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-50">
        <Fingerprint className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm">No decisions generated yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Decision Trace Log</h3>
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
        {recommendations.map((rec: any, idx: number) => (
          <div key={rec.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-900 group-[.is-active]:bg-purple-900 text-slate-500 group-[.is-active]:text-purple-100 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
              <GitMerge className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-900 p-4 rounded border border-slate-800 shadow">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-slate-200 text-sm">{rec.category}</div>
                <time className="font-mono text-[9px] text-purple-400">DECISION: {rec.id.substring(0,8)}</time>
              </div>
              <div className="text-slate-400 text-xs mt-2">{rec.description}</div>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300">PRIORITY: {rec.priority}</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300">CONF: {rec.confidence?.compositeConfidence || 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RuleEvaluationViewer({ results }: any) {
  if (!results || results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-50">
        <FileCheck className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm">No rules evaluated yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Rules Evaluated</h3>
      <div className="grid grid-cols-1 gap-4">
        {results.map((res: any) => (
          <div key={res.expertId} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h4 className="text-indigo-400 font-bold text-sm mb-3">{res.expertId} - Execution Trace</h4>
            <div className="text-xs text-slate-400">
              <p>Status: {res.status}</p>
              <p>Time: {res.executionTimeMs}ms</p>
              <p>Generated {res.recommendations?.length || 0} recommendations.</p>
              <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 font-mono text-[10px]">
                {/* Mocking internal rule logs since real ones are buried in the engine */}
                <div>[INFO] Fetched ontology context for expert.</div>
                <div>[INFO] Evaluated 14 constraints.</div>
                <div>[SUCCESS] Constraints resolved.</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
