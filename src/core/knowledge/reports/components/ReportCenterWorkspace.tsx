import React, { useState } from "react";
import { FileText, Search, Settings, FileBarChart, History, CheckCircle, BrainCircuit } from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";
import ReportDashboard from "./ReportDashboard";
import ReportBuilder from "./ReportBuilder";
import ReportHistory from "./ReportHistory";
import ReportPreview from "./ReportPreview";

const PanelGroup = Group as any;
const PanelResizeHandle = Separator as any;

export default function ReportCenterWorkspace({ projectId, isAdmin = false }: { projectId: string, isAdmin?: boolean }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "builder" | "history">("dashboard");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#05080f] text-slate-200">
      {/* TOOLBAR */}
      <div className="h-12 border-b border-slate-800 bg-[#0a101d] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-xs">
            <FileText className="w-5 h-5" /> Enterprise Report Center
          </div>
          <div className="h-4 w-px bg-slate-800 mx-2" />
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search reports, templates..." 
              className="pl-8 pr-3 py-1 bg-[#05080f] border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab("builder")}
            className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold hover:bg-blue-500/30 transition-colors"
          >
            CREATE REPORT
          </button>
          <button className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"><Settings className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* LEFT SIDEBAR */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-[#0a101d] border-r border-slate-800 flex flex-col">
            <div className="flex flex-col border-b border-slate-800 p-2 space-y-1">
              <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded ${activeTab === "dashboard" ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"}`}
              >
                <FileBarChart className="w-4 h-4" /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("builder")} 
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded ${activeTab === "builder" ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"}`}
              >
                <Settings className="w-4 h-4" /> Report Builder
              </button>
              <button 
                onClick={() => setActiveTab("history")} 
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded ${activeTab === "history" ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"}`}
              >
                <History className="w-4 h-4" /> History & Approval
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
               {/* Left Context panel content based on tab */}
               <div className="text-xs text-slate-500">
                 {activeTab === "dashboard" && "Overview of report generation activities and queue status."}
                 {activeTab === "builder" && "Configure report parameters, select templates, and customize sections."}
                 {activeTab === "history" && "Review previously generated reports, approve drafts, and manage publish status."}
               </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-blue-500/50 transition-colors cursor-col-resize" />

          {/* MAIN PANEL */}
          <Panel minSize={40} className="flex flex-col bg-[#05080f] relative overflow-hidden">
             {activeTab === "dashboard" && <ReportDashboard projectId={projectId} />}
             {activeTab === "builder" && <ReportBuilder projectId={projectId} onPreview={(id) => { setSelectedReportId(id); }} />}
             {activeTab === "history" && <ReportHistory projectId={projectId} onSelect={(id) => setSelectedReportId(id)} />}
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-blue-500/50 transition-colors cursor-col-resize" />

          {/* RIGHT SIDEBAR - PREVIEW / EXPORT */}
          <Panel defaultSize={30} minSize={25} maxSize={50} className="bg-[#0a101d] border-l border-slate-800 flex flex-col">
            <ReportPreview reportId={selectedReportId} isAdmin={isAdmin} />
          </Panel>
        </PanelGroup>
      </div>

      {/* STATUS BAR */}
      <footer className="h-8 border-t border-slate-800 bg-[#0a101d] flex items-center justify-between px-4 text-[10px] text-slate-500 shrink-0 font-mono uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Report Service Ready
          </div>
          <div>Project: {projectId}</div>
        </div>
        <div className="flex items-center gap-4">
          <span>Pending Approvals: 2</span>
          <span>Exports in Queue: 0</span>
        </div>
      </footer>
    </div>
  );
}
