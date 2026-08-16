import React from 'react';
import { 
  ShieldCheck, 
  Package, 
  Layers, 
  Activity, 
  HardDrive, 
  CheckCircle2, 
  Cpu, 
  Server,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { useKnowledgeVaultMetrics } from '../hooks/useKnowledgeVaultMetrics';
import { formatBytes } from '../utils/fileUtils';

export const KnowledgeVaultDashboard: React.FC = () => {
  const metrics = useKnowledgeVaultMetrics();

  const formattedLastUpdate = new Date(metrics.lastUpdateTimestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const storageUsedFormatted = formatBytes(metrics.storageUsedBytes);
  const storageCapacityFormatted = formatBytes(metrics.storageCapacityBytes);
  const storagePercent = Math.min(
    Math.round((metrics.storageUsedBytes / metrics.storageCapacityBytes) * 100),
    100
  );

  return (
    <div className="space-y-6">
      {/* Vault Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                  KNOWLEDGE VAULT ENGINE
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ADMIN VAULT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Enterprise Secure Foundation • Package Partitioning Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                SYSTEM STATUS
              </span>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {metrics.knowledgeStatus}
                </span>
              </div>
            </div>

            <div className="text-right border-l border-slate-800 pl-6">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                LAST SYNC
              </span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {formattedLastUpdate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Metrics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Imported Knowledge Packages */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              Knowledge Packages
            </span>
            <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {metrics.knowledgePackages}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              REGISTERED
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Ready: {metrics.readyPackages} • Failed: {metrics.failedPackages}
          </p>
        </div>

        {/* Card 2: Processing Queue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              Processing Queue
            </span>
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {metrics.pendingPackages}
            </span>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-medium">
              PENDING
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Active items in ingestion queue
          </p>
        </div>

        {/* Card 3: Import Health */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              Import Health
            </span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {metrics.importHealthPercentage}%
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              HEALTHY
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Success rate across pipeline batching
          </p>
        </div>

        {/* Card 4: System Ready */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              System Ready
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {metrics.systemReady ? 'READY' : 'STANDBY'}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Ingestion framework operational
          </p>
        </div>
      </div>

      {/* Health Monitoring Subsystem Grid (Task 6) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Queue Health</span>
            <span className="font-bold text-slate-900 dark:text-white">{metrics.queueHealth}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Storage Health</span>
            <span className="font-bold text-slate-900 dark:text-white">{metrics.storageHealth}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Integrity Health</span>
            <span className="font-bold text-slate-900 dark:text-white">{metrics.integrityHealth}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Processing Health</span>
            <span className="font-bold text-slate-900 dark:text-white">{metrics.processingHealth}%</span>
          </div>
        </div>
      </div>

      {/* Storage & Engine Infrastructure Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                Storage Allocation
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {storageUsedFormatted} / {storageCapacityFormatted}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(storagePercent, 2)}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Utilization: {storagePercent}%</span>
            <span>Allocated Quota: 10 GB</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                Engine Infrastructure
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Cpu className="w-3.5 h-3.5" />
              Foundation Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase">Queue Processing</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">Asynchronous Loop</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase">File Integrity</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">Strict Extensions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
