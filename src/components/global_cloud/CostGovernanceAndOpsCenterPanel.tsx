import { useState } from "react";
import { 
  DollarSign, 
  BarChart2, 
  TrendingDown, 
  Server, 
  Activity, 
  CheckCircle2, 
  Cpu, 
  Layers 
} from "lucide-react";
import { RegionalCostEstimate, ClusterHealthStatus } from "../../types/globalCloudPlatform";
import { REGIONAL_COST_ESTIMATES, CLUSTER_HEALTH_LIST } from "../../services/global_cloud/globalCloudService";

export const CostGovernanceAndOpsCenterPanel = () => {
  const [costs] = useState<RegionalCostEstimate[]>(REGIONAL_COST_ESTIMATES);
  const [clusters] = useState<ClusterHealthStatus[]>(CLUSTER_HEALTH_LIST);

  const totalMonthlyUsd = costs.reduce((acc, c) => acc + c.monthlyTotalUsd, 0);
  const totalSavingsOpportunityUsd = costs.reduce((acc, c) => acc + c.savingsOpportunityUsd, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
            <DollarSign className="w-4 h-4" />
            <span>MODULES 10 & 11 • COST GOVERNANCE & GLOBAL OPS CENTER</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Cloud FinOps Budgeting & Global Operations Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Regional infrastructure spend breakdowns, rightsizing recommendations, and unified multi-cluster operational telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
            TOTAL MONTHLY SPEND: ${totalMonthlyUsd.toLocaleString()} USD
          </span>
        </div>
      </div>

      {/* SECTION 1: FINANCIAL GOVERNANCE & COST BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Multi-Cloud Cost Breakdown & Optimization</span>
            <span className="text-sky-400 font-bold">Module 10 • Cost Governance</span>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30">
            <TrendingDown className="w-4 h-4" />
            <span>Identified Monthly Savings Opportunity: ${totalSavingsOpportunityUsd.toLocaleString()} USD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {costs.map(c => (
            <div key={`${c.cloudProvider}-${c.region}`} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold">
                  {c.cloudProvider}
                </span>
                <span className="text-xs font-bold text-white">${c.monthlyTotalUsd.toLocaleString()} / mo</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200">{c.region}</h4>
              </div>

              <div className="space-y-1.5 text-[10px] text-slate-300 pt-2 border-t border-slate-850 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-400">Compute (K8s/Nodes):</span>
                  <span className="font-mono text-slate-200">${c.monthlyComputeUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage (Spanner/S3):</span>
                  <span className="font-mono text-slate-200">${c.monthlyStorageUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network Egress:</span>
                  <span className="font-mono text-slate-200">${c.monthlyNetworkUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Tokens (Gemini/Vertex):</span>
                  <span className="font-mono text-amber-300">${c.monthlyAiTokensUsd.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-300 font-sans">
                💡 <strong>Optimization:</strong> Spot instance pool migration can save ${c.savingsOpportunityUsd.toLocaleString()} / mo.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: GLOBAL OPERATIONS CENTER & CLUSTER HEALTH */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span>Module 11 • Global Operations Center (GOC) Cluster Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clusters.map(cluster => (
            <div key={cluster.clusterId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-300">{cluster.provider}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  {cluster.healthState}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">{cluster.clusterId}</h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">K8s: {cluster.k8sVersion} • Nodes: {cluster.nodeCount}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-850">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">CPU Usage:</span>
                    <span className="text-sky-300 font-bold">{cluster.cpuUsagePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: `${cluster.cpuUsagePercentage}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Memory Usage:</span>
                    <span className="text-sky-300 font-bold">{cluster.memoryUsagePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${cluster.memoryUsagePercentage}%` }} />
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-sans">
                  <span>Running Pods:</span>
                  <strong className="text-slate-200 font-mono">{cluster.podCount} Pods</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
