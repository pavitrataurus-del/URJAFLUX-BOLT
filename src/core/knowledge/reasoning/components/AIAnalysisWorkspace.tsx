import React, { useState, useEffect } from "react";
import { Activity, BrainCircuit, Search, Database, ListChecks, GitMerge, Settings, Compass } from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { ReasoningApi } from "../api/ReasoningApi";
import { IReasoningContext, IRecommendation, IExpertExecutionResult } from "../models/ReasoningModels";
import { DecisionApi } from "../../decision_trace/api/DecisionApi";

import ReasoningSidebar from "./ReasoningSidebar";
import ReasoningMainPanel from "./ReasoningMainPanel";
import ReasoningPropertiesPanel from "./ReasoningPropertiesPanel";
import ReasoningStatusBar from "./ReasoningStatusBar";

const PanelGroup = Group as any;
const PanelResizeHandle = Separator as any;

export default function AIAnalysisWorkspace({ projectId, isAdmin = false }: { projectId: string, isAdmin?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"history" | "experts" | "reviews">("experts");
  const [activeMainTab, setActiveMainTab] = useState<"dashboard" | "pipeline" | "trace" | "rules">("dashboard");
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);
  
  const [executionResults, setExecutionResults] = useState<IExpertExecutionResult[]>([]);
  const [recommendations, setRecommendations] = useState<IRecommendation[]>([]);

  useEffect(() => {
    // Initial fetch of recommendations
    const loadData = async () => {
      try {
        const api = ReasoningApi.getInstance();
        const recs = await api.getRecommendations(`twin_${projectId}`);
        setRecommendations(recs || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [projectId]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const api = ReasoningApi.getInstance();
      const ctx: IReasoningContext = {
        twinId: `twin_${projectId}`,
        projectId: projectId,
        namespace: "core",
        expertsToExecute: ["spatial_expert", "compliance_expert", "vastu_expert"]
      };
      
      const results = await api.executeExperts(ctx);
      setExecutionResults(results);
      
      const recs = await api.getRecommendations(`twin_${projectId}`);
      setRecommendations(recs || []);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#05080f] text-slate-200 overflow-hidden font-sans">
      
      {/* WORKSPACE HEADER */}
      <div className="h-12 border-b border-slate-800 bg-[#0a101d] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-purple-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide">Enterprise AI Reasoning Console</h2>
            <p className="text-[10px] text-slate-500 font-mono">PROJECT: {projectId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search experts, decisions..." 
              className="pl-8 pr-3 py-1 bg-[#05080f] border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-64"
            />
          </div>
          <button 
            onClick={runAnalysis}
            disabled={loading}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
            {loading ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          
          {/* LEFT SIDEBAR */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-[#0a101d] border-r border-slate-800 flex flex-col">
            <ReasoningSidebar 
              activeTab={activeSidebarTab} 
              onTabChange={setActiveSidebarTab}
              executionResults={executionResults}
              recommendations={recommendations}
              selectedExpertId={selectedExpertId}
              onSelectExpert={setSelectedExpertId}
              isAdmin={isAdmin}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-purple-500/50 transition-colors cursor-col-resize" />

          {/* MAIN VIEWER */}
          <Panel minSize={30} className="flex flex-col relative overflow-hidden bg-[#05080f]">
            <ReasoningMainPanel 
              activeTab={activeMainTab}
              onTabChange={setActiveMainTab}
              executionResults={executionResults}
              recommendations={recommendations}
              loading={loading}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-purple-500/50 transition-colors cursor-col-resize" />

          {/* RIGHT PROPERTIES PANEL */}
          <Panel defaultSize={25} minSize={20} maxSize={35} className="bg-[#0a101d] border-l border-slate-800 flex flex-col">
            <ReasoningPropertiesPanel 
              recommendations={recommendations}
              selectedRecommendationId={selectedRecommendationId}
              onSelectRecommendation={setSelectedRecommendationId}
              isAdmin={isAdmin}
            />
          </Panel>
        </PanelGroup>
      </div>

      {/* STATUS BAR */}
      <ReasoningStatusBar loading={loading} results={executionResults} />
    </div>
  );
}
