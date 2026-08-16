import React from "react";
import { FileBarChart, Clock, FileCheck, AlertTriangle } from "lucide-react";

export default function ReportDashboard({ projectId }: { projectId: string }) {
  const stats = [
    { label: "Generated Today", value: 3, icon: FileCheck, color: "text-emerald-400" },
    { label: "Pending Review", value: 2, icon: Clock, color: "text-amber-400" },
    { label: "Failed Exports", value: 0, icon: AlertTriangle, color: "text-rose-400" },
    { label: "Total Reports", value: 12, icon: FileBarChart, color: "text-blue-400" }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Report Center Dashboard</h2>
      
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center text-center">
            <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
            <div className="text-2xl font-light text-slate-100">{s.value}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Templates</h3>
        <div className="grid grid-cols-2 gap-4">
          {["Executive Summary", "Detailed Analysis Report", "Compliance Report", "Recommendation Report", "Explainability Report", "Client-Friendly Report"].map(t => (
            <div key={t} className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-blue-500/30 transition-colors cursor-pointer">
              <div className="font-bold text-xs text-slate-300 mb-1">{t}</div>
              <div className="text-[10px] text-slate-500">Standard enterprise format ready for generation.</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] text-blue-400 text-center">
        Temporary Placeholder. Waiting for ReportWorkflowEngine API.
      </div>
    </div>
  );
}
