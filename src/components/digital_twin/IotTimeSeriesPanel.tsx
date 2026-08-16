import React, { useState } from "react";
import { 
  Activity, 
  Wifi, 
  Zap, 
  Clock, 
  Play, 
  TrendingUp, 
  Info, 
  CheckCircle2, 
  Sliders, 
  Cpu,
  BarChart2
} from "lucide-react";
import { iotIntegrationService } from "../../services/digitalTwin/iotIntegrationService";
import { timeSeriesPlatform } from "../../services/digitalTwin/timeSeriesPlatform";

export const IotTimeSeriesPanel: React.FC = () => {
  const adapters = iotIntegrationService.getSensorAdapters();
  const trends = timeSeriesPlatform.getSensorTrends();
  const correlations = timeSeriesPlatform.getEventCorrelations();
  const hardwareDeps = iotIntegrationService.getExternalHardwareDependencies();

  const [selectedSensorId, setSelectedSensorId] = useState<string>("SNS-TEMP-NE101");
  const history = timeSeriesPlatform.getTelemetryHistory(selectedSensorId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>MODULE 8 & 9: IOT INTEGRATION & TIME SERIES TELEMETRY PLATFORM</span>
        </div>
        <h2 className="text-xl font-mono font-bold text-slate-100">MQTT Adapter Interface & 24-Hour Telemetry Playback</h2>
        <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
          Real-time IoT sensor telemetry streams for Temperature, Humidity, CO2, Power meters, PIR motion, and Smart Switches. Hardware dependencies are explicitly documented.
        </p>
      </div>

      {/* Grid: Sensor Adapters & Live Telemetry History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Sensor Adapters List */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">MQTT Sensor Adapters</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">{adapters.length} Online</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {adapters.map(s => (
                <div 
                  key={s.sensorId} 
                  onClick={() => setSelectedSensorId(s.sensorId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                    selectedSensorId === s.sensorId 
                      ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300" 
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">{s.sensorId}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-slate-200 font-sans font-semibold text-xs">{s.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">Topic: {s.mqttTopic}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): 24h Telemetry Sparkline & Playback */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">24-Hour Telemetry History & Playback</h3>
              </div>
              <span className="text-xs font-mono text-cyan-300 font-bold">{selectedSensorId}</span>
            </div>

            {/* Sparkline Visual Simulation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-slate-400 flex justify-between">
                <span>SENSOR TELEMETRY READINGS (24 HOURS)</span>
                <span className="text-emerald-400 font-bold">LATEST: {history[0]?.value} {history[0]?.unit}</span>
              </div>

              {/* Bar Sparkline */}
              <div className="h-32 w-full flex items-end gap-1.5 pt-4 px-2">
                {history.slice(0, 24).reverse().map((r, i) => {
                  const maxVal = Math.max(...history.map(h => h.value)) || 1;
                  const heightPct = Math.max(10, Math.round((r.value / maxVal) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div 
                        style={{ height: `${heightPct}%` }} 
                        className="w-full rounded-t bg-cyan-500/60 group-hover:bg-cyan-400 transition-all cursor-pointer"
                      />
                      <div className="absolute -top-8 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {r.value} {r.unit}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
                <span>-24 Hours Ago</span>
                <span>-12 Hours Ago</span>
                <span>Present Live Telemetry</span>
              </div>
            </div>

            {/* Event Correlations */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Event Correlation Insights</div>
              {correlations.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{c.event}</span>
                    <span className="text-emerald-400 font-bold">r = {c.correlationFactor}</span>
                  </div>
                  <p className="text-[11px] font-sans text-slate-400">{c.conclusion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* External Hardware & Broker Dependencies Box */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800 pb-2">
              <Info className="w-4 h-4" />
              <span>REQUIRED EXTERNAL HARDWARE & BROKER DEPLOYMENT DEPENDENCIES</span>
            </div>
            <div className="space-y-2">
              {hardwareDeps.map((dep, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="font-bold text-slate-200">{dep.name} ({dep.type})</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{dep.requirement}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
