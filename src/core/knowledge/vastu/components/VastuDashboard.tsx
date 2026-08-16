import React from "react";
import { Compass, AlertTriangle, CheckCircle } from "lucide-react";
import { IDigitalTwin } from "../../digital_twin/models/TwinModels";

export default function VastuDashboard({ twin }: { twin: IDigitalTwin | null }) {
  const zones = [
    { name: "North", status: "good", compliance: 90, issues: 0 },
    { name: "North-East", status: "excellent", compliance: 95, issues: 0 },
    { name: "East", status: "good", compliance: 85, issues: 1 },
    { name: "South-East", status: "warning", compliance: 65, issues: 3 },
    { name: "South", status: "good", compliance: 80, issues: 1 },
    { name: "South-West", status: "critical", compliance: 40, issues: 5 },
    { name: "West", status: "good", compliance: 88, issues: 0 },
    { name: "North-West", status: "warning", compliance: 70, issues: 2 },
    { name: "Center (Brahmasthan)", status: "good", compliance: 90, issues: 0 },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vastu Zone Explorer</div>
      <div className="space-y-2">
        {zones.map(z => (
          <div key={z.name} className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-purple-500/50 cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs text-slate-200">{z.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                z.status === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                z.status === 'good' ? 'bg-emerald-500/10 text-emerald-500' :
                z.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {z.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Compliance: {z.compliance}%</span>
              <span className="flex items-center gap-1">
                {z.issues > 0 ? <AlertTriangle className="w-3 h-3 text-amber-500" /> : <CheckCircle className="w-3 h-3 text-emerald-500" />}
                {z.issues} Issues
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] text-purple-400 text-center">
        Temporary Placeholder. Waiting for VastuZoneEngine API.
      </div>
    </div>
  );
}
