import React from "react";
import { Heart, ShieldAlert, CheckCircle2, TrendingUp } from "lucide-react";

interface ClientHealthIndexProps {
  personalPct: number;
  birthPct: number;
  propertiesPct: number;
  consultationsPct: number;
  overallPct: number;
}

export const ClientHealthIndex: React.FC<ClientHealthIndexProps> = ({
  personalPct,
  birthPct,
  propertiesPct,
  consultationsPct,
  overallPct
}) => {
  const getStatusText = (pct: number) => {
    if (pct >= 90) return { label: "EXCELLENT STATUS", color: "text-emerald-400" };
    if (pct >= 60) return { label: "STABLE ALIGNMENT", color: "text-emerald-400" };
    if (pct >= 40) return { label: "INCOMPLETE DOSSIER", color: "text-amber-400 animate-pulse" };
    return { label: "HIGH RISK CRITICAL WARNING", color: "text-rose-400 animate-pulse" };
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 90) return "bg-emerald-500";
    if (pct >= 60) return "bg-emerald-500";
    if (pct >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  const status = getStatusText(overallPct);

  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl p-5 space-y-4" id="client-health-index">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-950 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
            Spiritual Client Health Index (SSoT)
          </h4>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Automated dossier completion metrics</p>
        </div>
        <div className={`text-[10px] font-mono font-bold ${status.color} flex items-center gap-1.5`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{status.label}</span>
        </div>
      </div>

      {/* Main progress bar list */}
      <div className="space-y-3.5">
        {/* Overall Completion */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-900 font-bold">Overall Dossier Health Index</span>
            <span className="text-emerald-400 font-bold">{overallPct}%</span>
          </div>
          <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden border border-slate-200 p-0.5">
            <div
              className={`h-1 rounded-full transition-all duration-1000 ${getPercentageColor(overallPct)}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Personal Details */}
          <div className="p-3 bg-slate-50/45 border border-slate-200/60 rounded-lg space-y-1.5">
            <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest block">Personal Info</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200 font-mono">{personalPct}%</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Birth Registry */}
          <div className="p-3 bg-slate-50/45 border border-slate-200/60 rounded-lg space-y-1.5">
            <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest block">Birth Registry</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200 font-mono">{birthPct}%</span>
              <div className={`w-1.5 h-1.5 rounded-full ${birthPct >= 100 ? "bg-emerald-400" : "bg-amber-400"}`} />
            </div>
          </div>

          {/* Properties */}
          <div className="p-3 bg-slate-50/45 border border-slate-200/60 rounded-lg space-y-1.5">
            <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest block">Properties (Vastu)</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200 font-mono">{propertiesPct}%</span>
              <div className={`w-1.5 h-1.5 rounded-full ${propertiesPct > 0 ? "bg-emerald-400" : "bg-slate-700"}`} />
            </div>
          </div>

          {/* Consultations */}
          <div className="p-3 bg-slate-50/45 border border-slate-200/60 rounded-lg space-y-1.5">
            <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest block">Consultation History</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200 font-mono">{consultationsPct}%</span>
              <div className={`w-1.5 h-1.5 rounded-full ${consultationsPct > 0 ? "bg-emerald-400" : "bg-slate-700"}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHealthIndex;
