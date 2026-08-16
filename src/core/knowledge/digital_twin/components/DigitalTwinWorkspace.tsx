import React, { useState, useEffect, useMemo } from "react";
import { 
  Box, Map, Layers, Network, Activity, Search, Info, Hexagon,
  ZoomIn, ZoomOut, Maximize, Target, MousePointer2, Settings,
  Eye, EyeOff, Lock, Unlock, Database, Cpu, HardDrive
} from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";
const PanelGroup = Group as any;
const PanelResizeHandle = Separator as any;
import { DigitalTwinApi } from "../api/DigitalTwinApi";
import { IDigitalTwin, ITwinObject } from "../models/TwinModels";
import TwinViewer from "./TwinViewer";
import TwinSidebar from "./TwinSidebar";
import TwinPropertiesPanel from "./TwinPropertiesPanel";
import TwinStatusBar from "./TwinStatusBar";

export default function DigitalTwinWorkspace({ projectId, floorId }: { projectId: string, floorId: string }) {
  const [twin, setTwin] = useState<IDigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"dashboard" | "hierarchy" | "layers" | "relationships">("dashboard");
  const [viewState, setViewState] = useState({ zoom: 100, x: 0, y: 0, mode: "pan" });

  useEffect(() => {
    // Generate or fetch twin. For integration, we'll try to fetch, if not found, we generate from empty.
    // DigitalTwinApi doesn't have listTwins by project out of the box in the snippet, we just use a generic ID or load.
    // We will generate a twin if needed.
    const loadTwin = async () => {
      setLoading(true);
      try {
        const api = DigitalTwinApi.getInstance();
        // First try to fetch an existing twin, assuming the standard ID format
        const twinId = `twin_${projectId}_${floorId}`;
        let loaded = await api.getTwin(twinId);
        if (!loaded) {
          loaded = await api.createTwinFromSpatialObjects(projectId, floorId, [], "system");
        }
        setTwin(loaded);
      } catch (err) {
        console.error("Error loading twin:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTwin();
  }, [projectId, floorId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#05080f]">
        <Activity className="w-8 h-8 text-emerald-500 animate-pulse mb-4" />
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Initializing Digital Twin Engine...</p>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#05080f]">
        <p className="text-red-400 font-mono text-sm">Failed to load Digital Twin.</p>
      </div>
    );
  }

  const selectedObject = twin.objects.find(o => o.id === selectedObjectId) || null;

  return (
    <div className="flex flex-col h-full w-full bg-[#05080f] text-slate-200 overflow-hidden font-sans">
      
      {/* WORKSPACE HEADER */}
      <div className="h-12 border-b border-slate-800 bg-[#0a101d] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Hexagon className="w-5 h-5 text-emerald-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide">Enterprise Digital Twin</h2>
            <p className="text-[10px] text-slate-500 font-mono">ID: {twin.id} • V{twin.version.revision}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search rooms, objects..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#05080f] border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
              <Database className="w-3 h-3" /> Spatial OK
            </span>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
              <Activity className="w-3 h-3" /> Live
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          
          {/* LEFT SIDEBAR */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-[#0a101d] border-r border-slate-800 flex flex-col">
            <TwinSidebar 
              twin={twin} 
              activeTab={activeSidebarTab} 
              onTabChange={setActiveSidebarTab}
              selectedObjectId={selectedObjectId}
              onSelectObject={setSelectedObjectId}
              searchQuery={searchQuery}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-emerald-500/50 transition-colors cursor-col-resize" />

          {/* MAIN VIEWER */}
          <Panel minSize={30} className="flex flex-col relative overflow-hidden bg-[#000000]">
            <TwinViewer 
              twin={twin} 
              selectedObjectId={selectedObjectId}
              onSelectObject={setSelectedObjectId}
              viewState={viewState}
              setViewState={setViewState}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-emerald-500/50 transition-colors cursor-col-resize" />

          {/* RIGHT PROPERTIES PANEL */}
          <Panel defaultSize={25} minSize={20} maxSize={35} className="bg-[#0a101d] border-l border-slate-800 flex flex-col">
            <TwinPropertiesPanel twin={twin} selectedObject={selectedObject} />
          </Panel>
        </PanelGroup>
      </div>

      {/* STATUS BAR */}
      <TwinStatusBar twin={twin} viewState={viewState} selectedObject={selectedObject} />
    </div>
  );
}
