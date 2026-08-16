/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 6 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Interactive Consultation Workspace
 * 
 * ConsultationTimelinePanel.tsx: Professional Consultation Timeline Panel.
 * Displays structured consultation decision record log (Not raw chat messages).
 */

import React, { useState } from "react";
import {
  History,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  FileText,
  ShieldCheck,
  Tag
} from "lucide-react";
import { UKAConsultationRecord } from "../../assistant/UKATypes";

interface ConsultationTimelinePanelProps {
  records: UKAConsultationRecord[];
  onSelectRecord?: (record: UKAConsultationRecord) => void;
}

export const ConsultationTimelinePanel: React.FC<ConsultationTimelinePanelProps> = ({
  records,
  onSelectRecord
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<string>("ALL");

  const filteredRecords = records.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = r.userQuestion.toLowerCase().includes(q);
      const matchIntent = r.intent.toLowerCase().includes(q);
      const matchTarget = (r.targetId || "").toLowerCase().includes(q);
      if (!matchQ && !matchIntent && !matchTarget) return false;
    }

    if (selectedIntentFilter !== "ALL") {
      if (r.intent !== selectedIntentFilter) return false;
    }

    return true;
  });

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 shadow-xl flex flex-col gap-4 h-full min-h-[400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 tracking-wide uppercase">
              Consultation Timeline & Evidence Log
            </h3>
            <p className="text-xs text-slate-400">Structured Decision Records ({records.length} logged)</p>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="relative">
            <select
              value={selectedIntentFilter}
              onChange={(e) => setSelectedIntentFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              <option value="ALL">All Intents</option>
              <option value="DECISION_QUERY">Decision Query</option>
              <option value="PROPERTY_QUERY">Property Query</option>
              <option value="CONSULTANT_QUERY">Consultant Query</option>
              <option value="KNOWLEDGE_QUERY">Knowledge Query</option>
              <option value="REPORT_QUERY">Report Query</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Timeline List */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-lg my-auto">
          <FileText className="w-8 h-8 text-slate-400 mb-2 opacity-60" />
          <p className="text-sm font-medium text-slate-300">No consultation records match criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Submit a question in the consultation workspace to record evidence.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
          {filteredRecords.map((record) => (
            <div
              key={record.recordId}
              onClick={() => onSelectRecord?.(record)}
              className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all cursor-pointer flex flex-col gap-2"
            >
              {/* Record Top Bar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 rounded uppercase">
                    {record.intent}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {record.recordId}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatTime(record.timestamp)}</span>
                </div>
              </div>

              {/* Question */}
              <div className="text-xs font-semibold text-slate-100 flex items-start gap-1.5">
                <span className="text-emerald-400 font-mono">Q:</span>
                <span>{record.userQuestion}</span>
              </div>

              {/* Recommendation Summary */}
              {record.recommendationGiven && (
                <div className="text-xs text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800/80 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-300 block mb-0.5">Recommendation</span>
                    <span>{record.recommendationGiven}</span>
                  </div>
                </div>
              )}

              {/* Evidence & Status Bottom Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-400">
                  <Tag className="w-3 h-3 text-slate-400" />
                  Evidence Sources: {record.evidenceUsed?.length || 0} canonical items
                </span>
                <span className="flex items-center gap-1 font-medium text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {record.outcomeStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
