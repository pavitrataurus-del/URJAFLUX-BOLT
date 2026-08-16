import React, { useState } from "react";
import { CheckSquare, Square, ClipboardList, HelpCircle, FileText, ChevronRight, Activity } from "lucide-react";

export interface UnifiedRecommendation {
  id: string;
  category: "Spiritual" | "Structural" | "Behavioral";
  module: "Vastu" | "Numerology" | "Lal Kitab";
  title: string;
  remedy: string;
  expectedBenefit: string;
  complexity: "Simple" | "Medium" | "Complex";
  authority?: string;
  completed: boolean;
}

interface UnifiedRecommendationsPanelProps {
  recommendations: UnifiedRecommendation[];
  onToggleRecommendation?: (id: string) => void;
}

export const UnifiedRecommendationsPanel: React.FC<UnifiedRecommendationsPanelProps> = ({
  recommendations,
  onToggleRecommendation
}) => {
  const [activeCategory, setActiveCategory] = useState<"All" | "Spiritual" | "Structural" | "Behavioral">("All");

  const filtered = activeCategory === "All" 
    ? recommendations 
    : recommendations.filter(r => r.category === activeCategory);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Spiritual":
        return "text-emerald-400 border-emerald-950/40 bg-emerald-950/20";
      case "Structural":
        return "text-emerald-400 border-emerald-950/40 bg-emerald-950/20";
      default:
        return "text-amber-400 border-amber-950/40 bg-amber-950/20";
    }
  };

  const getComplexityColor = (comp: string) => {
    switch (comp) {
      case "Simple":
        return "text-emerald-500";
      case "Medium":
        return "text-amber-500";
      default:
        return "text-rose-500 font-bold";
    }
  };

  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl p-5 space-y-4" id="unified-recommendations-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-950 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-emerald-400 animate-pulse" />
            Unified Remedial Directives
          </h4>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Dual Spiritual & Structural Rectification Tasks</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200 overflow-x-auto">
          {(["All", "Spiritual", "Structural", "Behavioral"] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 text-[9px] font-mono font-bold rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? "bg-emerald-600 text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-400 italic text-xs font-mono">
          No remedial recommendations logged for the selected category.
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
          {filtered.map(rec => (
            <div
              key={rec.id}
              onClick={() => onToggleRecommendation && onToggleRecommendation(rec.id)}
              className={`p-4 bg-slate-50/70 border border-slate-200/80 rounded-lg space-y-3 hover:bg-slate-50 transition-all cursor-pointer flex gap-3 items-start ${
                rec.completed ? "opacity-60" : ""
              }`}
            >
              {/* Checkbox Trigger */}
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-slate-900 cursor-pointer shrink-0 focus:outline-none"
              >
                {rec.completed ? (
                  <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                ) : (
                  <Square className="w-4.5 h-4.5 text-slate-700" />
                )}
              </button>

              {/* Recommendation Details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded border uppercase font-bold ${getCategoryColor(rec.category)}`}>
                    {rec.category}
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] font-mono rounded border border-slate-200 bg-white text-slate-400 uppercase">
                    {rec.module}
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-400 flex items-center gap-1">
                    COMPLEXITY: 
                    <span className={`font-bold ${getComplexityColor(rec.complexity)}`}>{rec.complexity}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h5 className={`text-xs font-bold tracking-wide ${rec.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                    {rec.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    <span className="text-emerald-400 font-mono font-semibold">REMEDY:</span> {rec.remedy}
                  </p>
                </div>

                {rec.expectedBenefit && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 bg-white/35 px-2 py-1 rounded font-sans">
                    <span className="font-mono text-[9px] text-emerald-500 font-bold uppercase shrink-0">Expected Benefit:</span>
                    <span className="italic">{rec.expectedBenefit}</span>
                  </div>
                )}

                {rec.authority && (
                  <div className="text-[9px] font-mono text-slate-600 flex items-center gap-1 pt-1">
                    <FileText className="w-3 h-3 text-slate-600" />
                    <span>AUTHORITY REFERENCE: {rec.authority}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedRecommendationsPanel;
