import React from "react";
import { 
  Building2, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Zap, 
  Boxes,
  Compass,
  Cpu
} from "lucide-react";
import { digitalTwinCore } from "../../services/digitalTwin/digitalTwinCore";
import { changeTrackingService } from "../../services/digitalTwin/changeTrackingService";
import { iotIntegrationService } from "../../services/digitalTwin/iotIntegrationService";

export const TwinOverviewDashboard: React.FC<{ onNavigateToTab: (tab: string) => void }> = ({ onNavigateToTab }) => {
  const twins = digitalTwinCore.getAllTwins();
  const buildings = digitalTwinCore.getTwinsByCategory("BUILDING");
  const floors = digitalTwinCore.getTwinsByCategory("FLOOR");
  const rooms = digitalTwinCore.getTwinsByCategory("ROOM");
  const equipments = digitalTwinCore.getTwinsByCategory("EQUIPMENT");
  const sensors = iotIntegrationService.getSensorAdapters();

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Building Health Composite Score */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-emerald-500/10 pointer-events-none">
            <Building2 className="w-20 h-20" />
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-1">Building Health Index</div>
          <div className="text-3xl font-mono font-bold text-emerald-400 flex items-baseline gap-2">
            <span>96.4%</span>
            <span className="text-xs font-mono text-emerald-500 font-semibold">+1.2% this week</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HVAC, Power, Vastu & Air Quality Balanced</span>
          </div>
        </div>

        {/* Total Persistent Twins */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-1">Persistent Twin Objects</div>
          <div className="text-3xl font-mono font-bold text-slate-100 flex items-baseline gap-2">
            <span>{twins.length}</span>
            <span className="text-xs font-mono text-slate-400">Active Entities</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span>1 Bld | 1 Floor | 3 Rooms | 1 Equipment</span>
          </div>
        </div>

        {/* Live IoT Sensor Status */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-1">IoT Telemetry Array</div>
          <div className="text-3xl font-mono font-bold text-cyan-400 flex items-baseline gap-2">
            <span>{sensors.length} / {sensors.length}</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">100% Online</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>MQTT Broker: Connected (10s sync)</span>
          </div>
        </div>

        {/* Active Simulation Scenarios */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-1">Simulation Engine</div>
          <div className="text-3xl font-mono font-bold text-amber-400 flex items-baseline gap-2">
            <span>1 Active</span>
            <span className="text-xs font-mono text-slate-400">Scenario Alpha</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>+6 Pt Vastu & Thermal Delta</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Twin Hierarchy & Real-Time Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Persistent Digital Twin Tree & Status */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Enterprise Digital Twin Asset Hierarchy</h3>
              </div>
              <button 
                onClick={() => onNavigateToTab("3d_viewer")}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold cursor-pointer transition-all"
              >
                OPEN 3D VIEWER →
              </button>
            </div>

            {/* Tree Hierarchy List */}
            <div className="space-y-3 font-mono text-xs">
              {twins.map(twin => (
                <div key={twin.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      {twin.category === "BUILDING" ? <Building2 className="w-4 h-4" /> : twin.category === "FLOOR" ? <Layers className="w-4 h-4" /> : <Boxes className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">{twin.id}</span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-200 font-sans font-semibold">{twin.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Category: <span className="text-slate-300">{twin.category}</span> • Lifecycle: <span className="text-slate-300">{twin.lifecycle}</span> • Version: <span className="text-slate-300">{twin.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {twin.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Quick System Status & Real-Time Audit Feed */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">Live Twin Audit Stream</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { time: "Just now", user: "system.iot", msg: "AHU-1 Telemetry Synced (6,420 operating hrs)", badge: "IOT_TELEMETRY" },
                { time: "10m ago", user: "vastu.consultant", msg: "Ishan Suite Vastu score updated to 98%", badge: "USER_INTERFACE" },
                { time: "1h ago", user: "chief.architect", msg: "Created Simulation Scenario Alpha", badge: "AI_RECOMMENDATION" }
              ].map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{log.time} • {log.user}</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px]">{log.badge}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{log.msg}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigateToTab("change_tracking")}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono font-bold transition-all cursor-pointer text-center"
            >
              VIEW FULL CHANGE TIMELINE & TIME TRAVEL →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
