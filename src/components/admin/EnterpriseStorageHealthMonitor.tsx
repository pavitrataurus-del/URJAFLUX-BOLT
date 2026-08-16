// URJAFLUX Enterprise Storage Engine - Diagnostic Health Monitor
// Admin-only monitoring console for URJAFLUX_KB_V2 IndexedDB storage engine

import React, { useState, useEffect } from "react";
import {
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Server,
  Layers,
  HardDrive,
  Clock,
  FileCode2,
  Lock
} from "lucide-react";
import { storageService, StorageHealthReport, StorageStats } from "../../services/EnterpriseKnowledgeStorageService";
import { KBStoreName } from "../../core/storage/schema";

interface EnterpriseStorageHealthMonitorProps {
  userRole?: string;
}

export default function EnterpriseStorageHealthMonitor({ userRole = "ADMIN" }: EnterpriseStorageHealthMonitorProps) {
  const isAdmin = userRole === "ADMIN";

  const [healthReport, setHealthReport] = useState<StorageHealthReport | null>(null);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  const loadDiagnostics = async () => {
    setIsLoading(true);
    try {
      await storageService.initialize();
      const report = await storageService.checkHealth();
      const currentStats = await storageService.getStats();
      setHealthReport(report);
      setStats(currentStats);
    } catch (err: any) {
      setActionMessage({ type: "error", text: `Failed loading diagnostics: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleExportBackup = async () => {
    try {
      const jsonStr = await storageService.exportBackup();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `URJAFLUX_KB_V2_Backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setActionMessage({ type: "success", text: "Enterprise database backup exported successfully." });
    } catch (err: any) {
      setActionMessage({ type: "error", text: `Export failed: ${err.message}` });
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const jsonContent = evt.target?.result as string;
        const res = await storageService.importBackup(jsonContent);
        setActionMessage({ type: "success", text: `Database restored successfully! Imported ${res.importedRecords} records.` });
        await loadDiagnostics();
      } catch (err: any) {
        setActionMessage({ type: "error", text: `Restore failed: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = async () => {
    try {
      await storageService.resetDatabase();
      setShowConfirmReset(false);
      setActionMessage({ type: "success", text: "Database reset complete. All object stores cleared." });
      await loadDiagnostics();
    } catch (err: any) {
      setActionMessage({ type: "error", text: `Reset failed: ${err.message}` });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 bg-slate-900 border border-red-800/50 rounded-xl text-center text-slate-300">
        <Lock className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">Access Restricted</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The Enterprise Storage Health Monitor & Diagnostics Console is strictly reserved for authorized System Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Database className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">Enterprise Storage Engine Health Monitor</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                URJAFLUX_KB_V2
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              IndexedDB Storage Driver • Offline-First Persistence • 16 Object Stores • Transaction Safety
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDiagnostics}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Run Health Check
          </button>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Backup
          </button>
          <label className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Restore Backup
            <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
          </label>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            actionMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
              : actionMessage.type === "error"
              ? "bg-rose-950/40 border-rose-800/50 text-rose-300"
              : "bg-sky-950/40 border-sky-800/50 text-sky-300"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health Score */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Storage Health Score</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-white">
                  {healthReport ? `${healthReport.healthScore}/100` : "..."}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    healthReport?.status === "HEALTHY"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {healthReport?.status || "UNKNOWN"}
                </span>
              </div>
            </div>
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Init Latency: <span className="text-slate-200 font-semibold">{healthReport?.initLatencyMs ?? 0} ms</span> (Target: &lt;500ms)
          </p>
        </div>

        {/* Card 2: Total Records */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Stored Records</p>
              <p className="text-3xl font-extrabold text-white mt-2">
                {stats ? stats.totalRecords.toLocaleString() : "0"}
              </p>
            </div>
            <Layers className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            Estimated Size: <span className="text-slate-200 font-semibold">{stats?.estimatedSizeMB ?? 0} MB</span> ({stats?.estimatedSizeBytes.toLocaleString()} bytes)
          </p>
        </div>

        {/* Card 3: Storage Driver */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Storage Driver</p>
              <p className="text-lg font-bold text-white mt-2">
                {stats?.isFallbackMode ? "In-Memory Driver" : "Native IndexedDB"}
              </p>
            </div>
            <Server className="w-6 h-6 text-sky-400" />
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
            Engine: <span className="text-slate-200 font-mono text-[11px]">{stats?.engineVersion}</span>
          </p>
        </div>

        {/* Card 4: Migration Status */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">BUILD-019 Migration</p>
              <p className="text-lg font-bold text-white mt-2">
                {healthReport?.migrationStatus.performed ? "Completed & Verified" : "Not Required"}
              </p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            Migrated Records: <span className="text-slate-200 font-semibold">{healthReport?.migrationStatus.migratedRecords ?? 0}</span>
          </p>
        </div>
      </div>

      {/* Issues / Diagnostic Alerts */}
      {healthReport?.issues && healthReport.issues.length > 0 && (
        <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-amber-300 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            System Diagnostic Notes ({healthReport.issues.length})
          </div>
          <ul className="space-y-1 text-xs text-amber-200/80 list-disc list-inside">
            {healthReport.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Object Stores Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">URJAFLUX_KB_V2 Object Stores (16 Collections)</h3>
            <p className="text-xs text-slate-400">Record breakdown and storage distribution across IndexedDB schema collections</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(KBStoreName).map((storeName) => {
            const count = stats?.storeCounts[storeName] || 0;
            return (
              <div key={storeName} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-400">{storeName}</span>
                  <div className="text-base font-bold text-white mt-0.5">{count.toLocaleString()}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-amber-400/80"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 bg-rose-950/20 border border-rose-900/40 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Reset Storage Engine
          </h4>
          <p className="text-xs text-rose-200/60 mt-0.5">
            Permanently clear all 16 object stores in URJAFLUX_KB_V2 IndexedDB. Use with extreme caution.
          </p>
        </div>

        {showConfirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDatabase}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition"
            >
              Confirm Clear All
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 text-xs font-semibold rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Storage
          </button>
        )}
      </div>
    </div>
  );
}
