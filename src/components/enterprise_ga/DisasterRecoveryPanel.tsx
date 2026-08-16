import React, { useState } from "react";
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Play, 
  HardDriveDownload,
  AlertTriangle 
} from "lucide-react";
import { disasterRecoveryService } from "../../services/enterprise/disasterRecoveryService";

export const DisasterRecoveryPanel: React.FC = () => {
  const [backups, setBackups] = useState(disasterRecoveryService.getBackups());
  const [runbook] = useState(disasterRecoveryService.getDisasterRecoveryRunbook());
  const [notification, setNotification] = useState<string | null>(null);

  const handleTriggerBackup = (scope: "DATABASE" | "KNOWLEDGE_BASE" | "DIGITAL_TWIN" | "PLATFORM_CONFIG") => {
    const newBk = disasterRecoveryService.triggerBackup(scope);
    setBackups([...disasterRecoveryService.getBackups()]);
    setNotification(`New Backup Snapshot '${newBk.id}' created and verified in GCS.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleValidateChecksum = (id: string) => {
    const res = disasterRecoveryService.validateRestorePoint(id);
    setNotification(`Snapshot '${id}' SHA-256 Checksum Verified: ${res.verifiedChecksum.slice(0, 16)}...`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>MODULE 7: DISASTER RECOVERY & BACKUP ENGINE</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Cross-Region Snapshots & Recovery Runbooks</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Target Recovery Time Objective (RTO): <span className="font-bold text-rose-300">{runbook.rtoMinutesTarget} Minutes</span> • Target Recovery Point Objective (RPO): <span className="font-bold text-rose-300">{runbook.rpoMinutesTarget} Minutes</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleTriggerBackup("DATABASE")}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>BACKUP DATABASE</span>
          </button>
          <button 
            onClick={() => handleTriggerBackup("DIGITAL_TWIN")}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>BACKUP TWIN</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-rose-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid: Backup Snapshots & DR Runbook */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Snapshots Table */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Cross-Region Backup Snapshots</h3>
          </div>

          <div className="space-y-3">
            {backups.map(b => (
              <div key={b.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-200 text-sm">{b.id}</div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                    {b.targetScope}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono break-all">
                  SHA-256: {b.checksumSha256}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
                  <span>Size: {(b.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  <button 
                    onClick={() => handleValidateChecksum(b.id)}
                    className="text-rose-400 hover:underline font-bold cursor-pointer"
                  >
                    VERIFY SHA-256 CHECKSUM
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disaster Recovery Runbook */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Automated DR Runbook Execution</h3>
          </div>

          <div className="space-y-3">
            {runbook.steps.map(s => (
              <div key={s.stepNumber} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 text-xs">Step {s.stepNumber}: {s.title}</span>
                  <span className="text-[10px] text-slate-500">{s.responsibleRole}</span>
                </div>
                <div className="text-slate-300 text-[11px] font-sans">{s.description}</div>
                <div className="p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[10px]">
                  {s.commandOrAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
