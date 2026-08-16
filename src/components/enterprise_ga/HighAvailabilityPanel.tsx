import React, { useState } from "react";
import { 
  Activity, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Power, 
  ShieldAlert,
  ArrowRightLeft
} from "lucide-react";
import { highAvailabilityService } from "../../services/enterprise/highAvailabilityService";

export const HighAvailabilityPanel: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState(highAvailabilityService.refreshHealthChecks());
  const [liveness, setLiveness] = useState(highAvailabilityService.getLivenessProbe());
  const [readiness, setReadiness] = useState(highAvailabilityService.getReadinessProbe());
  const [failover, setFailover] = useState(highAvailabilityService.getFailoverConfig());
  const [isMaintenance, setIsMaintenance] = useState(highAvailabilityService.isMaintenanceActive());
  const [notification, setNotification] = useState<string | null>(null);

  const handleRefresh = () => {
    setHealthChecks(highAvailabilityService.refreshHealthChecks());
    setLiveness(highAvailabilityService.getLivenessProbe());
    setReadiness(highAvailabilityService.getReadinessProbe());
  };

  const handleToggleMaintenance = () => {
    const nextState = !isMaintenance;
    highAvailabilityService.toggleMaintenanceMode(nextState);
    setIsMaintenance(nextState);
    handleRefresh();
    setNotification(nextState ? "Platform switched to MAINTENANCE MODE." : "Platform resumed NORMAL PRODUCTION OPERATION.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTriggerFailover = () => {
    const target = failover.activeRegion.includes("Mumbai") ? "asia-southeast1 (Singapore)" : "asia-south1 (Mumbai)";
    const updated = highAvailabilityService.triggerFailover(target);
    setFailover(updated);
    handleRefresh();
    setNotification(`Multi-region failover executed. Active Region is now: ${updated.activeRegion}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAutoRecovery = () => {
    const res = highAvailabilityService.triggerAutoRecovery();
    handleRefresh();
    setNotification(`Auto-recovery completed. Services restored: ${res.recoveredServices.length || 0}`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>MODULE 2: HIGH AVAILABILITY & MULTI-REGION FAILOVER</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Liveness / Readiness Probes & Auto-Recovery</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Active-Standby multi-region orchestration, zero-downtime maintenance mode transitions, and automated self-healing probes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleAutoRecovery}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>TRIGGER AUTO-RECOVERY</span>
          </button>
          <button 
            onClick={handleToggleMaintenance}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              isMaintenance ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isMaintenance ? "EXIT MAINTENANCE" : "ENTER MAINTENANCE"}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid: Probes & Region Failover */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liveness Probe */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold uppercase">Liveness Probe</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {liveness.alive ? "PASSED (ALIVE)" : "FAILED (DOWN)"}
          </div>
          <div className="text-[10px] text-slate-500">
            Last Probe: {new Date(liveness.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Readiness Probe */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold uppercase">Readiness Probe</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            {readiness.ready ? "READY FOR TRAFFIC" : "NOT READY"}
          </div>
          <div className="text-[10px] text-slate-500">
            Healthy Services: {readiness.healthyServicesCount} / {readiness.totalServicesCount}
          </div>
        </div>

        {/* Region Failover Status */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold uppercase">Active Region</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-indigo-300">
            {failover.activeRegion}
          </div>
          <button 
            onClick={handleTriggerFailover}
            className="w-full mt-2 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>EXECUTE MULTI-REGION FAILOVER</span>
          </button>
        </div>
      </div>

      {/* Services Health Probe Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Health Probe Matrix</h3>
          </div>
          <button onClick={handleRefresh} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-2 px-3">Service ID & Name</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Liveness</th>
                <th className="py-2 px-3">Readiness</th>
                <th className="py-2 px-3">Latency</th>
                <th className="py-2 px-3">Last Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {healthChecks.map(s => (
                <tr key={s.serviceId} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-slate-200">
                    <div>{s.serviceName}</div>
                    <div className="text-[10px] text-slate-500">{s.serviceId}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      s.status === "HEALTHY" ? "bg-emerald-500/20 text-emerald-400" : s.status === "MAINTENANCE" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {s.liveness ? "PASS" : "FAIL"}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {s.readiness ? "READY" : "NOT READY"}
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">
                    {s.responseTimeMs} ms
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[10px]">
                    {new Date(s.lastCheckedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
