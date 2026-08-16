import React from "react";
import { Calendar, UserCheck, Video, MapPin, Bell } from "lucide-react";

export interface UpcomingEvent {
  id: string;
  date: string;
  time: string;
  type: "Vastu Audit" | "Lal Kitab Review" | "Remedy Verification" | "Follow-up Call";
  description: string;
  locationType: "Online" | "In-Person";
  channel: string;
}

interface UpcomingFollowupsProps {
  events: UpcomingEvent[];
  onTriggerReminder?: (id: string) => void;
}

export const UpcomingFollowups: React.FC<UpcomingFollowupsProps> = ({
  events,
  onTriggerReminder
}) => {
  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl p-5 space-y-4" id="upcoming-followups">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-950 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Remedial Review Schedule
          </h4>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Upcoming Client Checkpoints</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-6 text-center text-slate-400 italic text-xs font-mono bg-slate-50/20 border border-slate-200 rounded-lg">
          No upcoming follow-up appointments scheduled.
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
          {events.map((event) => (
            <div key={event.id} className="p-3 bg-slate-50/50 border border-slate-200 rounded-lg flex gap-3 items-start justify-between">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-900/50 rounded text-[8px] font-mono font-bold text-emerald-400 uppercase">
                    {event.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    {event.locationType === "Online" ? (
                      <Video className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <MapPin className="w-3 h-3 text-emerald-400" />
                    )}
                    {event.channel}
                  </span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 font-sans">{event.description}</h5>
                  <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                    <span className="text-slate-700 font-bold">{event.date}</span>
                    <span className="text-slate-400">at</span>
                    <span className="text-slate-700">{event.time}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onTriggerReminder && onTriggerReminder(event.id)}
                className="p-1.5 bg-white hover:bg-slate-850 text-slate-400 hover:text-slate-900 rounded border border-slate-200 transition-colors cursor-pointer"
                title="Send Reminder Alert"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingFollowups;
