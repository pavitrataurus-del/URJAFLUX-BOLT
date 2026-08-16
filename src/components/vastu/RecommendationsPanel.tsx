import React from "react";
import { Sparkles, ShieldCheck, Heart, Zap, FileText, CheckSquare } from "lucide-react";
import { InterpretationRecommendation } from "../../engines/interpretation/InterpretationTypes";

interface RecommendationsPanelProps {
  recommendations: InterpretationRecommendation[];
  selectedFindingId?: string | null;
}

export default function RecommendationsPanel({
  recommendations,
  selectedFindingId
}: RecommendationsPanelProps) {
  
  // Fallback recommendations if none returned by InterpretationEngine
  const activeRecommendations: any[] = recommendations.length > 0 ? recommendations : [
    {
      id: "REC_KITCHEN_NE",
      findingId: "FINDING_KITCHEN_NE",
      title: "Install Zinc Helix & Copper Plate Barriers under Burner",
      description: "Embed three physical zinc pyramid energy helixes inside the floor boundary below the gas burner, and place a heavy brass bowl filled with natural sea salt in the North-East corner of the kitchen.",
      priority: "CRITICAL" as const,
      benefit: "Binds the destructive fire element, normalizing North-East water flow and immediately ceasing cash blockages.",
      evidence: "Kitchen placed in Eshanya sector clashing with Water/Ether",
      remedyType: "Elemental Balance"
    },
    {
      id: "REC_BED_SE",
      findingId: "FINDING_BED_SE",
      title: "Place Green Aventurine Crystal & Switch to Pastel Yellow Bedding",
      description: "Place a cluster of natural raw Green Aventurine on the bedside table. Replace all active red or orange bedroom wall decor with neutral off-white or light lemon yellow pastel tones.",
      priority: "HIGH" as const,
      benefit: "Calms high-tension fire energy, promotes rapid alpha brain wave cycles, and remedies sleeping stress.",
      evidence: "Bed located in South-East Fire Quadrant",
      remedyType: "Cosmo-Therapeutic Colors"
    },
    {
      id: "REC_WC_N",
      findingId: "FINDING_WC_N",
      title: "Place a 3-inch Copper Strip around Toilet Bowl Base",
      description: "Route a continuous 3-inch pure copper strip directly around the outline base of the water closet toilet seat on the floor, securing it with clear resin adhesive.",
      priority: "MEDIUM" as const,
      benefit: "Acts as a virtual barrier that cuts off the downward draining flux of wealth energy (kuber flux).",
      evidence: "Toilet draining energy from North Wealth sector",
      remedyType: "Metal strip blockage"
    }
  ];

  // Filter recommendations based on selected finding, if any
  const filtered = selectedFindingId
    ? activeRecommendations.filter(r => r.findingId === selectedFindingId)
    : activeRecommendations;

  const getPriorityStyle = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "CRITICAL":
      case "CATASTROPHIC":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/35 font-mono font-bold";
      case "HIGH":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold";
      default:
        return "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-mono";
    }
  };

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3.5 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Remedies & Recommendations</h3>
            <p className="text-[10px] text-slate-400 font-mono">Balancing and Corrections</p>
          </div>
        </div>

        {selectedFindingId && (
          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            FILTERED BY DEFECT
          </span>
        )}
      </div>

      <div className="space-y-3.5 overflow-y-auto max-h-[350px] pr-1 flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-slate-850 bg-slate-50/20 rounded-xl font-mono">
            No recommendations linked to the active finding. Select another finding or clear filter.
          </div>
        ) : (
          filtered.map(rec => (
            <div
              key={rec.id}
              className="p-3 bg-slate-50/40 hover:bg-slate-50/70 border border-slate-850 hover:border-slate-200 rounded-lg space-y-2.5 transition-all text-left"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase ${getPriorityStyle(rec.priority)}`}>
                  {rec.priority} PRIORITY
                </span>
                <span className="text-[8px] font-mono text-slate-400">ID: {rec.id}</span>
              </div>

              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {rec.title}
              </h4>

              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{rec.description}</p>

              {/* Expected Benefit */}
              <div className="p-2 bg-emerald-500/5 rounded border border-emerald-500/10 space-y-0.5 text-left">
                <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 uppercase">
                  <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                  Expected Vedic Benefit
                </div>
                <p className="text-[9px] text-slate-700 font-sans leading-relaxed">{rec.benefit}</p>
              </div>

              {/* Evidence details */}
              <div className="flex flex-col gap-0.5 text-[8.5px] font-mono text-slate-400 bg-white/30 p-1 rounded">
                <div>
                  <span className="font-bold text-slate-600">EVIDENCE:</span>{" "}
                  <span className="text-slate-400 font-sans">{rec.evidence || "Mapped spatial conflict"}</span>
                </div>
                {rec.remedyType && (
                  <div>
                    <span className="font-bold text-slate-600">REMEDY METHOD:</span>{" "}
                    <span className="text-amber-500/80">{rec.remedyType}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
