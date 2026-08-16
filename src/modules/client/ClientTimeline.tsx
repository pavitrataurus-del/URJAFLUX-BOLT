import React from "react";
import { Client } from "../../types/app";
import { 
  Calendar, Phone, MapPin, Search, ClipboardList, BookOpen, FileSpreadsheet, CheckCircle, PlusCircle, Clock 
} from "lucide-react";

interface ClientTimelineProps {
  client: Client;
}

export const ClientTimeline: React.FC<ClientTimelineProps> = ({ client }) => {
  const history = client.consultationHistory || [];

  const getTimelineIcon = (type: string) => {
    const tLower = (type || "").toLowerCase();
    if (tLower.includes("phone")) return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
    if (tLower.includes("visit") || tLower.includes("site")) return <MapPin className="w-3.5 h-3.5 text-rose-400" />;
    if (tLower.includes("vastu")) return <Search className="w-3.5 h-3.5 text-emerald-400" />;
    if (tLower.includes("numerology")) return <ClipboardList className="w-3.5 h-3.5 text-blue-400" />;
    if (tLower.includes("kitab") || tLower.includes("lal")) return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
    if (tLower.includes("report")) return <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />;
    if (tLower.includes("invoice")) return <PlusCircle className="w-3.5 h-3.5 text-violet-400" />;
    if (tLower.includes("follow") || tLower.includes("completed")) return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
    return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Consultation Chronicles & History
        </h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          JOURNAL RECORD OF ALL PAST TOUCHPOINTS AND CLIENT EVENTS
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-white/10">
          <p className="text-slate-400 text-xs font-mono">Chronology index is empty. Log a consultation below.</p>
        </div>
      ) : (
        <div className="relative border-l border-slate-200 pl-4 space-y-6 ml-3 py-2">
          {history.map((event, index) => (
            <div key={event.id || index} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-[27px] top-0 w-6.5 h-6.5 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                {getTimelineIcon(event.type)}
              </div>

              {/* Box Details */}
              <div className="p-3.5 bg-white/30 group-hover:bg-white border border-slate-200/70 rounded-lg transition-colors space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h5 className="text-xs font-bold text-slate-200">
                    {event.type}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>{event.date}</span>
                    <span className="text-slate-800">|</span>
                    <span className="text-emerald-400 uppercase tracking-widest">{event.status || "Completed"}</span>
                  </div>
                </div>
                <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">{event.notes}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClientTimeline;
