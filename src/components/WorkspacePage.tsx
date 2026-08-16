import React, { useState, useRef, useEffect } from "react";
import { Compass, ArrowLeft, Maximize2, Settings, List, Save, Share2 } from "lucide-react";
import { Property, Client, Project } from "../types/app";

// Core docking components
import { DockManager } from "../core/docking/DockManager";
import DockContainer from "./docking/DockContainer";
import { WorkspaceDropdown } from "./docking/DockLayoutManager";

// Workspace sub-modules
import DigitalTwinWorkspace from "../core/knowledge/digital_twin/components/DigitalTwinWorkspace";
import KnowledgeGraphWorkspace from "../core/knowledge/graph/components/KnowledgeGraphWorkspace";
import AIAnalysisWorkspace from "../core/knowledge/reasoning/components/AIAnalysisWorkspace";
import VastuAnalysisWorkspace from "../core/knowledge/vastu/components/VastuAnalysisWorkspace";
import ReportCenterWorkspace from "../core/knowledge/reports/components/ReportCenterWorkspace";

interface WorkspacePageProps {
  properties: Property[];
  clients: Client[];
  activeProperty: Property | null;
  onSetActiveProperty: (p: Property | null) => void;
  onUpdatePropertyOffset: (id: string, offset: number) => void;
  onNavigate?: (view: string) => void;
  projects?: Project[];
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
}

