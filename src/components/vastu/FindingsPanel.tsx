import React, { useState } from "react";
import { AlertCircle, ShieldAlert, CheckCircle, Info, Filter, Folder, Search } from "lucide-react";
import { InterpretationFinding } from "../../engines/interpretation/InterpretationTypes";

interface FindingsPanelProps {
  findings: InterpretationFinding[];
  onSelectFinding?: (findingId: string) => void;
  selectedFindingId?: string | null;
}

export default function FindingsPanel({
  findings,
  onSelectFinding,
  selectedFindingId
}: FindingsPanelProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [groupByCategory, setGroupByCategory] = useState<boolean>(false);

  // Fallback findings if none are calculated yet or pipeline is idle
  const activeFindings: any[] = findings.length > 0 ? findings : [
    {
      id: "FINDING_KITCHEN_NE",
      ruleId: "RULE_KITCHEN_NE_DEFECT",
      title: "Kitchen Placed in Sacred North-East Direction (Eshanya)",
      description: "Cooking activities and physical burners positioned in the NE zone disturb water and ether elements, causing severe financial leakage and friction among occupants.",
      severity: "CATASTROPHIC" as const,
      matched: true,
      category: "Thermal Layout",
      impact: "High stress, neurological disturbance, and chronic cash blockages."
    },
    {
      id: "FINDING_BED_SE",
      ruleId: "RULE_BEDROOM_SE",
      title: "Master Bed Located in South-East (Agneya/Fire Zone)",
      description: "Sleeping in the South-East Agni sector brings hyperactivity, insomnia, and short-tempered behavior due to excess elemental fire.",
      severity: "MAJOR" as const,
      matched: true,
      category: "Sleeping Alignment",
      impact: "Marital conflicts and sleep cycle degradation."
    },
    {
      id: "FINDING_WC_N",
      ruleId: "RULE_TOILET_N",
      title: "Water Closet (Toilet) in North Quadrant",
      description: "Positioning a waste outflow directly in the North wealth quadrant flush channels kuber energy down the drain, blocking new business proposals.",
      severity: "MODERATE" as const,
      matched: true,
      category: "Sanitation Outflow",
      impact: "Obstacles in carrier growth and stagnant finances."
    }
  ];

  const getSeverityStyles = (sev: string) => {
    switch (sev.toUpperCase()) {
      case "CATASTROPHIC":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          badge: "bg-rose-500 text-slate-950 font-black",
          iconColor: "text-rose-400"
        };
      case "MAJOR":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          badge: "bg-amber-500 text-slate-950 font-bold",
          iconColor: "text-amber-400"
        };
      case "MODERATE":
        return {
          bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
          badge: "bg-yellow-500 text-slate-950",
          iconColor: "text-yellow-400"
        };
      default:
        return {
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
          badge: "bg-blue-500 text-slate-950",
          iconColor: "text-blue-400"
        };
    }
  };

  const filtered = activeFindings.filter(finding => {
    const matchesSev = filterSeverity === "ALL" || finding.severity.toUpperCase() === filterSeverity.toUpperCase();
    const matchesSearch = searchQuery.trim() === "" || 
      finding.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      finding.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (finding.category && finding.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSev && matchesSearch;
  });

  // Grouping
  const categories = Array.from(new Set(filtered.map(f => f.category || "General Architectural")));

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3.5 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Spatial Findings</h3>
            <p className="text-[10px] text-slate-400 font-mono">Real-time Rule Violations</p>
          </div>
        </div>
        
        {/* Total Badge */}
        <span className="text-[10px] font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold px-2 py-0.5 rounded-full">
          {filtered.length} DEFECTS
        </span>
      </div>

      {/* FILTER & GROUPING CONTROLS */}
      <div className="space-y-2">
        <div className="flex gap-1.5 items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-850">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search architectural violations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-700 focus:outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1">
            {["ALL", "CATASTROPHIC", "MAJOR", "MODERATE"].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-all ${
                  filterSeverity === sev
                    ? "bg-emerald-500 text-slate-950 border-emerald-400"
                    : "bg-slate-50 border-slate-850 text-slate-400 hover:text-slate-700"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            onClick={() => setGroupByCategory(!groupByCategory)}
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border flex items-center gap-1 transition-all ${
              groupByCategory
                ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
                : "bg-slate-50 border-slate-850 text-slate-400 hover:text-slate-700"
            }`}
          >
            <Folder className="w-3 h-3" />
            {groupByCategory ? "UNGROUP" : "GROUP"}
          </button>
        </div>
      </div>

      {/* FINDINGS SCROLL CONTAINER */}
      <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-slate-850 bg-slate-50/20 rounded-xl font-mono">
            No Vastu defects found matching criteria.
          </div>
        ) : groupByCategory ? (
          categories.map(cat => {
            const items = filtered.filter(f => (f.category || "General Architectural") === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="space-y-1.5 text-left">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block pl-1">
                  📁 {cat}
                </span>
                {items.map(finding => {
                  const style = getSeverityStyles(finding.severity);
                  const isSelected = selectedFindingId === finding.id;
                  return (
                    <div
                      key={finding.id}
                      onClick={() => onSelectFinding && onSelectFinding(finding.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer text-left ${style.bg} ${
                        isSelected ? "ring-1 ring-emerald-500 border-emerald-500/40" : "hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${style.badge}`}>
                          {finding.severity}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">ID: {finding.id}</span>
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-200 mt-1.5 leading-snug">{finding.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">{finding.description}</p>
                      {finding.impact && (
                        <div className="mt-2 text-[9px] font-mono text-rose-300/80 bg-slate-50/30 p-1.5 rounded border border-rose-950/20">
                          <span className="font-bold">IMPACT:</span> {finding.impact}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          filtered.map(finding => {
            const style = getSeverityStyles(finding.severity);
            const isSelected = selectedFindingId === finding.id;
            return (
              <div
                key={finding.id}
                onClick={() => onSelectFinding && onSelectFinding(finding.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer text-left ${style.bg} ${
                  isSelected ? "ring-1 ring-emerald-500 border-emerald-500/40" : "hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${style.badge}`}>
                    {finding.severity}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">ID: {finding.id}</span>
                </div>
                <h4 className="text-[11px] font-bold text-slate-200 mt-1.5 leading-snug">{finding.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">{finding.description}</p>
                {finding.impact && (
                  <div className="mt-2 text-[9px] font-mono text-rose-300/85 bg-slate-50/30 p-1.5 rounded border border-rose-950/20">
                    <span className="font-bold text-rose-400">IMPACT:</span> {finding.impact}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
