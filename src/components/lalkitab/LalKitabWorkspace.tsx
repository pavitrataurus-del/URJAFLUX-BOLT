// src/components/lalkitab/LalKitabWorkspace.tsx
import React, { useState, useEffect } from "react";
import { Client } from "../../types/app";
import { calculateLalKitab, LalKitabResult } from "./lalkitabEngine";

// Sub-panels imports
import ClientOverviewPanel from "./ClientOverviewPanel";
import BirthDetailsPanel from "./BirthDetailsPanel";
import KundliOverviewPanel from "./KundliOverviewPanel";
import PlanetDashboard from "./PlanetDashboard";
import HouseAnalysisPanel from "./HouseAnalysisPanel";
import PlanetStrengthPanel from "./PlanetStrengthPanel";
import MahadashaPanel from "./MahadashaPanel";
import AntardashaPanel from "./AntardashaPanel";
import GocharPanel from "./GocharPanel";
import YogasPanel from "./YogasPanel";
import DoshaPanel from "./DoshaPanel";
import RemediesPanel from "./RemediesPanel";
import GemstonePanel from "./GemstonePanel";
import DonationPanel from "./DonationPanel";
import LifestylePanel from "./LifestylePanel";

// Right console & bottom panels imports
import KnowledgeEvidencePanel from "./KnowledgeEvidencePanel";
import CalculationTracePanel from "./CalculationTracePanel";
import InterpretationPanel from "./InterpretationPanel";
import ExecutionTimeline from "./ExecutionTimeline";
import ReportPreviewPanel from "./ReportPreviewPanel";

import { 
  Compass, 
  Layers, 
  Clock, 
  Move, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  BookOpen,
  Cpu,
  Brain
} from "lucide-react";

interface LalKitabWorkspaceProps {
  clients: Client[];
}

export default function LalKitabWorkspace({ clients }: LalKitabWorkspaceProps) {
  // Safe client identification switching
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"core" | "dashas" | "transits" | "yogas" | "remedies" | "report">("core");
  const [rightPanelTab, setRightPanelTab] = useState<"evidence" | "trace" | "interpretation">("trace");

  useEffect(() => {
    if (clients && clients.length > 0 && !activeClient) {
      setActiveClient(clients[0]);
    }
  }, [clients, activeClient]);

  const handleSelectClient = (id: string) => {
    const match = clients.find(c => c.id === id);
    if (match) {
      setActiveClient(match);
    }
  };

  // Safe fallback client to avoid crashes if no client data is registered in the workspace
  const fallbackClient: Client = {
    id: "fallback-lal-id",
    name: "Pavitra Sharma",
    dob: "1994-11-22",
    birthTime: "14:15",
    birthPlace: "Varanasi, India",
    email: "pavitra@urjaflux.io",
    phone: "+91 98765 43210",
    company: "Urjaflux Solutions",
    occupation: "Chief Architect",
    joinedDate: "2026-01-01",
    status: "Active",
    preferredLanguage: "Hindi",
    maritalStatus: "Single"
  };

  const client = activeClient || fallbackClient;
  const clientList = clients && clients.length > 0 ? clients : [fallbackClient];

  // Resolve Lal Kitab calculations deterministically
  const result = calculateLalKitab(client.dob || "", client.name, client.birthTime || "");

  // Derive active pipeline step for orchestration pipeline
  let pipelineStep = 3; // calculations complete
  if (result) {
    if (activeTab === "remedies") pipelineStep = 4; // interpretation
    if (activeTab === "report") pipelineStep = 5; // report compiled
  }

  return (
    <div className="space-y-6">
      {/* 1. Selection & Identification Header */}
      <ClientOverviewPanel
        client={client}
        clients={clientList}
        onSelectClient={handleSelectClient}
      />

      {/* 2. Birth Coordinates Details */}
      <BirthDetailsPanel client={client} />

      {/* 3. Primary Horizontal Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-white/40 p-1.5 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
        {[
          { id: "core", label: "Tewa & Planets", icon: Layers },
          { id: "dashas", label: "Dasha Timeline", icon: Clock },
          { id: "transits", label: "Gochar Transits", icon: Move },
          { id: "yogas", label: "Yogas & Doshas", icon: Sparkles },
          { id: "remedies", label: "Remedies & Gemstones", icon: ShieldCheck },
          { id: "report", label: "Consultant Report", icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-slate-900 shadow-lg"
                  : "text-slate-400 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Split Screen Master Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Workspace Content Pane (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "core" && (
            <div className="space-y-6">
              <KundliOverviewPanel result={result} />
              <PlanetDashboard result={result} />
              <PlanetStrengthPanel result={result} />
              <HouseAnalysisPanel result={result} />
            </div>
          )}

          {activeTab === "dashas" && (
            <div className="space-y-6">
              <MahadashaPanel result={result} />
              <AntardashaPanel result={result} />
            </div>
          )}

          {activeTab === "transits" && (
            <GocharPanel result={result} />
          )}

          {activeTab === "yogas" && (
            <div className="space-y-6">
              <YogasPanel result={result} />
              <DoshaPanel result={result} />
            </div>
          )}

          {activeTab === "remedies" && (
            <div className="space-y-6">
              <RemediesPanel result={result} />
              <GemstonePanel result={result} />
              <DonationPanel result={result} />
              <LifestylePanel result={result} />
            </div>
          )}

          {activeTab === "report" && (
            <ReportPreviewPanel client={client} />
          )}
        </div>

        {/* Right Panel Side-Console (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Panel Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 border border-slate-200 rounded-lg font-mono text-[10px]">
            {[
              { id: "evidence", label: "Scriptures", icon: BookOpen },
              { id: "trace", label: "Trace Logs", icon: Cpu },
              { id: "interpretation", label: "Wisdom", icon: Brain }
            ].map((panel) => {
              const Icon = panel.icon;
              return (
                <button
                  key={panel.id}
                  onClick={() => setRightPanelTab(panel.id as any)}
                  className={`py-1.5 rounded font-bold transition-all flex items-center justify-center gap-1 ${
                    rightPanelTab === panel.id
                      ? "bg-white border border-slate-200 text-emerald-400"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{panel.label.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-view router */}
          <div>
            {rightPanelTab === "evidence" && <KnowledgeEvidencePanel />}
            {rightPanelTab === "trace" && <CalculationTracePanel result={result} />}
            {rightPanelTab === "interpretation" && <InterpretationPanel result={result} />}
          </div>

        </div>
      </div>

      {/* 5. Bottom Orchestration Pipeline Status */}
      <ExecutionTimeline currentStep={pipelineStep} />
    </div>
  );
}
