// Module 12, 13, 14 & 15: Enterprise Administration & Observability Dashboard
import React, { useState } from "react";
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Zap,
  Globe,
  RefreshCw,
  Server,
  Lock,
  GitBranch
} from "lucide-react";
import { SystemObservabilityMetrics } from "../../types/integrationPlatform";
import { ObservabilitySecurityEngine } from "../../core/integration/ObservabilitySecurityEngine";

export const EnterpriseIntegrationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemObservabilityMetrics>(() =>
    ObservabilitySecurityEngine.getSystemMetrics()
  );

  const refreshMetrics = () => {
    setMetrics(ObservabilitySecurityEngine.getSystemMetrics());
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 12, 13, 14 & 15
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Zero Security Violations
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Enterprise Integration & Observability Command Center
          </h2>
          <p className="text-xs text-slate-300">
            Real-time telemetry across Plugin SDKs, Event Bus TPS, Visual Workflows, Connectors, Webhooks, and Tenant Security.
          </p>
        </div>

        <button
          onClick={refreshMetrics}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Active Plugins</span>
          <span className="text-2xl font-extrabold text-slate-900 block">{metrics.activePluginsCount}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Crash Rate: {metrics.pluginCrashRatePercent}%</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Event Bus TPS</span>
          <span className="text-2xl font-extrabold text-indigo-600 block">{metrics.eventsProcessedPerSec} req/s</span>
          <span className="text-[11px] text-slate-400">DLQ Depth: {metrics.deadLetterCount}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Workflow Success Rate</span>
          <span className="text-2xl font-extrabold text-emerald-600 block">{metrics.workflowSuccessRatePercent}%</span>
          <span className="text-[11px] text-slate-400">Executions 24h: {metrics.workflowExecutions24h}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Security Isolation</span>
          <span className="text-2xl font-extrabold text-emerald-600 block">100% Secure</span>
          <span className="text-[11px] text-emerald-700 font-medium">0 Tenant Violations</span>
        </div>
      </div>

      {/* System Telemetry Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" /> Webhook & API Latency Telemetry
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-600">Public API V2 Avg Latency</span>
              <span className="font-bold text-slate-900">{metrics.apiAvgLatencyMs} ms</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-600">API Requests / Minute</span>
              <span className="font-bold text-slate-900">{metrics.apiRequestsPerMin} req/min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Webhook Delivery Success</span>
              <span className="font-bold text-emerald-600">{metrics.webhookDeliverySuccessRatePercent}%</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600" /> Background Compute & Worker Pool
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-600">Active Worker Nodes</span>
              <span className="font-bold text-slate-900">{metrics.activeBackgroundWorkers} Active Nodes</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-600">Queue Depth</span>
              <span className="font-bold text-slate-900">{metrics.jobQueueDepth} Enqueued Jobs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Connector System Health</span>
              <span className="font-bold text-emerald-600">{metrics.connectorHealthPercent}% Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
