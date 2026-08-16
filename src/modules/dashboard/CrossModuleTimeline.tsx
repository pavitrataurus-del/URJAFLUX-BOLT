import React from "react";
import { Clock, Calendar, ShieldCheck, Building2, UserPlus, ClipboardCheck } from "lucide-react";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  module: "Vastu" | "Numerology" | "Lal Kitab" | "System";
  event: string;
  details: string;
  operator: string;
}

interface CrossModuleTimelineProps {
  events: TimelineEvent[];
}

export const CrossModuleTimeline: React.FC<CrossModuleTimelineProps> = ({ events }) => {
  const getModuleStyle = (mod: string) => {
    switch (mod) {
      case "Vastu":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-900/40";
      case "Numerology":
        return "bg-amber-950/40 text-amber-400 border-amber-900/40";
      case "Lal Kitab":
        return "bg-rose-950/40 text-rose-400 border-rose-900/40";
      default:
        return "bg-emerald-950/40 text-emerald-400 border-emerald-900/40";
    }
  };

  const getModuleIcon = (mod: string) => {
    switch (mod) {
      case "Vastu":
        return <Building2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "Numerology":
        return <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />;
      case "Lal Kitab":
        return <Calendar className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl p-5 space-y-4" id="cross-module-timeline">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-950 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            Cross-Module Audit Timeline
          </h4>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Chronological synchronization ledger</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center text-slate-400 italic text-xs font-mono">
          No consultant history logged yet. Run workspace calculations to generate log items.
        </div>
      ) : (
        <div className="relative border-l border-slate-200 ml-3 pl-4 py-1 space-y-4 max-h-[300px] overflow-y-auto">
          {events.map(ev => (
            <div key={ev.id} className="relative group">
              {/* Timeline bubble icon */}
              <div className="absolute -left-[24.5px] top-1 w-5 h-5 rounded-full bg-slate-50 border border-slate-850 flex items-center justify-center shrink-0">
                {getModuleIcon(ev.module)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-700 font-bold">{ev.event.toUpperCase()}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded border ${getModuleStyle(ev.module)}`}>
                      {ev.module}
                    </span>
                  </div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {new Date(ev.timestamp).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">{ev.details}</p>
                <div className="text-[9px] font-mono text-slate-600 uppercase">
                  Operator: {ev.operator}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrossModuleTimeline;
