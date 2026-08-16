import React from "react";
import { ListChecks, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

export default function VastuRuleCompliance({ twin }: any) {
  const rules = [
    { id: "R1", name: "Entrance Placement", passed: true, severity: "critical", msg: "Main door correctly placed in East (Jayanta)." },
    { id: "R2", name: "Master Bedroom", passed: false, severity: "major", msg: "Master bedroom in South-East instead of South-West." },
    { id: "R3", name: "Kitchen Placement", passed: true, severity: "critical", msg: "Kitchen properly located in South-East (Agneya)." },
    { id: "R4", name: "Brahmasthan Load", passed: false, severity: "major", msg: "Heavy structural column detected in Center zone." },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
          <ListChecks className="w-4 h-4 text-purple-400" /> Rule Compliance
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
            <div className="text-emerald-400 font-bold">2</div>
            <div className="text-[9px] text-emerald-500 uppercase tracking-wider">Passed</div>
          </div>
          <div className="flex-1 p-2 bg-rose-500/10 border border-rose-500/20 rounded text-center">
            <div className="text-rose-400 font-bold">2</div>
            <div className="text-[9px] text-rose-500 uppercase tracking-wider">Failed</div>
          </div>
          <div className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded text-center">
            <div className="text-slate-400 font-bold">0</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">Skipped</div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {rules.map(r => (
            <div key={r.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-xs text-slate-200">{r.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  r.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  r.severity === 'major' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {r.severity}
                </span>
              </div>
              <div className="flex items-start gap-2">
                {r.passed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                )}
                <p className="text-[10px] text-slate-400">{r.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
