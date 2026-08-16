import React from "react";
import { Info, Target, AlertTriangle, ShieldAlert, CheckCircle, BrainCircuit } from "lucide-react";
import { IRecommendation } from "../models/ReasoningModels";

export default function ReasoningPropertiesPanel({ recommendations, selectedRecommendationId, onSelectRecommendation, isAdmin }: any) {
  const selected = recommendations?.find((r: IRecommendation) => r.id === selectedRecommendationId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-[#0d1424] border-b border-slate-800 shrink-0">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" /> Recommendations
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(!recommendations || recommendations.length === 0) ? (
          <div className="text-center p-6 text-slate-500">
            <Info className="w-8 h-8 mb-4 opacity-50 mx-auto" />
            <p className="text-xs">No recommendations available.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec: IRecommendation) => (
              <div 
                key={rec.id}
                onClick={() => onSelectRecommendation(rec.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRecommendationId === rec.id 
                    ? "bg-purple-500/10 border-purple-500/30" 
                    : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-xs text-slate-200">{rec.category}</span>
                  <PriorityBadge priority={rec.priority} />
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">{rec.description}</p>
                <div className="mt-3 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className={`px-1.5 py-0.5 rounded ${getStatusColor(rec.status)}`}>{rec.status}</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3" /> {rec.confidence?.compositeConfidence || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="h-2/5 border-t border-slate-800 bg-[#0d1424] flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
            <span className="text-xs font-bold text-purple-400 uppercase">Inspection Details</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <PropRow label="ID" value={selected.id.substring(0, 16) + '...'} />
            <PropRow label="Category" value={selected.category} />
            <PropRow label="Priority" value={selected.priority} />
            <div className="space-y-1">
              <span className="text-slate-500">Description</span>
              <p className="text-slate-300 bg-slate-800/50 p-2 rounded">{selected.description}</p>
            </div>
            
            <div className="space-y-2 pt-2">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Confidence Breakdown</span>
              <div className="space-y-1">
                {Object.entries(selected.confidence || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-slate-800/30 px-2 py-1 rounded">
                    <span className="text-slate-400 capitalize">{key.replace('Confidence', '')}</span>
                    <span className="text-purple-400 font-mono font-bold">{String(val)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && selected.evidenceReferences && (
              <div className="space-y-2 pt-2">
                <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Internal Evidence
                </span>
                {selected.evidenceReferences.map((ref: any, idx: number) => (
                  <div key={idx} className="bg-slate-800/30 p-2 rounded border border-rose-500/10">
                    <div className="text-[10px] text-slate-300">{ref.knowledgeSource}</div>
                    <div className="text-[9px] text-slate-500 mt-1">Doc: {ref.documentId}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PropRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    CRITICAL: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    LOW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${colors[priority] || colors.LOW}`}>
      {priority}
    </span>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-500/20 text-emerald-400';
    case 'REJECTED': return 'bg-rose-500/20 text-rose-400';
    case 'PENDING_REVIEW': return 'bg-amber-500/20 text-amber-400';
    default: return 'bg-slate-800 text-slate-400';
  }
}
