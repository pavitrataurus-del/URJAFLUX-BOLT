import React, { useState } from "react";
import { 
  ShieldCheck, 
  Activity, 
  Lock, 
  Database, 
  Terminal, 
  Zap, 
  Server, 
  BookOpen, 
  Award 
} from "lucide-react";
import { ProductionHardeningPanel } from "./ProductionHardeningPanel";
import { HighAvailabilityPanel } from "./HighAvailabilityPanel";
import { SecurityAndCompliancePanel } from "./SecurityAndCompliancePanel";
import { DisasterRecoveryPanel } from "./DisasterRecoveryPanel";
import { ObservabilityPanel } from "./ObservabilityPanel";
import { LoadTestingPanel } from "./LoadTestingPanel";
import { EnterpriseOpsCenterDashboard } from "./EnterpriseOpsCenterDashboard";
import { EnterpriseDocumentationGuide } from "./EnterpriseDocumentationGuide";
import { GaCertificationReportView } from "./GaCertificationReportView";

export const EnterpriseGaWorkspace: React.FC = () => {
  const [activeModule, setActiveModule] = useState<
    "HARDENING" | "HA" | "SECURITY" | "DR" | "OBSERVABILITY" | "STRESS" | "OPS" | "DOCS" | "CERTIFICATION"
  >("HARDENING");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
      {/* Top Navigation Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>URJAFLUX AI OS • GENERAL AVAILABILITY (GA) KERNEL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
            Enterprise GA Operations Workspace
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Production Hardening, High Availability, Security, Compliance, Disaster Recovery, Observability, Stress Testing & GA Certification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GA RELEASE v2.5.0 READY</span>
          </span>
        </div>
      </div>

      {/* Module Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {[
          { id: "HARDENING", label: "Hardening", icon: ShieldCheck },
          { id: "HA", label: "High Availability", icon: Activity },
          { id: "SECURITY", label: "Security & Compliance", icon: Lock },
          { id: "DR", label: "Disaster Recovery", icon: Database },
          { id: "OBSERVABILITY", label: "Observability", icon: Terminal },
          { id: "STRESS", label: "Load Testing", icon: Zap },
          { id: "OPS", label: "Ops & Cost Center", icon: Server },
          { id: "DOCS", label: "Doc Guides", icon: BookOpen },
          { id: "CERTIFICATION", label: "GA Certification", icon: Award }
        ].map(m => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id as any)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500" 
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Module Content View */}
      <div className="pt-2">
        {activeModule === "HARDENING" && <ProductionHardeningPanel />}
        {activeModule === "HA" && <HighAvailabilityPanel />}
        {activeModule === "SECURITY" && <SecurityAndCompliancePanel />}
        {activeModule === "DR" && <DisasterRecoveryPanel />}
        {activeModule === "OBSERVABILITY" && <ObservabilityPanel />}
        {activeModule === "STRESS" && <LoadTestingPanel />}
        {activeModule === "OPS" && <EnterpriseOpsCenterDashboard />}
        {activeModule === "DOCS" && <EnterpriseDocumentationGuide />}
        {activeModule === "CERTIFICATION" && <GaCertificationReportView />}
      </div>
    </div>
  );
};
