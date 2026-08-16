import React from "react";
import { Activity, Circle, MessageSquare, Terminal } from "lucide-react";

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  user: string;
}

interface ActivityFeedProps {
  activities: ActivityLogItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl p-5 space-y-4" id="activity-feed-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-950 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Recent Administrative Activity
          </h4>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Real-time consultant operations log</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="p-6 text-center text-slate-400 italic text-xs font-mono bg-slate-50/20 border border-slate-200 rounded-lg">
          No recent administrative activity recorded.
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
          {activities.map((item) => (
            <div key={item.id} className="flex gap-3 items-start text-xs">
              <Terminal className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-0.5 font-mono">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-700 font-bold uppercase">{item.action}</span>
                  <span className="text-slate-600">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-400 font-sans leading-normal">{item.description}</p>
                <div className="text-[9px] text-emerald-400/80">BY: {item.user}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
