import React, { useState } from "react";
import { 
  Code, 
  Terminal, 
  Boxes, 
  Send, 
  BookOpen, 
  ShoppingBag, 
  GitBranch, 
  Award, 
  Layers 
} from "lucide-react";
import { DeveloperDashboardPanel } from "./DeveloperDashboardPanel";
import { SdkAndCliStudio } from "./SdkAndCliStudio";
import { PluginDevelopmentKitPanel } from "./PluginDevelopmentKitPanel";
import { ApiSandboxConsole } from "./ApiSandboxConsole";
import { DocumentationPlatformPanel } from "./DocumentationPlatformPanel";
import { PackageRegistryAndMarketplacePanel } from "./PackageRegistryAndMarketplacePanel";
import { LocalDevAndCicdStudio } from "./LocalDevAndCicdStudio";
import { DeveloperPlatformCertificationReportView } from "./DeveloperPlatformCertificationReportView";

export const DeveloperPlatformWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "PORTAL" | "SDK_CLI" | "PDK" | "SANDBOX" | "DOCS" | "MARKETPLACE" | "LOCAL_CICD" | "CERTIFICATION"
  >("PORTAL");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 font-mono">
      {/* Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Code className="w-4 h-4" />
            <span>URJAFLUX PLATFORM • ENTERPRISE DEVELOPER PLATFORM</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
            Developer Ecosystem & SDK Platform
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Empower partners, integrators, and developers to safely build, test, package, publish, and deploy extensions for UrjaFlux.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DEVEX PLATFORM v3.2.0-GA READY</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {[
          { id: "PORTAL", label: "1. Developer Portal", icon: Code },
          { id: "SDK_CLI", label: "2 & 3. SDKs & CLI Studio", icon: Terminal },
          { id: "PDK", label: "4. Plugin PDK Sandbox", icon: Boxes },
          { id: "SANDBOX", label: "5. API Sandbox Console", icon: Send },
          { id: "DOCS", label: "6. Documentation Hub", icon: BookOpen },
          { id: "MARKETPLACE", label: "7 & 8. Registry & Marketplace", icon: ShoppingBag },
          { id: "LOCAL_CICD", label: "9-14. CI/CD & Dev Support", icon: GitBranch },
          { id: "CERTIFICATION", label: "GA DevEx Certification", icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "PORTAL" && <DeveloperDashboardPanel />}
        {activeTab === "SDK_CLI" && <SdkAndCliStudio />}
        {activeTab === "PDK" && <PluginDevelopmentKitPanel />}
        {activeTab === "SANDBOX" && <ApiSandboxConsole />}
        {activeTab === "DOCS" && <DocumentationPlatformPanel />}
        {activeTab === "MARKETPLACE" && <PackageRegistryAndMarketplacePanel />}
        {activeTab === "LOCAL_CICD" && <LocalDevAndCicdStudio />}
        {activeTab === "CERTIFICATION" && <DeveloperPlatformCertificationReportView />}
      </div>
    </div>
  );
};
