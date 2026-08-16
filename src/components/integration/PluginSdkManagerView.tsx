// Module 1 & 2: Plugin SDK & Runtime Management UI
import React, { useState } from "react";
import {
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  Plus,
  RefreshCw,
  Code,
  HardDrive,
  Activity,
  Check,
  ExternalLink,
  Info
} from "lucide-react";
import { PluginRuntimeInstance, PluginManifest } from "../../types/integrationPlatform";
import { PluginSdkRuntimeEngine } from "../../core/integration/PluginSdkRuntimeEngine";

export const PluginSdkManagerView: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginRuntimeInstance[]>(() =>
    PluginSdkRuntimeEngine.getPlugins()
  );
  const [selectedPlugin, setSelectedPlugin] = useState<PluginRuntimeInstance | null>(plugins[0] || null);
  const [showManifestModal, setShowManifestModal] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const refreshPlugins = () => {
    const list = PluginSdkRuntimeEngine.getPlugins();
    setPlugins(list);
    if (selectedPlugin) {
      const updated = list.find(p => p.manifest.id === selectedPlugin.manifest.id);
      if (updated) setSelectedPlugin(updated);
    }
  };

  const handleToggleLifecycle = (pluginId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    PluginSdkRuntimeEngine.updateLifecycleStatus(pluginId, newStatus);
    refreshPlugins();
  };

  const handleUninstall = (pluginId: string) => {
    PluginSdkRuntimeEngine.uninstallPlugin(pluginId);
    refreshPlugins();
    if (selectedPlugin?.manifest.id === pluginId) {
      setSelectedPlugin(null);
    }
  };

  const handleTestExecute = (pluginId: string) => {
    const res = PluginSdkRuntimeEngine.executePluginHandler(pluginId, "onExecuteAction", {
      projectId: "PRJ-TEST-8801",
      timestamp: new Date().toISOString()
    });
    setExecutionResult(JSON.stringify(res, null, 2));
    refreshPlugins();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 1 & 2
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Isolated V8 Sandbox
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Plugin SDK & Runtime Isolation Management
          </h2>
          <p className="text-xs text-slate-300">
            Inspect installed plugins, sandbox resource limits, digital signatures, extension points, and lifecycle events.
          </p>
        </div>

        <button
          onClick={refreshPlugins}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Registry
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Installed Plugins List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" /> Installed Plugins ({plugins.length})
          </h3>

          <div className="space-y-2">
            {plugins.map((inst) => (
              <div
                key={inst.manifest.id}
                onClick={() => setSelectedPlugin(inst)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedPlugin?.manifest.id === inst.manifest.id
                    ? "bg-indigo-50/80 border-indigo-400 shadow-sm"
                    : "bg-white border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 truncate">{inst.manifest.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inst.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {inst.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{inst.manifest.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>v{inst.manifest.version}</span>
                  <span>RAM: {inst.memoryUsageMb} MB / {inst.manifest.sandboxConfig.memoryLimitMb} MB</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Plugin Inspector */}
        {selectedPlugin && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedPlugin.manifest.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedPlugin.manifest.id} | Publisher: {selectedPlugin.manifest.publisher}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleLifecycle(selectedPlugin.manifest.id, selectedPlugin.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                      selectedPlugin.status === "ACTIVE"
                        ? "bg-amber-600 hover:bg-amber-500 text-white"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {selectedPlugin.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{selectedPlugin.status === "ACTIVE" ? "Disable" : "Activate"}</span>
                  </button>

                  <button
                    onClick={() => handleUninstall(selectedPlugin.manifest.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Uninstall
                  </button>
                </div>
              </div>

              {/* Resource & Sandbox Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 font-medium text-[11px]">Memory Quota</span>
                  <span className="font-bold text-slate-800 block">{selectedPlugin.manifest.sandboxConfig.memoryLimitMb} MB</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 font-medium text-[11px]">CPU Quota</span>
                  <span className="font-bold text-slate-800 block">{selectedPlugin.manifest.sandboxConfig.cpuQuotaPercent}%</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 font-medium text-[11px]">Timeout Limit</span>
                  <span className="font-bold text-slate-800 block">{selectedPlugin.manifest.sandboxConfig.timeoutMs} ms</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 font-medium text-[11px]">Digital Signature</span>
                  <span className="font-bold text-emerald-700 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                </div>
              </div>

              {/* Extension Points Hooks */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Registered Extension Point Hooks</h4>
                <div className="space-y-1.5">
                  {selectedPlugin.manifest.extensionPoints.map((ext) => (
                    <div key={ext.id} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between">
                      <span className="font-bold text-indigo-900">{ext.title}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px]">
                        {ext.type} --&gt; {ext.handlerFnName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Execution Trigger */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Sandbox Handler Test Execution</h4>
                  <button
                    onClick={() => handleTestExecute(selectedPlugin.manifest.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Execute Test
                  </button>
                </div>

                {executionResult && (
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                    {executionResult}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
