import { useState } from "react";
import { 
  Globe, 
  Radio, 
  HardDrive, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  ShieldAlert, 
  Sliders, 
  Database 
} from "lucide-react";
import { RegionDeploymentConfig, EdgeNodeConfig } from "../../types/globalCloudPlatform";
import { REGIONAL_DEPLOYMENTS, EDGE_NODES } from "../../services/global_cloud/globalCloudService";

export const GlobalDeploymentAndEdgePanel = () => {
  const [regions, setRegions] = useState<RegionDeploymentConfig[]>(REGIONAL_DEPLOYMENTS);
  const [edgeNodes, setEdgeNodes] = useState<EdgeNodeConfig[]>(EDGE_NODES);
  const [isSyncingEdge, setIsSyncingEdge] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleTrafficChange = (regionId: string, newWeight: number) => {
    setRegions(prev => prev.map(r => r.regionId === regionId ? { ...r, trafficWeightPercentage: newWeight } : r));
  };

  const handleTriggerEdgeSync = (nodeId: string) => {
    setIsSyncingEdge(true);
    setSyncMessage(`Flushing offline queue and synchronizing node ${nodeId}...`);
    setTimeout(() => {
      setEdgeNodes(prev => prev.map(n => n.nodeId === nodeId ? { ...n, offlineQueueLength: 0, syncStatus: "IN_SYNC", lastSyncTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) } : n));
      setIsSyncingEdge(false);
      setSyncMessage(`Node ${nodeId} successfully synchronized!`);
      setTimeout(() => setSyncMessage(""), 3000);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            <span>MODULES 4 & 5 • GLOBAL DEPLOYMENT & EDGE COMPUTING ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Region Routing, Deployment Rings & Edge Gateway Nodes</h2>
          <p className="text-xs text-slate-400 mt-1">
            Global Anycast traffic distribution, Canary ring controls, and offline-resilient Edge PoP sync queues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-xs">
            3 ACTIVE REGIONS • 3 EDGE NODES
          </span>
        </div>
      </div>

      {/* SECTION 1: MULTI-REGION TRAFFIC STEERING & CANARY RINGS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Global Region Deployment & Canary Ring Matrix</span>
          <span className="text-sky-400 font-bold">Module 4 • Global Routing</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regions.map(r => (
            <div key={r.regionId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold">
                  {r.cloudProvider}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  r.isPrimary ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-800 text-slate-300"
                }`}>
                  {r.isPrimary ? "PRIMARY REGION" : "REPLICA REGION"}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{r.locationName}</h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Deployment Ring: <span className="text-sky-300 font-mono">{r.deploymentRing}</span></p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Traffic Steering Weight:</span>
                  <span className="text-sky-400 font-bold">{r.trafficWeightPercentage}%</span>
                </div>

                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={r.trafficWeightPercentage}
                  onChange={(e) => handleTrafficChange(r.regionId, parseInt(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 font-sans">
                  <span>Latency: <strong className="text-emerald-300">{r.latencyMs} ms</strong></span>
                  <span>Status: <strong className="text-sky-300">{r.status}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: EDGE COMPUTING & OFFLINE QUEUE MANAGEMENT */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Module 5 • Edge Computing & Offline Sync Engine</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Regional PoP hubs, on-premises gateways, and sensor hubs handling intermittent connectivity with store-and-forward queueing.
            </p>
          </div>

          {syncMessage && (
            <span className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold animate-pulse">
              {syncMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {edgeNodes.map(node => (
            <div key={node.nodeId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-300">{node.edgeType}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  node.syncStatus === "IN_SYNC" 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  {node.syncStatus}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">{node.locationName}</h4>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{node.nodeId}</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300 font-sans pt-2 border-t border-slate-850">
                <div className="flex justify-between">
                  <span className="text-slate-400">Offline Queue Length:</span>
                  <strong className={node.offlineQueueLength > 0 ? "text-amber-300" : "text-emerald-300"}>
                    {node.offlineQueueLength} Records
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bandwidth:</span>
                  <span className="font-mono text-sky-300">{node.bandwidthMbps} Mbps</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Last Sync:</span>
                  <span className="font-mono text-slate-300">{node.lastSyncTimestamp}</span>
                </div>
              </div>

              {node.externalCdnDependency && (
                <div className="text-[10px] text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20 font-sans">
                  🌐 <strong>External CDN Dependency:</strong> Cloudflare Global Edge Network
                </div>
              )}

              <button
                disabled={isSyncingEdge || node.syncStatus === "IN_SYNC"}
                onClick={() => handleTriggerEdgeSync(node.nodeId)}
                className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  node.syncStatus === "IN_SYNC"
                    ? "bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed"
                    : "bg-sky-600 hover:bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-600/20"
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingEdge ? "animate-spin" : ""}`} />
                <span>{node.syncStatus === "IN_SYNC" ? "Queue In Sync" : "Sync Edge Queue Now"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
