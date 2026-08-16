import React, { useState } from "react";
import { 
  Building2, 
  Box, 
  History, 
  FileCode, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Brain, 
  FileText,
  Boxes,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { TwinOverviewDashboard } from "./TwinOverviewDashboard";
import { Spatial3DViewer } from "./Spatial3DViewer";
import { ChangeTrackingPanel } from "./ChangeTrackingPanel";
import { BimInteroperabilityPanel } from "./BimInteroperabilityPanel";
import { ScenarioSimulationPanel } from "./ScenarioSimulationPanel";
import { SpatialAnalyticsPanel } from "./SpatialAnalyticsPanel";
import { IotTimeSeriesPanel } from "./IotTimeSeriesPanel";
import { SpatialAiAssistantPanel } from "./SpatialAiAssistantPanel";
import { DigitalTwinFinalReport } from "./DigitalTwinFinalReport";

export const DigitalTwinWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const tabs = [
    { id: "dashboard", label: "Operations Dashboard", icon: Building2 },
    { id: "3d_viewer", label: "3D Spatial Viewer", icon: Box },
    { id: "change_tracking", label: "Change Tracking & Time Travel", icon: History },
    { id: "bim_interop", label: "BIM & IFC Interop", icon: FileCode },
    { id: "simulation", label: "Scenario Simulation", icon: TrendingUp },
    { id: "analytics", label: "Spatial & Predictive Analytics", icon: PieChart },
    { id: "iot_telemetry", label: "IoT & Time Series Studio", icon: Activity },
    { id: "spatial_ai", label: "Grounded Spatial AI", icon: Brain },
    { id: "final_report", label: "Sprint Completion Report", icon: FileText }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#040711] text-slate-100 min-h-screen">
      {/* Workspace Top Header Navigation */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Boxes className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-mono font-bold text-slate-100 tracking-wider">URJAFLUX DIGITAL TWIN PLATFORM</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ENTERPRISE SPATIAL OS
              </span>
            </div>
            <p className="text-xs font-sans text-slate-400">Continuous 3D Virtual Asset Engine • Real openBIM • IoT Telemetry • Grounded Spatial AI</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-semibold">TWIN STATE: SYNCED</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">15/15 MODULES ACTIVE</span>
        </div>
      </header>

      {/* Workspace Horizontal Tab Navigation Bar */}
      <nav className="px-6 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1 py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Workspace Main Tab View Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "dashboard" && <TwinOverviewDashboard onNavigateToTab={setActiveTab} />}
        {activeTab === "3d_viewer" && <Spatial3DViewer />}
        {activeTab === "change_tracking" && <ChangeTrackingPanel />}
        {activeTab === "bim_interop" && <BimInteroperabilityPanel />}
        {activeTab === "simulation" && <ScenarioSimulationPanel />}
        {activeTab === "analytics" && <SpatialAnalyticsPanel />}
        {activeTab === "iot_telemetry" && <IotTimeSeriesPanel />}
        {activeTab === "spatial_ai" && <SpatialAiAssistantPanel />}
        {activeTab === "final_report" && <DigitalTwinFinalReport />}
      </main>
    </div>
  );
};
