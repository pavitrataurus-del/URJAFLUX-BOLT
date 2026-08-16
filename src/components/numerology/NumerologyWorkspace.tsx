// src/components/numerology/NumerologyWorkspace.tsx
import React, { useState, useEffect } from "react";
import { Client } from "../../types/app";
import { calculateNumerology, SystemType } from "./numerologyEngine";
import ClientOverviewPanel from "./ClientOverviewPanel";
import BirthDetailsPanel from "./BirthDetailsPanel";
import CoreNumbersPanel from "./CoreNumbersPanel";
import MasterNumbersPanel from "./MasterNumbersPanel";
import PinnaclesPanel from "./PinnaclesPanel";
import ChallengesPanel from "./ChallengesPanel";
import CyclesPanel from "./CyclesPanel";
import CompatibilityPanel from "./CompatibilityPanel";
import BusinessNameStudio from "./BusinessNameStudio";
import NameSandbox from "./NameSandbox";
import PredictionsPanel from "./PredictionsPanel";
import RemediesPanel from "./RemediesPanel";
import KnowledgeEvidencePanel from "./KnowledgeEvidencePanel";
import CalculationTracePanel from "./CalculationTracePanel";
import InterpretationPanel from "./InterpretationPanel";
import ExecutionTimeline from "./ExecutionTimeline";
import ReportPreviewPanel from "./ReportPreviewPanel";

import { 
  Compass, 
  Activity, 
  Sparkles, 
  Layers, 
  Clock, 
  Users, 
  Briefcase, 
  Shuffle, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  BookOpen,
  Cpu,
  Brain
} from "lucide-react";

interface NumerologyWorkspaceProps {
  clients: Client[];
}

export default function NumerologyWorkspace({ clients }: NumerologyWorkspaceProps) {
  // If no clients loaded, default to safe fallback so the page doesn't crash
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"core" | "cycles" | "business" | "sandbox" | "compatibility" | "predictions" | "remedies" | "report">("core");
  const [rightPanelTab, setRightPanelTab] = useState<"evidence" | "trace" | "interpretation">("trace");
  const [system, setSystem] = useState<SystemType>("Chaldean");

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

  // If no clients exist at all, generate a beautiful mock client
  const fallbackClient: Client = {
    id: "fallback-id",
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

  // Resolve calculations
  const result = calculateNumerology(client.dob, client.name, system);

  // Derive active step for orchestration pipeline
  let pipelineStep = 3; // calculations complete
  if (result) {
    if (activeTab === "remedies") pipelineStep = 4; // interpretation
    if (activeTab === "report") pipelineStep = 5; // compilation
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
          { id: "core", label: "Core Frequencies", icon: Layers },
          { id: "cycles", label: "Pinnacles & Cycles", icon: Clock },
          { id: "business", label: "Business Studio", icon: Briefcase },
          { id: "sandbox", label: "Name Sandbox", icon: Shuffle },
          { id: "compatibility", label: "Compatibility", icon: Users },
          { id: "predictions", label: "Forecast Trends", icon: TrendingUp },
          { id: "remedies", label: "Remedies & Directives", icon: ShieldCheck },
          { id: "report", label: "Professional Report", icon: FileText }
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

      {/* 4. Split Screen Master Layout: Main Workspace Content (Left) + Right Context Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content Pane (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "core" && (
            <div className="space-y-6">
              <CoreNumbersPanel
                result={result}
                system={system}
                onSystemChange={setSystem}
              />
              <MasterNumbersPanel result={result} />
            </div>
          )}

          {activeTab === "cycles" && (
            <div className="space-y-6">
              <PinnaclesPanel result={result} />
              <ChallengesPanel result={result} />
              <CyclesPanel result={result} fullName={client.name} />
            </div>
          )}

          {activeTab === "business" && (
            <BusinessNameStudio client={client} />
          )}

          {activeTab === "sandbox" && (
            <NameSandbox />
          )}

          {activeTab === "compatibility" && (
            <CompatibilityPanel
              client={client}
              clients={clientList}
            />
          )}

          {activeTab === "predictions" && (
            <PredictionsPanel result={result} />
          )}

          {activeTab === "remedies" && (
            <RemediesPanel result={result} />
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

          {/* Right Panel Sub-View Router */}
          <div>
            {rightPanelTab === "evidence" && <KnowledgeEvidencePanel />}
            {rightPanelTab === "trace" && <CalculationTracePanel result={result} />}
            {rightPanelTab === "interpretation" && <InterpretationPanel result={result} />}
          </div>

        </div>
      </div>

      {/* 5. Bottom Orchestration Pipeline status */}
      <ExecutionTimeline currentStep={pipelineStep} />
    </div>
  );
}
