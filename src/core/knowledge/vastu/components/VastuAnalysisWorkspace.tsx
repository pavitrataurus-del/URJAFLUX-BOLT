import React, { useState, useEffect } from "react";
import { 
  Activity, Settings, Compass, Search, Target, ShieldAlert,
  BarChart, Layers, HelpCircle, FileText, CheckCircle, BrainCircuit
} from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { ReasoningApi } from "../../reasoning/api/ReasoningApi";
import { DigitalTwinApi } from "../../digital_twin/api/DigitalTwinApi";
import { IDigitalTwin, ITwinObject } from "../../digital_twin/models/TwinModels";
import { IRecommendation } from "../../reasoning/models/ReasoningModels";

import VastuDigitalTwinOverlay from "./VastuDigitalTwinOverlay";
import VastuDashboard from "./VastuDashboard";
import VastuRuleCompliance from "./VastuRuleCompliance";
import VastuPanchTatvaViewer from "./VastuPanchTatvaViewer";
import VastuRoomAnalysis from "./VastuRoomAnalysis";
import VastuExplainabilityPanel from "./VastuExplainabilityPanel";
import VastuScorecard from "./VastuScorecard";

const PanelGroup = Group as any;
const PanelResizeHandle = Separator as any;

export default function VastuAnalysisWorkspace({ projectId, isAdmin = false }: { projectId: string, isAdmin?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [twin, setTwin] = useState<IDigitalTwin | null>(null);
  const [recommendations, setRecommendations] = useState<IRecommendation[]>([]);
  
  const [activeLeftTab, setActiveLeftTab] = useState<"zones" | "rooms" | "tatva">("zones");
  const [activeRightTab, setActiveRightTab] = useState<"compliance" | "issues" | "recommendations" | "explain" | "scorecard">("compliance");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const twinApi = DigitalTwinApi.getInstance();
        const reasoningApi = ReasoningApi.getInstance();
        const twinId = `twin_${projectId}`;
        
        const fetchedTwin = await twinApi.getTwin(twinId);
        setTwin(fetchedTwin);
        
        const recs = await reasoningApi.getRecommendations(twinId);
        setRecommendations(recs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  return (
    <div className="flex flex-col h-full bg-[#05080f] text-slate-200">
      {/* TOOLBAR */}
      <div className="h-12 border-b border-slate-800 bg-[#0a101d] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider text-xs">
            <Compass className="w-5 h-5" /> Enterprise Vastu Analysis
          </div>
          <div className="h-4 w-px bg-slate-800 mx-2" />
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search zones, rooms, issues..." 
              className="pl-8 pr-3 py-1 bg-[#05080f] border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-bold hover:bg-purple-500/30 transition-colors">
            RUN VASTU ANALYSIS
          </button>
          <button className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"><Settings className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* LEFT SIDEBAR */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-[#0a101d] border-r border-slate-800 flex flex-col">
            <div className="flex border-b border-slate-800 shrink-0">
              <button onClick={() => setActiveLeftTab("zones")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${activeLeftTab === "zones" ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" : "text-slate-500 hover:text-slate-300"}`}>Zones</button>
              <button onClick={() => setActiveLeftTab("rooms")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${activeLeftTab === "rooms" ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" : "text-slate-500 hover:text-slate-300"}`}>Rooms</button>
              <button onClick={() => setActiveLeftTab("tatva")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${activeLeftTab === "tatva" ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" : "text-slate-500 hover:text-slate-300"}`}>Tatva</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeLeftTab === "zones" && <VastuDashboard twin={twin} />}
              {activeLeftTab === "rooms" && <VastuRoomAnalysis twin={twin} onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId} />}
              {activeLeftTab === "tatva" && <VastuPanchTatvaViewer twin={twin} />}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-purple-500/50 transition-colors cursor-col-resize" />

          {/* MAIN PANEL */}
          <Panel minSize={30} className="flex flex-col bg-[#05080f] relative overflow-hidden">
            <VastuDigitalTwinOverlay twin={twin} selectedRoomId={selectedRoomId} />
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-purple-500/50 transition-colors cursor-col-resize" />

          {/* RIGHT SIDEBAR */}
          <Panel defaultSize={25} minSize={20} maxSize={40} className="bg-[#0a101d] border-l border-slate-800 flex flex-col">
             <div className="flex border-b border-slate-800 shrink-0 overflow-x-auto">
              <button onClick={() => setActiveRightTab("compliance")} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${activeRightTab === "compliance" ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" : "text-slate-500 hover:text-slate-300"}`}>Compliance</button>
              <button onClick={() => setActiveRightTab("scorecard")} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${activeRightTab === "scorecard" ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" : "text-slate-500 hover:text-slate-300"}`}>Scorecard</button>
              <button onClick={() => setActiveRightTab("recommendations")} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${activeRightTab === "recommendations" ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" : "text-slate-500 hover:text-slate-300"}`}>Recs</button>
              <button onClick={() => setActiveRightTab("explain")} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${activeRightTab === "explain" ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" : "text-slate-500 hover:text-slate-300"}`}>Explain</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeRightTab === "compliance" && <VastuRuleCompliance twin={twin} />}
              {activeRightTab === "scorecard" && <VastuScorecard twin={twin} />}
              {activeRightTab === "recommendations" && <VastuRuleCompliance twin={twin} />} {/* TODO Replace with Recommendation Viewer */}
              {activeRightTab === "explain" && <VastuExplainabilityPanel twin={twin} isAdmin={isAdmin} />}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* STATUS BAR */}
      <footer className="h-8 border-t border-slate-800 bg-[#0a101d] flex items-center justify-between px-4 text-[10px] text-slate-500 shrink-0 font-mono uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Vastu Analysis Ready
          </div>
          <div>Project: {projectId}</div>
          <div>Compliance: 84%</div>
        </div>
        <div className="flex items-center gap-4">
          <span>Rooms: {twin?.objects?.length || 0}</span>
          <span>Issues: 3</span>
          <span>Recs: {recommendations.length}</span>
        </div>
      </footer>
    </div>
  );
}
