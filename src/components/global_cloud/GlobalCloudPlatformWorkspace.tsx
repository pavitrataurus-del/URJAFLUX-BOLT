import { useState } from "react";
import { 
  Cloud, 
  Globe, 
  Lock, 
  Activity, 
  DollarSign, 
  GitBranch, 
  Settings, 
  Award, 
  Layers 
} from "lucide-react";
import { MultiCloudAndK8sPanel } from "./MultiCloudAndK8sPanel";
import { GlobalDeploymentAndEdgePanel } from "./GlobalDeploymentAndEdgePanel";
import { SecretAndSecurityPanel } from "./SecretAndSecurityPanel";
import { GlobalObservabilityAndResiliencePanel } from "./GlobalObservabilityAndResiliencePanel";
import { CostGovernanceAndOpsCenterPanel } from "./CostGovernanceAndOpsCenterPanel";
import { DeploymentAutomationAndDRPanel } from "./DeploymentAutomationAndDRPanel";
import { PlatformAdminAndRegistryPanel } from "./PlatformAdminAndRegistryPanel";
import { GlobalCloudCertificationReportView } from "./GlobalCloudCertificationReportView";

export type GlobalCloudTabId = 
  | "MULTI_CLOUD_K8S"
  | "GLOBAL_EDGE"
  | "SECRET_SECURITY"
  | "OBSERVABILITY_RESILIENCE"
  | "COST_OPS_CENTER"
  | "DEPLOYMENT_DR"
  | "ADMIN_REGISTRY"
  | "CERTIFICATION_REPORT";

export const GlobalCloudPlatformWorkspace = () => {
  const [activeTab, setActiveTab] = useState<GlobalCloudTabId>("MULTI_CLOUD_K8S");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 text-xs font-mono font-bold tracking-widest uppercase">
              ENTERPRISE PLATFORM LAYER • V3.2.0-GA
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold">
              ● GLOBAL CLOUD ACTIVE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Cloud className="w-8 h-8 text-sky-400" />
            <span>URJAFLUX Global Enterprise Cloud Platform</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl">
            Multi-cloud abstraction across GCP, Azure, AWS, and Private Kubernetes with production manifests, Terraform/Helm templates, Anycast routing, secret rotation, and verified DR playbooks.
          </p>
        </div>

        {/* Global Cloud Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono shrink-0">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-slate-400 text-[10px] block">Supported Clouds</span>
            <strong className="text-sky-400 text-sm">GCP, Azure, AWS, K8s</strong>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-slate-400 text-[10px] block">Active Regions</span>
            <strong className="text-emerald-400 text-sm">3 Regions (US, EU, AP)</strong>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-slate-400 text-[10px] block">Global SLO Target</span>
            <strong className="text-amber-300 text-sm">99.99% Average</strong>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-slate-400 text-[10px] block">DR RPO / RTO</span>
            <strong className="text-indigo-300 text-sm">&lt;1m / 5m Target</strong>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab("MULTI_CLOUD_K8S")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
            activeTab === "MULTI_CLOUD_K8S"
              ? "bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Multi-Cloud & K8s (M1-3)</span>
        </button>

        <button
          onClick={() => setActiveTab("GLOBAL_EDGE")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
            activeTab === "GLOBAL_EDGE"
              ? "bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Global & Edge Routing (M4-5)</span>
        </button>

        <button
          onClick={() => setActiveTab("SECRET_SECURITY")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
            activeTab === "SECRET_SECURITY"
              ? "bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Secrets & Security (M6, 8)</span>
        </button>

        <button
          onClick={() => setActiveTab("OBSERVABILITY_RESILIENCE")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
            activeTab === "OBSERVABILITY_RESILIENCE"
              ? "bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>SLO & Resilience (M7, 9)</span>
        </button>

        <button
          onClick={() => setActiveTab("COST_OPS_CENTER")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
            activeTab === "COST_OPS_CENTER"
              ? "bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Cost & Ops Center (M10-11)</span>
        </button>

        <button
          onClick={() => setActiveTab("DEPLOYMENT_DR")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
            activeTab === "DEPLOYMENT_DR"
              ? "bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Pipelines & DR (M12-13)</span>
        </button>

        <button
          onClick={() => setActiveTab("ADMIN_REGISTRY")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
            activeTab === "ADMIN_REGISTRY"
              ? "bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Admin & Registry (M14)</span>
        </button>

        <button
          onClick={() => setActiveTab("CERTIFICATION_REPORT")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
            activeTab === "CERTIFICATION_REPORT"
              ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certification Report (M15)</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "MULTI_CLOUD_K8S" && <MultiCloudAndK8sPanel />}
        {activeTab === "GLOBAL_EDGE" && <GlobalDeploymentAndEdgePanel />}
        {activeTab === "SECRET_SECURITY" && <SecretAndSecurityPanel />}
        {activeTab === "OBSERVABILITY_RESILIENCE" && <GlobalObservabilityAndResiliencePanel />}
        {activeTab === "COST_OPS_CENTER" && <CostGovernanceAndOpsCenterPanel />}
        {activeTab === "DEPLOYMENT_DR" && <DeploymentAutomationAndDRPanel />}
        {activeTab === "ADMIN_REGISTRY" && <PlatformAdminAndRegistryPanel />}
        {activeTab === "CERTIFICATION_REPORT" && <GlobalCloudCertificationReportView />}
      </div>
    </div>
  );
};
