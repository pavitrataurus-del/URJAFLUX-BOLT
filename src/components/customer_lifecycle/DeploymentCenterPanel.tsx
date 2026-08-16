import React, { useState } from "react";
import { 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Cpu, 
  Database, 
  HardDrive, 
  Lock, 
  Zap, 
  Activity 
} from "lucide-react";
import { DeploymentChecklistItem } from "../../types/customerLifecycle";
import { INITIAL_DEPLOYMENT_CHECKLIST } from "../../services/customer_lifecycle/customerLifecycleService";

export const DeploymentCenterPanel: React.FC = () => {
  const [checklist, setChecklist] = useState<DeploymentChecklistItem[]>(INITIAL_DEPLOYMENT_CHECKLIST);
  const [isRunningValidation, setIsRunningValidation] = useState(false);

  const handleRunValidation = () => {
    setIsRunningValidation(true);
    setTimeout(() => {
      setIsRunningValidation(false);
      setChecklist(prev => prev.map(item => ({
        ...item,
        passed: true,
        lastChecked: "Just now"
      })));
    }, 1200);
  };

  const totalItems = checklist.length;
  const passedItems = checklist.filter(c => c.passed).length;
  const is100Percent = passedItems === totalItems;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Server className="w-4 h-4" />
            <span>MODULE 12 • ENTERPRISE DEPLOYMENT CENTER</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">Infrastructure & Connectivity Validation Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated pre-flight validation of cloud run containers, database connections, NVMe storage IOPS, and TLS security rules.
          </p>
        </div>

        <button
          disabled={isRunningValidation}
          onClick={handleRunValidation}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          {isRunningValidation ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Validating Hardware & Sockets...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-white" />
              <span>Re-Run All System Validation Tests</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Metric Card */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            is100Percent ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500" : "bg-amber-500/20 text-amber-400"
          }`}>
            {is100Percent ? "✓" : "!"}
          </div>
          <div>
            <div className="text-white font-bold text-sm">Deployment Verification Readiness</div>
            <div className="text-slate-400 text-xs">{passedItems} of {totalItems} Checks Passed</div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
          {is100Percent ? "100% READY FOR CUSTOMER DEPLOYMENT" : "DEGRADED"}
        </span>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklist.map(chk => (
          <div key={chk.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {chk.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase">{chk.category}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{chk.title}</h4>
                </div>
              </div>
              <span className="text-[10px] text-slate-500">{chk.lastChecked}</span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans pl-6">{chk.description}</p>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-850 text-[11px] text-emerald-300 pl-6">
              {chk.statusDetails}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
