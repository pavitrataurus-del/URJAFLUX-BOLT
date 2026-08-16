import React from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";

export interface DashboardPriority {
  id: string;
  source: "Vastu" | "Numerology" | "Lal Kitab" | "System";
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  remedy: string;
  status: "Pending" | "In Progress" | "Resolved";
}

interface PriorityEnginePanelProps {
  priorities: DashboardPriority[];
  onResolvePriority?: (id: string) => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const PriorityEnginePanel: React.FC<PriorityEnginePanelProps> = ({
  priorities,
  onResolvePriority,
  onNavigateToModule
}) => {
  // Sort Critical and High to the top
  const sorted = [...priorities].sort((a, b) => {
    const weights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return (weights[b.severity] || 0) - (weights[a.severity] || 0);
  });

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case "Critical":
        return "bg-rose-950/40 text-rose-400 border-rose-900/60";
      case "High":
        return "bg-amber-950/40 text-amber-400 border-amber-900/60";
      case "Medium":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-900/60";
      default:
        return "bg-slate-50 text-slate-400 border-slate-200";
    }
  };

  const getSourceIconStyle = (source: string) => {
    switch (source) {
      case "Vastu":
        return "text-emerald-400 bg-emerald-950/40 border border-emerald-900/50";
      case "Numerology":
        return "text-amber-400 bg-amber-950/40 border border-amber-900/50";
      case "Lal Kitab":
        return "text-rose-400 bg-rose-950/40 border border-rose-900/50";
      default:
        return "text-slate-400 bg-white border border-slate-200";
    }
  };

  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl p-5 space-y-4 animate-fade-in" id="priority-engine-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-950 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
            Vastu-Astro Priority Engine
          </h4>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Automated cross-module anomaly triage pipeline</p>
        </div>
        <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 border border-rose-900/40 rounded">
          {priorities.filter(p => p.status === "Pending").length} UNRESOLVED
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/30 border border-slate-200 border-dashed rounded-xl space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-xs font-mono text-slate-400 font-bold">ALL COSMIC CHANNELS CALIBRATED</p>
          <p className="text-[10.5px] text-slate-600 font-sans">No high-risk remedial anomalies detected for this client profile.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {sorted.map(item => (
            <div
              key={item.id}
              className={`p-4 bg-slate-50 border rounded-lg space-y-2.5 transition-all hover:bg-slate-50/80 ${
                item.severity === "Critical" ? "border-l-4 border-l-rose-500" : ""
              } ${item.severity === "High" ? "border-l-4 border-l-amber-500" : ""} border-slate-200`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold ${getSourceIconStyle(item.source)}`}>
                    {item.source}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${getSeverityStyle(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.status === "Pending" && (
                    <button
                      type="button"
                      onClick={() => onResolvePriority && onResolvePriority(item.id)}
                      className="text-[10px] font-mono font-bold text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer bg-white/50 hover:bg-white px-2 py-0.5 border border-slate-200 rounded"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Mark Resolved
                    </button>
                  )}
                  {item.status === "Resolved" && (
                    <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-900 tracking-wide flex items-center justify-between">
                  <span>{item.title}</span>
                  <button
                    type="button"
                    onClick={() => onNavigateToModule && onNavigateToModule((item.source || "").toLowerCase().replace(" ", ""))}
                    className="text-slate-400 hover:text-slate-900 cursor-pointer"
                    title="Launch module"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </h5>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  {item.description}
                </p>
              </div>

              {/* Remedy Line */}
              <div className="p-2.5 bg-white/35 border border-slate-200/60 rounded flex items-start gap-2 text-[10.5px]">
                <AlertTriangle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-slate-700 font-mono leading-relaxed">
                  <span className="text-emerald-400 font-bold uppercase mr-1.5">Remedy:</span>
                  {item.remedy}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityEnginePanel;
