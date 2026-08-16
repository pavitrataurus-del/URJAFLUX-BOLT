import React from "react";
import { History, FileText, Download, Eye, CheckCircle, Clock } from "lucide-react";

export default function ReportHistory({ projectId, onSelect }: { projectId: string, onSelect: (id: string) => void }) {
  const reports = [
    { id: "rep-001", name: "Executive Summary - Q2", type: "Executive Summary", date: "2026-07-25", status: "Approved", author: "System" },
    { id: "rep-002", name: "Full Compliance Audit", type: "Compliance Report", date: "2026-07-24", status: "Pending Review", author: "Admin" },
    { id: "rep-003", name: "Client Deliverable", type: "Client Report", date: "2026-07-20", status: "Published", author: "Consultant" }
  ];

  return (
    <div className="p-6 h-full flex flex-col space-y-4">
      <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
        <History className="w-4 h-4 text-blue-400" /> Report History
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {reports.map(r => (
          <div key={r.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600 transition-colors flex items-center justify-between group">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => onSelect(r.id)}>{r.name}</div>
                <div className="text-[10px] text-slate-500 flex gap-3 mt-1">
                  <span>{r.type}</span>
                  <span>•</span>
                  <span>{r.date}</span>
                  <span>•</span>
                  <span>By {r.author}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                r.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {r.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : r.status === 'Pending Review' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                {r.status}
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onSelect(r.id)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400 transition-colors" title="Preview">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors" title="Export">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
