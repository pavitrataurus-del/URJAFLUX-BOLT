import React, { useState } from "react";
import { Calculator, Compass, Sparkles, Network } from "lucide-react";
import NumerologyWorkspace from "./numerology/NumerologyWorkspace";
import LalKitabWorkspace from "./lalkitab/LalKitabWorkspace";
import NumerologyLandingPage from "./landing/NumerologyLandingPage";
import LalKitabLandingPage from "./landing/LalKitabLandingPage";
import { AnalyticsWorkspacePage } from "./analytics/AnalyticsWorkspacePage";
import LeadCreationGate from "./LeadCreationGate";
import { Client } from "../types/app";

interface AnalysisHubPageProps {
  clients: Client[];
  onNavigate?: (view: string) => void;
}

export default function AnalysisHubPage({ clients, onNavigate }: AnalysisHubPageProps) {
  const [activeModule, setActiveModule] = useState<"hub" | "numerology" | "lalkitab" | "integrated">("hub");
  const [showLanding, setShowLanding] = useState(true);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateType, setGateType] = useState<"NUMEROLOGY" | "LAL_KITAB" | "VASTU">("NUMEROLOGY");

  const startModule = (mod: "numerology" | "lalkitab" | "integrated") => {
    setActiveModule(mod);
    setShowLanding(true);
  };

  const executeModule = () => {
    if (activeModule === "numerology" || activeModule === "lalkitab") {
      setGateType(activeModule === "numerology" ? "NUMEROLOGY" : "LAL_KITAB");
      setIsGateOpen(true);
    } else {
      setShowLanding(false);
    }
  };

  const handleGateSuccess = (identity: any, property?: any) => {
    setIsGateOpen(false);
    setShowLanding(false);
  };

  if (activeModule === "numerology") {
    if (showLanding) {
      return (
        <NumerologyLandingPage
          onStartAnalysis={executeModule}
          onViewReports={() => { if (onNavigate) onNavigate("reports"); else setActiveModule("hub"); }}
        />
      );
    }
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveModule("hub")} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">← Back to Analysis Hub</button>
        <NumerologyWorkspace clients={clients} />
      </div>
    );
  }

  if (activeModule === "lalkitab") {
    if (showLanding) {
      return (
        <LalKitabLandingPage
          onStartAnalysis={executeModule}
          onViewReports={() => { if (onNavigate) onNavigate("reports"); else setActiveModule("hub"); }}
        />
      );
    }
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveModule("hub")} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">← Back to Analysis Hub</button>
        <LalKitabWorkspace clients={clients} />
      </div>
    );
  }

  if (activeModule === "integrated") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveModule("hub")}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mb-2"
        >
          ← Back to Analysis Hub
        </button>
        <AnalyticsWorkspacePage />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analysis Hub</h1>
        <p className="text-slate-500 mt-2 text-lg">Select an analysis engine to begin consultation.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => startModule("numerology")}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
            <Calculator className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Numerology Studio</h2>
          <p className="text-slate-500 text-sm">Chaldean and Pythagorean vibrational analysis and name correction.</p>
        </button>

        <button
          onClick={() => startModule("lalkitab")}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="w-16 h-16 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lal Kitab Engine</h2>
          <p className="text-slate-500 text-sm">Astrological chart generation, planetary analysis, and practical remedies.</p>
        </button>

        <button
          onClick={() => startModule("integrated")}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
            <Network className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            Enterprise Analytics & BI <Sparkles className="w-4 h-4 text-emerald-500" />
          </h2>
          <p className="text-slate-500 text-sm">Unified analytics dashboards, KPI pipelines, forecasting & decision intelligence.</p>
          <span className="inline-block mt-4 px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded">DOMAIN-016</span>
        </button>
      </div>

      <LeadCreationGate
        isOpen={isGateOpen}
        analysisType={gateType === "NUMEROLOGY" ? "NUMEROLOGY" : "LAL_KITAB"}
        onClose={() => setIsGateOpen(false)}
        onSuccess={handleGateSuccess}
      />
    </div>
  );
}
