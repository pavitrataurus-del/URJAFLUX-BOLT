import React, { useState } from "react";
import { 
  Server, 
  Sliders, 
  DollarSign, 
  GitBranch, 
  CheckCircle2, 
  Activity, 
  Tag, 
  TrendingDown, 
  Cpu 
} from "lucide-react";
import { releaseAndOpsService } from "../../services/enterprise/releaseAndOpsService";
import { highAvailabilityService } from "../../services/enterprise/highAvailabilityService";

export const EnterpriseOpsCenterDashboard: React.FC = () => {
  const [releaseMeta] = useState(releaseAndOpsService.getReleaseMetadata());
  const [featureFlags, setFeatureFlags] = useState(releaseAndOpsService.getFeatureFlags());
  const [costEstimates] = useState(releaseAndOpsService.getCostEstimates());
  const [services] = useState(highAvailabilityService.refreshHealthChecks());
  const [notification, setNotification] = useState<string | null>(null);

  const handleToggleFlag = (key: string, currentVal: boolean) => {
    const updated = releaseAndOpsService.toggleFeatureFlag(key, !currentVal);
    setFeatureFlags([...releaseAndOpsService.getFeatureFlags()]);
    setNotification(`Feature Flag '${key}' set to ${!currentVal ? "ENABLED" : "DISABLED"}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const totalMonthlyCost = costEstimates.reduce((acc, c) => acc + c.monthlyEstimateUsd, 0);

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>MODULE 11, 12 & 13: ENTERPRISE OPERATIONS CENTER & COST OPTIMIZATION</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Global System Control, Feature Flags & Cost Efficiency</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Version: <span className="text-emerald-400 font-bold">{releaseMeta.version}</span> ({releaseMeta.buildNumber}) • Commit: <span className="font-mono text-slate-300">{releaseMeta.commitHash.slice(0, 8)}</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Total Estimated Monthly Run Rate</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">${totalMonthlyCost} USD / Mo</div>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/50 text-blue-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid: Feature Flags & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Flags Manager */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">GA Feature Flags Manager</h3>
          </div>

          <div className="space-y-2.5">
            {featureFlags.map(f => (
              <div key={f.key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200 text-xs">{f.name}</div>
                  <div className="text-[10px] text-slate-500">{f.key} • Rollout: {f.rolloutPercentage}%</div>
                </div>

                <button 
                  onClick={() => handleToggleFlag(f.key, f.enabled)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    f.enabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {f.enabled ? "ENABLED" : "DISABLED"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Optimization Analysis */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Cloud Infrastructure Cost Optimization</h3>
          </div>

          <div className="space-y-3">
            {costEstimates.map(c => (
              <div key={c.category} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{c.category}</span>
                  <span className="text-emerald-400 font-bold">${c.monthlyEstimateUsd} / Mo</span>
                </div>
                <div className="text-[10px] text-slate-500">{c.usageMetric}</div>
                <div className="text-[10px] text-cyan-400 font-sans mt-1">
                  💡 {c.optimizationRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Release Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <GitBranch className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">GA Release Notes & Changelog</h3>
        </div>

        <div className="space-y-1.5 font-sans text-xs text-slate-300">
          {releaseMeta.releaseNotes.map((note, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
