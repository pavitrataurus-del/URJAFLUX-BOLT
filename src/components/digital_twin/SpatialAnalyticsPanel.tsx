import React from "react";
import { 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Maximize2, 
  Activity, 
  CheckCircle2, 
  Compass, 
  BarChart2,
  Sliders
} from "lucide-react";
import { spatialAnalyticsService } from "../../services/digitalTwin/spatialAnalyticsService";
import { predictiveAnalyticsService } from "../../services/digitalTwin/predictiveAnalyticsService";

export const SpatialAnalyticsPanel: React.FC = () => {
  const areaAnalytics = spatialAnalyticsService.getBuildingAreaAnalytics();
  const adjacencies = spatialAnalyticsService.getAdjacencyMatrix();
  const densities = spatialAnalyticsService.getDensityMetrics();
  const anomalies = predictiveAnalyticsService.getActiveAnomalyAlerts();
  const maintenance = predictiveAnalyticsService.getMaintenanceRecommendations();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
          <PieChart className="w-4 h-4" />
          <span>MODULE 7 & 13: SPATIAL & PREDICTIVE ANALYTICS PLATFORM</span>
        </div>
        <h2 className="text-xl font-mono font-bold text-slate-100">Area Efficiency, Density Metrics & Anomaly Detection</h2>
        <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
          Automated floor efficiency analysis, adjacency matrix graph calculations, and machine learning anomaly alerts for predictive equipment maintenance.
        </p>
      </div>

      {/* Area Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Total Usable Area</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{areaAnalytics.usableAreaTotalSqM} m²</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Primary Workstations & Suites</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Circulation Corridor Area</div>
          <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">{areaAnalytics.circulationAreaTotalSqM} m²</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Egress & Arterial Passages</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Utility & Power Core</div>
          <div className="text-2xl font-mono font-bold text-indigo-400 mt-1">{areaAnalytics.utilityAreaTotalSqM} m²</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Server Vaults & AHU Rooms</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Spatial Efficiency Ratio</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">{areaAnalytics.efficiencyRatioPercent}%</div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">Exceeds Industry Benchmark (72%)</div>
        </div>
      </div>

      {/* Grid: Density Metrics & Predictive Anomaly Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Density & Occupancy Table */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Room Occupancy Density Metrics</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {densities.map(d => (
              <div key={d.roomId} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-emerald-400">{d.roomId}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.areaSqM} m² usable area • {d.currentOccupancy} occupants</div>
                </div>

                <div className="text-right">
                  <div className="text-slate-200 font-bold">{d.densityPeoplePerSqM} people/m²</div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold mt-1 inline-block ${
                    d.status === "NORMAL" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Predictive Maintenance & Anomaly Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Predictive Maintenance & Anomaly Alerts</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {anomalies.map(alt => (
              <div key={alt.id} className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{alt.twinName}</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold">{alt.severity}</span>
                </div>
                <div className="text-[11px] text-slate-300">{alt.metricName}: <span className="text-amber-400 font-bold">{alt.currentValue}</span> (Limit {alt.expectedRange[1]})</div>
                <p className="text-[10px] font-sans text-slate-400">{alt.recommendedAction}</p>
              </div>
            ))}

            {maintenance.map(m => (
              <div key={m.equipmentTwinId} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{m.equipmentName}</span>
                  <span className="text-emerald-400 font-bold">{m.healthIndexPercent}% Health</span>
                </div>
                <div className="text-[10px] text-slate-400">Remaining Life: {m.estimatedRemainingLifeDays} days • Confidence: {m.confidenceScore * 100}%</div>
                <p className="text-[11px] font-sans text-slate-300">Service: {m.recommendedService}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