export default function WorkspacePage({
  activeProperty,
  onNavigate,
  projects
}: WorkspacePageProps) {

  const project = projects?.find(p => p.id === activeProperty?.id) || projects?.[0];
  const projectName = project?.name || "Untitled Project";
  const projectCode = project?.code || "P-0000";

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("2D Viewer");
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  const addLog = (msg: string) => {
    setDebugLogs(prev => [...prev.slice(-20), msg]);
  };

  useEffect(() => {
    addLog(`Workspace initialized for ${projectName}`);
  }, [projectName]);

  // Sync debugMode state with DockManager
  useEffect(() => {
    const unsubscribe = DockManager.getInstance().subscribe(() => {
      setIsDebugMode(DockManager.getInstance().getDebugMode());
    });
    return unsubscribe;
  }, []);

  // Sync mode transitions with active workspace tab selections
  useEffect(() => {
    const unsubscribe = DockManager.getInstance().subscribe(() => {
      const currentMode = DockManager.getInstance().getCurrentLayout().selectedMode;
      addLog(`Dock Layout changed Mode: ${currentMode}`);

      if (currentMode === "DRAWING") {
        if (activeWorkspaceTab !== "2D Viewer") {
          setActiveWorkspaceTab("2D Viewer");
        }
      } else if (currentMode === "KNOWLEDGE") {
        if (activeWorkspaceTab !== "3D Digital Twin" && activeWorkspaceTab !== "Knowledge Graph") {
          setActiveWorkspaceTab("3D Digital Twin");
        }
      } else if (currentMode === "REPORT_WRITING") {
        if (activeWorkspaceTab !== "Reports") {
          setActiveWorkspaceTab("Reports");
        }
      } else if (currentMode === "ANALYSIS") {
        if (activeWorkspaceTab !== "Vastu Analysis" && activeWorkspaceTab !== "AI Analysis") {
          setActiveWorkspaceTab("Vastu Analysis");
        }
      }
    });
    return unsubscribe;
  }, [activeWorkspaceTab]);

  const handleTabChange = (tab: string) => {
    setActiveWorkspaceTab(tab);
    addLog(`Switched tab selector to: ${tab}`);
    
    // Automatically match layouts layout with functional mode
    if (tab === "2D Viewer") {
      DockManager.getInstance().switchMode("DRAWING");
    } else if (tab === "3D Digital Twin" || tab === "Knowledge Graph") {
      DockManager.getInstance().switchMode("KNOWLEDGE");
    } else if (tab === "Reports") {
      DockManager.getInstance().switchMode("REPORT_WRITING");
    } else if (tab === "Vastu Analysis" || tab === "AI Analysis") {
      DockManager.getInstance().switchMode("ANALYSIS");
    }
  };

  // Render content in the active center area based on selected tab
  const renderCanvasContent = () => {
    switch (activeWorkspaceTab) {
      case "3D Digital Twin":
        return (
          <div className="w-full h-full overflow-hidden bg-[#040609]">
            <DigitalTwinWorkspace projectId={project?.id || "unknown"} floorId={"default"} />
          </div>
        );
      case "Knowledge Graph":
        return (
          <div className="w-full h-full overflow-hidden bg-[#040609]">
            <KnowledgeGraphWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
          </div>
        );
      case "AI Analysis":
        return (
          <div className="w-full h-full overflow-hidden bg-[#040609]">
            <AIAnalysisWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
          </div>
        );
      case "Vastu Analysis":
        return (
          <div className="w-full h-full overflow-hidden bg-[#040609]">
            <VastuAnalysisWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
          </div>
        );
      case "Reports":
        return (
          <div className="w-full h-full overflow-hidden bg-[#040609]">
            <ReportCenterWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
          </div>
        );
      case "2D Viewer":
      default:
        return null; // Will render interactive vector blueprint inside DockContainer directly
    }
  };

  const isFullscreen = DockManager.getInstance().getFullscreenCanvas();

  return (
    <div className="flex flex-col h-full w-full bg-[#05080f] text-slate-200 overflow-hidden font-sans">
      
      {/* 1. TOP TOOLBAR (Height <= 48px) */}
      {!isFullscreen && (
        <header className="h-10 border-b border-slate-800/80 bg-[#070b14] flex items-center justify-between px-3 shrink-0 z-10 select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate && onNavigate('dashboard')} 
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 transition-colors border border-transparent hover:border-slate-800"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            
            <div className="h-4 w-px bg-slate-800/60" />
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span 
                className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors" 
                onClick={() => onNavigate && onNavigate('projects')}
              >
                PROJECTS
              </span>
              <span className="text-slate-700">/</span>
              <span className="text-slate-400">{projectCode}</span>
              <span className="text-slate-700">/</span>
              <span className="text-emerald-400 font-bold tracking-wider uppercase">{projectName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[9px] bg-[#090f1a] border border-slate-800 rounded px-2 py-0.5 text-slate-400 font-mono shrink-0 uppercase tracking-wider">
              SRE RUNTIME OK
            </div>
            <button className="h-7 px-3 bg-[#0d1424] hover:bg-[#121d34] border border-slate-800 rounded text-[10px] font-bold flex items-center gap-1.5 text-slate-300 transition-colors uppercase font-mono">
              <Share2 className="w-3 h-3 text-slate-400" /> Share
            </button>
            <button className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/20 uppercase font-mono">
              <Save className="w-3 h-3" /> Save Workspace
            </button>
          </div>
        </header>
      )}

      {/* 2. WORKSPACE TOOLBAR (Height <= 48px) - Views Selector and Presets dropdown combined! */}
      {!isFullscreen && (
        <div className="h-10 border-b border-slate-800 bg-[#080d19] flex items-center justify-between px-3 shrink-0 z-10 select-none">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => handleTabChange("2D Viewer")} 
              className={`h-7 px-2.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider font-mono border ${
                activeWorkspaceTab === "2D Viewer" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`}
            >
              2D Canvas
            </button>
            <button 
              onClick={() => handleTabChange("3D Digital Twin")} 
              className={`h-7 px-2.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider font-mono border ${
                activeWorkspaceTab === "3D Digital Twin" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`}
            >
              3D Twin
            </button>
            <button 
              onClick={() => handleTabChange("Knowledge Graph")} 
              className={`h-7 px-2.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider font-mono border ${
                activeWorkspaceTab === "Knowledge Graph" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`}
            >
              Graph
            </button>
            
            <div className="h-4 w-px bg-slate-800/60 mx-1 shrink-0" />
            
            <button 
              onClick={() => handleTabChange("Reports")} 
              className={`h-7 px-2.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider font-mono border ${
                activeWorkspaceTab === "Reports" 
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`}
            >
              Report Studio
            </button>
            <button 
              onClick={() => handleTabChange("Vastu Analysis")} 
              className={`h-7 px-2.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider font-mono border ${
                activeWorkspaceTab === "Vastu Analysis" 
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`}
            >
              Vastu Analysis
            </button>
            <button 
              onClick={() => handleTabChange("AI Analysis")} 
              className={`h-7 px-2.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider font-mono border ${
                activeWorkspaceTab === "AI Analysis" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`}
            >
              AI Reasoning
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <WorkspaceDropdown />
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      <DockContainer 
        canvasContent={renderCanvasContent()} 
        debugLogs={debugLogs}
        addLog={addLog}
        activeWorkspaceTab={activeWorkspaceTab}
      />

      {/* 4. STATUS BAR (Height h-7 = 28px) */}
      <footer className="h-7 border-t border-slate-800/80 bg-[#05080e] flex items-center justify-between px-3 text-[9px] text-slate-500 shrink-0 font-mono uppercase tracking-wider select-none">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ENGINE STANDBY
          </div>
          <div className="shrink-0 text-slate-700">|</div>
          <div className="shrink-0 text-slate-400 truncate">Project: {projectName}</div>
          <div className="shrink-0 text-slate-700">|</div>
          <div className="shrink-0 text-slate-400">UNITS: Metric (m)</div>
          <div className="shrink-0 text-slate-700">|</div>
          <div className="shrink-0 text-slate-400">COORDS: X:35.0, Y:25.0, Z:0.0</div>
          
          {/* Diagnostic Console logs visible only when Debug Mode is toggled on via Workspace dropdown */}
          {isDebugMode && (
            <>
              <div className="shrink-0 text-slate-700">|</div>
              <div className="flex gap-2 overflow-x-auto text-[8px] text-yellow-500 font-bold no-scrollbar max-w-xl">
                {debugLogs.slice(-2).map((log, idx) => (
                  <span key={idx} className="bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800/80 whitespace-nowrap">
                    {log}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 text-slate-500">
          <span>ZONE: BRAHMASTHAN</span>
          <span className="text-slate-700">•</span>
          <span>v2.0-STRE</span>
        </div>
      </footer>
    </div>
  );
}
