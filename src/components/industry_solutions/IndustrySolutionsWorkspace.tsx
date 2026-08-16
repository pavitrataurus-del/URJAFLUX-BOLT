import { useState } from "react";
import { 
  Layers, 
  HardHat, 
  Leaf, 
  BrainCircuit, 
  BarChart3, 
  ShoppingBag, 
  Award, 
  Building2 
} from "lucide-react";

import { IndustryFrameworkPanel } from "./IndustryFrameworkPanel";
import { IndustryPacksWorkspace } from "./IndustryPacksWorkspace";
import { EsgSustainabilityPanel } from "./EsgSustainabilityPanel";
import { DomainKnowledgeAndAgentsPanel } from "./DomainKnowledgeAndAgentsPanel";
import { IndustryExecutiveDashboardsPanel } from "./IndustryExecutiveDashboardsPanel";
import { IndustrySolutionMarketplacePanel } from "./IndustrySolutionMarketplacePanel";
import { IndustryCertificationReportView } from "./IndustryCertificationReportView";

export const IndustrySolutionsWorkspace = () => {
  const [activeTab, setActiveTab] = useState<
    "FRAMEWORK" | "PACKS" | "ESG" | "KNOWLEDGE_AGENTS" | "EXECUTIVE" | "MARKETPLACE" | "CERTIFICATION"
  >("FRAMEWORK");

  const tabItems = [
    { id: "FRAMEWORK", label: "Solution Engine (M1)", icon: Layers, badge: "Engine" },
    { id: "PACKS", label: "Industry Packs (M2–M9)", icon: HardHat, badge: "8 Domains" },
    { id: "ESG", label: "ESG Platform (M10)", icon: Leaf, badge: "Scope 1-3" },
    { id: "KNOWLEDGE_AGENTS", label: "Knowledge & AI (M11-12)", icon: BrainCircuit, badge: "5 AI Agents" },
    { id: "EXECUTIVE", label: "Executive Views (M13)", icon: BarChart3, badge: "C-Suite" },
    { id: "MARKETPLACE", label: "Marketplace (M14)", icon: ShoppingBag, badge: "Packs" },
    { id: "CERTIFICATION", label: "Certification (M15)", icon: Award, badge: "Approved" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-mono">
      {/* HEADER BARNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] tracking-wider uppercase">
              URJAFLUX AI OS • ENTERPRISE INDUSTRY SOLUTIONS PLATFORM
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              v3.2.0-GA
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Multi-Industry Solutions & Domain AI Architecture
          </h1>

          <p className="text-xs text-slate-400 font-sans max-w-3xl">
            Modular, zero-code industry solution ecosystem bringing tailored CAD digital twins, domain AI agents, regulatory knowledge packs, and executive dashboards across 9 core verticals without code duplication.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Industry Coverage</span>
            <span className="text-sm font-bold text-amber-400">9 Core Verticals</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Certification Status</span>
            <span className="text-sm font-bold text-emerald-400">100% GO APPROVED</span>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {tabItems.map(item => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 whitespace-nowrap border transition-all cursor-pointer ${
                isSelected 
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xl shadow-amber-500/10 font-bold" 
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-100 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                isSelected ? "bg-slate-950 text-amber-300" : "bg-slate-950 text-slate-400"
              }`}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB WORKSPACE */}
      <div className="transition-all duration-300">
        {activeTab === "FRAMEWORK" && <IndustryFrameworkPanel />}
        {activeTab === "PACKS" && <IndustryPacksWorkspace />}
        {activeTab === "ESG" && <EsgSustainabilityPanel />}
        {activeTab === "KNOWLEDGE_AGENTS" && <DomainKnowledgeAndAgentsPanel />}
        {activeTab === "EXECUTIVE" && <IndustryExecutiveDashboardsPanel />}
        {activeTab === "MARKETPLACE" && <IndustrySolutionMarketplacePanel />}
        {activeTab === "CERTIFICATION" && <IndustryCertificationReportView />}
      </div>
    </div>
  );
};
