import React, { useState } from "react";
import { 
  Clock, 
  RotateCcw, 
  GitCommit, 
  History, 
  Sliders, 
  CheckCircle2, 
  FileText, 
  ShieldCheck,
  User,
  ArrowRight
} from "lucide-react";
import { changeTrackingService } from "../../services/digitalTwin/changeTrackingService";

export const ChangeTrackingPanel: React.FC = () => {
  const auditEntries = changeTrackingService.getAuditEntries();
  const snapshots = changeTrackingService.getSnapshots();

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>("SNAP-BASELINE-2026");
  const [timeTravelIndex, setTimeTravelIndex] = useState<number>(100); // 0 to 100% time slider
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  const handleRestore = (snapshotId: string) => {
    const success = changeTrackingService.restoreSnapshot(snapshotId, "chief.architect@urjaflux.com");
    if (success) {
      setRestoreSuccessMsg(`Successfully restored Digital Twin model state to snapshot '${snapshotId}'.`);
      setTimeout(() => setRestoreSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>MODULE 3: CHANGE TRACKING & TIME TRAVEL ENGINE</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Immutable Change Log & Snapshot Rollback</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Every digital twin object mutation is cryptographically logged. Scrub through time-series snapshots or compare side-by-side versions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const newSnap = changeTrackingService.createSnapshot(`Ad-Hoc Manual Snapshot ${Date.now().toString().slice(-4)}`, "chief.architect@urjaflux.com");
              setRestoreSuccessMsg(`Created new Snapshot '${newSnap.snapshotId}'.`);
              setTimeout(() => setRestoreSuccessMsg(null), 4000);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-emerald-600/20"
          >
            + CREATE SNAPSHOT
          </button>
        </div>
      </div>

      {restoreSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{restoreSuccessMsg}</span>
        </div>
      )}

      {/* Time Travel Slider Control */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>TIME TRAVEL TIMELINE SCRUBBER</span>
          </div>
          <span className="text-emerald-400 font-bold">{timeTravelIndex === 100 ? "LIVE STATE (2026-07-27)" : `HISTORICAL VIEW (${timeTravelIndex}% SCRUB)`}</span>
        </div>

        <input 
          type="range" 
          min="0" 
          max="100" 
          value={timeTravelIndex} 
          onChange={(e) => setTimeTravelIndex(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>2024-01-15 (As-Built IFC Baseline)</span>
          <span>2026-06-01 (Vastu Realignment)</span>
          <span>2026-07-27 (Present Live State)</span>
        </div>
      </div>

      {/* Two Column Grid: Audit Stream & Snapshots List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Change History Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Granular Object Change Stream</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{auditEntries.length} Records Logged</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {auditEntries.map(entry => (
                <div key={entry.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">{entry.id}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-300 font-semibold">{entry.twinId}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">{entry.twinCategory}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>

                  <p className="text-slate-200 font-sans text-xs">{entry.reason}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{entry.authorUser} ({entry.authorRole})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">{entry.sourceSystem}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">{entry.versionToken}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Historical Snapshot Rollback */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <RotateCcw className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Snapshot Restore Engine</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {snapshots.map(snap => (
                <div key={snap.snapshotId} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div>
                    <div className="font-bold text-indigo-300 text-sm">{snap.snapshotId}</div>
                    <div className="text-slate-200 font-sans font-semibold mt-0.5">{snap.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{snap.twinCount} Twins Captured • {new Date(snap.timestamp).toLocaleDateString()}</div>
                  </div>

                  <button 
                    onClick={() => handleRestore(snap.snapshotId)}
                    className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-mono text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESTORE SNAPSHOT STATE</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
