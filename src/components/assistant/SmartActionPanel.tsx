/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 6 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Interactive Consultation Workspace
 * 
 * SmartActionPanel.tsx: Contextual Quick Actions Panel.
 * Generates and displays dynamic follow-up suggestions derived from FollowUpSuggestionEngine.
 */

import React from "react";
import {
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Compass,
  FileCheck2,
  Cpu,
  ArrowRight
} from "lucide-react";
import { UKAFollowUpAction } from "../../assistant/UKATypes";

interface SmartActionPanelProps {
  suggestions: UKAFollowUpAction[];
  onSelectAction: (actionQuery: string) => void;
  isLoading?: boolean;
}

export const SmartActionPanel: React.FC<SmartActionPanelProps> = ({
  suggestions,
  onSelectAction,
  isLoading = false
}) => {
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "REMEDY":
        return <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />;
      case "CANON":
        return <Compass className="w-3.5 h-3.5 text-amber-400" />;
      case "COMPARISON":
        return <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />;
      case "DIAGNOSTIC":
        return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
      case "EVALUATION":
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "REMEDY":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-800/80";
      case "CANON":
        return "bg-amber-950/80 text-amber-300 border-amber-800/80";
      case "COMPARISON":
        return "bg-teal-950/80 text-teal-300 border-teal-800/80";
      case "DIAGNOSTIC":
        return "bg-indigo-950/80 text-indigo-300 border-indigo-800/80";
      case "EVALUATION":
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100">
            Smart Context Actions
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">Contextual Follow-ups</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => onSelectAction(item.actionQuery)}
            className="group text-left p-3 rounded-lg bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800/90 hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between gap-2 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
                {item.label}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-0.5 text-[10px] font-mono border rounded flex items-center gap-1 ${getCategoryBadge(
                  item.category
                )}`}
              >
                {getCategoryIcon(item.category)}
                {item.category || "SUGGESTION"}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-400">
                Click to consult
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
