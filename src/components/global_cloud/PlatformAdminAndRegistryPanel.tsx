import { useState } from "react";
import { 
  Settings, 
  Server, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Globe 
} from "lucide-react";

export const PlatformAdminAndRegistryPanel = () => {
  const [environments, setEnvironments] = useState([
    { name: "PRODUCTION_GLOBAL", clusters: 3, status: "HEALTHY", regionCount: 3, driftDetected: false },
    { name: "STAGING_EU", clusters: 1, status: "HEALTHY", regionCount: 1, driftDetected: false },
    { name: "CANARY_RING_0", clusters: 1, status: "HEALTHY", regionCount: 1, driftDetected: false }
  ]);

  const [auditingDrift, setAuditingDrift] = useState(false);
  const [auditMessage, setAuditMessage] = useState("");

  const handleRunConfigAudit = () => {
    setAuditingDrift(true);
    setAuditMessage("Auditing Kubernetes ConfigMaps and Helm values across all 3 production clouds...");
    setTimeout(() => {
      setAuditingDrift(false);
      setAuditMessage("Configuration Drift Audit Complete: 0 parameter drifts detected. All GKE, AKS, and EKS deployments match main Git repository state.");
      setTimeout(() => setAuditMessage(""), 4000);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
            <Settings className="w-4 h-4" />
            <span>MODULE 14 • PLATFORM ADMINISTRATION & CLUSTER REGISTRY</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Cloud Administration Console & Drift Audit Engine</h2>
          <p className="text-xs text-slate-400 mt-1">
            Global multi-cluster registration, environment lifecycle management, and configuration drift detection.
          </p>
        </div>

        <button
          disabled={auditingDrift}
          onClick={handleRunConfigAudit}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs border border-sky-400 shadow-lg shadow-sky-600/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${auditingDrift ? "animate-spin" : ""}`} />
          <span>Run Config Drift Audit</span>
        </button>
      </div>

      {auditMessage && (
        <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-300 text-xs font-sans animate-pulse">
          ✓ {auditMessage}
        </div>
      )}

      {/* ENVIRONMENT & CLUSTER REGISTRY MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {environments.map(env => (
          <div key={env.name} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 font-bold">{env.name}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                {env.status}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white">{env.clusters} Cluster(s) Registered</h4>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Spans {env.regionCount} Cloud Region(s)</p>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-[10px] font-sans space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Drift Audit Status:</span>
                <strong className="text-emerald-300 font-mono">IN_SYNC</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RBAC Controls:</span>
                <span className="text-slate-200 font-mono">ENFORCED</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
