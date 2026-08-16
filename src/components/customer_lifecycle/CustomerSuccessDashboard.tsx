import React, { useState } from "react";
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  PieChart, 
  Compass, 
  Sparkles, 
  Zap, 
  BookOpen 
} from "lucide-react";
import { CustomerHealthMetric, ProductAnalyticsCohort } from "../../types/customerLifecycle";
import { INITIAL_HEALTH_METRICS, INITIAL_ANALYTICS_COHORT, calculateHealthScore } from "../../services/customer_lifecycle/customerLifecycleService";

export const CustomerSuccessDashboard: React.FC = () => {
  const [healthMetrics] = useState<CustomerHealthMetric[]>(INITIAL_HEALTH_METRICS);
  const [cohort] = useState<ProductAnalyticsCohort>(INITIAL_ANALYTICS_COHORT);
  const [activeTab, setActiveTab] = useState<"HEALTH_SCORES" | "PRODUCT_ANALYTICS">("HEALTH_SCORES");

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("HEALTH_SCORES")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "HEALTH_SCORES"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Customer Health & Adoption Score</span>
          </button>
          <button
            onClick={() => setActiveTab("PRODUCT_ANALYTICS")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "PRODUCT_ANALYTICS"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Product Analytics & Cohort Retention</span>
          </button>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 pr-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Real-time Health Score Engine (0-100 Scale)</span>
        </div>
      </div>

      {/* HEALTH SCORES VIEW */}
      {activeTab === "HEALTH_SCORES" && (
        <div className="space-y-6">
          {/* Top High-level Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Avg Customer Health Score</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">88 / 100</div>
              <div className="text-[11px] text-slate-500 font-mono">Calculated from adoption & seats</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Active Seat Utilization</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">77%</div>
              <div className="text-[11px] text-slate-500 font-mono">154 / 200 Licenses Consumed</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>DAU / MAU Stickiness</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-300">0.685</div>
              <div className="text-[11px] text-slate-500 font-mono">High daily engagement ratio</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Renewal Risk Radar</span>
                <AlertTriangle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">LOW RISK</div>
              <div className="text-[11px] text-slate-500 font-mono">0 Accounts Flagged</div>
            </div>
          </div>

          {/* Accounts Breakdown Table */}
          <div className="grid grid-cols-1 gap-6">
            {healthMetrics.map(hm => {
              const computedScore = calculateHealthScore(hm.activeSeats, hm.totalSeats, hm.trainingCompletionRate, hm.supportTicketsOpen);
              return (
                <div key={hm.tenantId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white font-mono">{hm.companyName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          RISK: {hm.renewalRisk}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Tenant ID: {hm.tenantId} • NPS Score: {hm.npsScore}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Health Score</div>
                        <div className="text-2xl font-bold font-mono text-emerald-400">{computedScore} / 100</div>
                      </div>
                    </div>
                  </div>

                  {/* Sub Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <div className="text-slate-400 flex justify-between">
                        <span>Seat Adoption ({hm.activeSeats}/{hm.totalSeats}):</span>
                        <span className="text-white font-bold">{Math.round((hm.activeSeats / hm.totalSeats) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(hm.activeSeats / hm.totalSeats) * 100}%` }} />
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <div className="text-slate-400 flex justify-between">
                        <span>Training Completion Rate:</span>
                        <span className="text-emerald-400 font-bold">{hm.trainingCompletionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${hm.trainingCompletionRate}%` }} />
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <div className="text-slate-400 flex justify-between">
                        <span>Support Ticket Velocity:</span>
                        <span className="text-emerald-300 font-bold">{hm.supportTicketsOpen} Open</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Zero escalation issues flagged</div>
                    </div>
                  </div>

                  {/* Feature Usage Heatmap */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 font-mono text-xs">
                    <div className="text-slate-300 font-bold flex items-center justify-between">
                      <span>Module Usage Distribution (30-Day Window)</span>
                      <span className="text-emerald-400 text-[11px]">Total Operations Executed</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(hm.featureUsageMap).map(([feat, count]) => (
                        <div key={feat} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <div className="text-[10px] text-slate-400">{feat}</div>
                          <div className="text-sm font-bold text-white">{count} ops</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRODUCT ANALYTICS VIEW */}
      {activeTab === "PRODUCT_ANALYTICS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Product Analytics & Cohort Retention Curve</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tracks month-over-month account retention, top feature execution heatmaps, and spatial twin queries.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">{cohort.cohortMonth}</span>
                <span className="text-slate-400 text-xs block mt-0.5">{cohort.totalAccounts} Enterprise Accounts Tracked</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px]">6-Month Retention Rate:</span>
                <div className="text-lg font-bold text-white">{cohort.retentionRates[cohort.retentionRates.length - 1]}%</div>
              </div>
            </div>

            {/* Retention Bar Graph */}
            <div className="grid grid-cols-6 gap-2 pt-2">
              {cohort.retentionRates.map((rate, idx) => (
                <div key={idx} className="space-y-1 text-center">
                  <div className="text-[10px] text-slate-400">M{idx + 1}</div>
                  <div className="bg-slate-900 h-24 rounded-lg p-1 border border-slate-800 flex items-end justify-center">
                    <div
                      className="bg-emerald-500 w-full rounded-md transition-all"
                      style={{ height: `${rate}%` }}
                    />
                  </div>
                  <div className="text-xs font-bold text-emerald-300">{rate}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-slate-300 font-bold">Top Feature Execution Volumes</div>
              <div className="space-y-2">
                {cohort.topFeaturesUsed.map((tf, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-300">{tf.feature}</span>
                    <span className="text-emerald-400 font-bold">{tf.usageCount} calls</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-slate-300 font-bold">Spatial & Knowledge Telemetry</div>
              <div className="space-y-3 pt-1">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
                  <span className="text-slate-400">Digital Twin Queries Executed:</span>
                  <span className="text-amber-300 font-bold text-sm">{cohort.twinQueriesExecuted.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
                  <span className="text-slate-400">Knowledge Vector Searches:</span>
                  <span className="text-emerald-400 font-bold text-sm">{cohort.knowledgeSearchesExecuted.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
