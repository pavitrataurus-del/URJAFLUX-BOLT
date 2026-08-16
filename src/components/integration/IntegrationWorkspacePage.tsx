// URJAFLUX Enterprise Integration & Automation Platform
// Unified Workspace hosting Modules 1 through 15

import React, { useState } from "react";
import {
  Activity,
  Cpu,
  Zap,
  GitBranch,
  Link,
  Code,
  Globe,
  Server,
  ShoppingBag,
  Layers,
  ShieldCheck
} from "lucide-react";
import { EnterpriseIntegrationDashboard } from "./EnterpriseIntegrationDashboard";
import { PluginSdkManagerView } from "./PluginSdkManagerView";
import { EventBusMonitorView } from "./EventBusMonitorView";
import { WorkflowAutomationCanvas } from "./WorkflowAutomationCanvas";
import { EnterpriseConnectorHub } from "./EnterpriseConnectorHub";
import { DeveloperPortalApiView } from "./DeveloperPortalApiView";
import { WebhookManagementConsole } from "./WebhookManagementConsole";
import { BackgroundJobQueueMonitor } from "./BackgroundJobQueueMonitor";
import { MarketplaceFoundationStore } from "./MarketplaceFoundationStore";

export const IntegrationWorkspacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "plugins" | "eventbus" | "workflows" | "connectors" | "apiv2" | "webhooks" | "jobs" | "marketplace"
  >("dashboard");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider">
              URJAFLUX AI OS Platform
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
              RC3 Enterprise Ready
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Enterprise Integration & Automation Platform
          </h1>
          <p className="text-xs text-slate-500">
            Isolated Plugin SDK, Priority Event Bus, Visual Low-Code Workflows, SaaS Connectors, Public API V2, Webhooks, & Marketplace
          </p>
        </div>
      </div>

      {/* Workspace Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "dashboard"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Dashboard & Observability
        </button>

        <button
          onClick={() => setActiveTab("plugins")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "plugins"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> Plugin SDK & Runtime
        </button>

        <button
          onClick={() => setActiveTab("eventbus")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "eventbus"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> Event Bus & DLQ
        </button>

        <button
          onClick={() => setActiveTab("workflows")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "workflows"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" /> Visual Workflows & Rules
        </button>

        <button
          onClick={() => setActiveTab("connectors")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "connectors"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Link className="w-3.5 h-3.5" /> Enterprise Connectors
        </button>

        <button
          onClick={() => setActiveTab("apiv2")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "apiv2"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Code className="w-3.5 h-3.5" /> Public API V2 & OpenAPI
        </button>

        <button
          onClick={() => setActiveTab("webhooks")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "webhooks"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Webhook Platform
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "jobs"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Server className="w-3.5 h-3.5" /> Background Jobs & Workers
        </button>

        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "marketplace"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Extension Marketplace
        </button>
      </div>

      {/* Tab View Switcher */}
      <div className="pt-2">
        {activeTab === "dashboard" && <EnterpriseIntegrationDashboard />}
        {activeTab === "plugins" && <PluginSdkManagerView />}
        {activeTab === "eventbus" && <EventBusMonitorView />}
        {activeTab === "workflows" && <WorkflowAutomationCanvas />}
        {activeTab === "connectors" && <EnterpriseConnectorHub />}
        {activeTab === "apiv2" && <DeveloperPortalApiView />}
        {activeTab === "webhooks" && <WebhookManagementConsole />}
        {activeTab === "jobs" && <BackgroundJobQueueMonitor />}
        {activeTab === "marketplace" && <MarketplaceFoundationStore />}
      </div>
    </div>
  );
};

export default IntegrationWorkspacePage;
