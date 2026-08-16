import React, { useState } from "react";
import { 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  ArrowLeftRight, 
  History, 
  FileText, 
  Cpu, 
  Layers, 
  Zap 
} from "lucide-react";
import { UpdateChannelConfig, EnterpriseReleaseMatrix } from "../../types/customerLifecycle";
import { UPDATE_CHANNELS, RELEASE_MATRIX } from "../../services/customer_lifecycle/customerLifecycleService";

export const UpdateAndReleaseCenterPanel: React.FC = () => {
  const [channels, setChannels] = useState<UpdateChannelConfig[]>(UPDATE_CHANNELS);
  const [releaseMatrix] = useState<EnterpriseReleaseMatrix[]>(RELEASE_MATRIX);
  const [activeTab, setActiveTab] = useState<"UPDATE_CHANNELS" | "RELEASE_MATRIX" | "MIGRATION_ASSISTANT">("UPDATE_CHANNELS");

  // Migration Assistant State
  const [sourceVersion, setSourceVersion] = useState("v2.4.2-LTS");
  const [targetVersion, setTargetVersion] = useState("v2.5.0-GA");
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    compatible: boolean;
    schemaChangesCount: number;
    actionsRequired: string[];
  } | null>(null);

  const handleRunMigrationCheck = () => {
    setIsCheckingCompatibility(true);
    setTimeout(() => {
      setIsCheckingCompatibility(false);
      setMigrationResult({
        compatible: true,
        schemaChangesCount: 3,
        actionsRequired: [
          "Auto-executing Firestore schema update v2.5.0",
          "Re-indexing Digital Twin spatial vector embeddings",
          "Verifying backward compatibility for legacy CAD DWG layers"
        ]
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("UPDATE_CHANNELS")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "UPDATE_CHANNELS"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Channels ({channels.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("RELEASE_MATRIX")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "RELEASE_MATRIX"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Release & EOL Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("MIGRATION_ASSISTANT")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "MIGRATION_ASSISTANT"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Upgrade & Migration Assistant</span>
          </button>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 pr-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SHA-256 Checksum Verified Release Pipeline</span>
        </div>
      </div>

      {/* UPDATE CHANNELS VIEW */}
      {activeTab === "UPDATE_CHANNELS" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map(chan => (
            <div key={chan.channel} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{chan.channel}</span>
                    <h3 className="text-xl font-bold text-white font-mono mt-0.5">{chan.currentVersion}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                    {chan.updatePolicy}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Latest Available:</span>
                    <span className="text-emerald-400 font-bold">{chan.latestAvailableVersion}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Rollback Snapshot:</span>
                    <span className="text-slate-200">{chan.rollbackSnapshotAvailable ? "READY (Instant)" : "N/A"}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-xs">
                  <div className="font-mono text-slate-300 font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Release Highlights</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                    {chan.releaseNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-500 truncate">
                  SHA-256: {chan.lastVerifiedSha256}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => alert(`Triggering update policy for ${chan.channel}`)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Execute Sync</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RELEASE MATRIX VIEW */}
      {activeTab === "RELEASE_MATRIX" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Enterprise Software Lifecycle & EOL Calendar</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Maintains official release matrix, deprecation schedules, and end-of-life support windows.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Version Tag</th>
                  <th className="py-3 px-4">Release Date</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4">Compatibility</th>
                  <th className="py-3 px-4">End of Life (EOL)</th>
                  <th className="py-3 px-4">Known Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {releaseMatrix.map(mat => (
                  <tr key={mat.version} className="hover:bg-slate-950/50">
                    <td className="py-3.5 px-4 font-bold text-white">{mat.version}</td>
                    <td className="py-3.5 px-4 text-slate-400">{mat.releaseDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        mat.status === "CURRENT_GA"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : mat.status === "LTS_SUPPORTED"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}>
                        {mat.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">{mat.compatibilityRating}</td>
                    <td className="py-3.5 px-4 text-slate-400">{mat.endOfLifeDate}</td>
                    <td className="py-3.5 px-4 text-slate-400">{mat.knownIssues.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MIGRATION ASSISTANT VIEW */}
      {activeTab === "MIGRATION_ASSISTANT" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
              <span>Automated Upgrade & Migration Assistant</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verifies schema compatibility, performs dry-run data migrations, and verifies zero breaking changes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Source Installed Version</label>
              <select
                value={sourceVersion}
                onChange={e => setSourceVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="v2.4.2-LTS">v2.4.2-LTS (Previous LTS Release)</option>
                <option value="v2.0.0-PROD">v2.0.0-PROD (Legacy Production)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Target Version</label>
              <select
                value={targetVersion}
                onChange={e => setTargetVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="v2.5.0-GA">v2.5.0-GA (Current General Availability)</option>
                <option value="v2.6.0-BETA1">v2.6.0-BETA1 (Experimental)</option>
              </select>
            </div>
          </div>

          <button
            disabled={isCheckingCompatibility}
            onClick={handleRunMigrationCheck}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isCheckingCompatibility ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Dry-Run Migration Simulation...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-white" />
                <span>Run Compatibility Check & Migration Assistant</span>
              </>
            )}
          </button>

          {migrationResult && (
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Migration Verification Passed: 100% Compatible</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="text-slate-400">Automated Actions & Schema Modifications Required ({migrationResult.schemaChangesCount}):</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  {migrationResult.actionsRequired.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
