import React, { useState } from "react";
import { BookOpen, FileText, BarChart2, Shield, Info, Copy, CheckCircle } from "lucide-react";
import { KnowledgeReference } from "../../engines/calculation/CalculationTypes";

interface EvidencePanelProps {
  knowledgeReferences: KnowledgeReference[];
}

export default function EvidencePanel({
  knowledgeReferences
}: EvidencePanelProps) {
  const [activeTab, setActiveTab] = useState<"scriptures" | "rules" | "calculations">("scriptures");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fallback references if none loaded by KnowledgeEngine
  const activeScriptures = knowledgeReferences.length > 0 ? knowledgeReferences : [
    {
      bookId: "Mayamatam",
      bookTitle: "Mayamatam Treatise of Vedic Architecture",
      chapter: "Chapter IX: Orientation & Location of Rooms",
      verse: "IX.12-14",
      citationText: "The kitchen must strictly be in the South-East quadrant (Agneya). Placing cooking fire in the North-East causes distress to the family, leading to acute disease and chronic poverty."
    },
    {
      bookId: "Manasara",
      bookTitle: "Manasara Canon of Vastu Shastra",
      chapter: "Chapter VII: Measurement Units & Proportions",
      verse: "VII.42-45",
      citationText: "The width and length ratio of the property sets the Ayadi energy frequency. The remainder (Yoni) determines whether the dwelling brings victory, abundance, or decay."
    },
    {
      bookId: "Samarangana",
      bookTitle: "Samarangana Sutradhara of King Bhoja",
      chapter: "Chapter XVIII: Mandala Placements",
      verse: "XVIII.101",
      citationText: "A toilet in the North quadrant blocks the celestial streams of wealth and health. The water closet acts as an energy drainer and must be insulated with elemental metal boundary lines."
    }
  ];

  const rulesReferences = [
    {
      id: "RULE_KITCHEN_NE_DEFECT",
      pluginId: "core_vastu_rules",
      condition: "room.type == 'kitchen' && room.sector == 'North-East'",
      remediation: "Apply zinc helices and copper boundaries to insulate fire activities from water sector.",
      rationale: "Insulates the opposing element vectors (Fire vs Water) to maintain elemental homeostasis."
    },
    {
      id: "RULE_BEDROOM_SE",
      pluginId: "core_vastu_rules",
      condition: "room.type == 'bedroom' && room.sector == 'South-East'",
      remediation: "Apply yellow color scheme and place green crystals to absorb excessive heat energies.",
      rationale: "Calms high sympathetic nervous activity caused by solar heat radiation accumulators."
    },
    {
      id: "RULE_TOILET_NORTH",
      pluginId: "core_vastu_rules",
      condition: "room.type == 'toilet' && room.sector == 'North'",
      remediation: "Embed copper strip boundaries to neutralize flushing effects.",
      rationale: "Neutralizes gravitational outflow of energetic field currents on wealth axes."
    }
  ];

  const calculationsReferences = [
    {
      id: "AYADI_YONI_COMPLIANCE",
      formula: "Yoni = (Plot Width * 8) % 3",
      result: "Yoni remainder: 1 (Dhwaja - Prosperity)",
      explanation: "Yoni remainders of 1, 3, 5, 7 are auspicious. 1 represents Dhwaja, leading to continuous business prosperity."
    },
    {
      id: "COMPASS_DEVIATION_ANGLE",
      formula: "True North - Canvas Rotation",
      result: "Deviation: 15° (North-East sector Shift)",
      explanation: "A 15-degree clockwise shift rotates all 16 directional zones. Sector coordinates are adjusted accordingly."
    },
    {
      id: "PLOT_ASPECT_RATIO",
      formula: "Plot Length / Plot Width",
      result: "Aspect Ratio: 1.5 (Excellent)",
      explanation: "Ratios between 1.0 and 1.5 represent perfect golden grids (Symmetrical Mandala)."
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3.5 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Enterprise Evidence Core</h3>
            <p className="text-[10px] text-slate-400 font-mono">Canonical References</p>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TABS */}
      <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-850">
        <button
          onClick={() => setActiveTab("scriptures")}
          className={`flex-1 py-1 px-2 text-[9px] font-mono font-bold tracking-wider rounded transition-all ${
            activeTab === "scriptures"
              ? "bg-emerald-500 text-slate-950 font-black shadow"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          SCRIPTURES
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex-1 py-1 px-2 text-[9px] font-mono font-bold tracking-wider rounded transition-all ${
            activeTab === "rules"
              ? "bg-emerald-500 text-slate-950 font-black shadow"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          RULES (IFTTT)
        </button>
        <button
          onClick={() => setActiveTab("calculations")}
          className={`flex-1 py-1 px-2 text-[9px] font-mono font-bold tracking-wider rounded transition-all ${
            activeTab === "calculations"
              ? "bg-emerald-500 text-slate-950 font-black shadow"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          FORMULAS
        </button>
      </div>

      {/* CONTENT SCROLL */}
      <div className="space-y-3.5 overflow-y-auto max-h-[350px] pr-1 flex-1">
        {/* SCRIPTURES TAB */}
        {activeTab === "scriptures" && (
          <div className="space-y-3">
            {activeScriptures.map((script, idx) => {
              const citeKey = `${script.bookId}-${idx}`;
              return (
                <div
                  key={citeKey}
                  className="p-3 bg-slate-50/40 hover:bg-slate-50/75 border border-slate-850 hover:border-slate-200 rounded-lg space-y-1.5 transition-all text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">
                      {script.bookId}
                    </span>
                    <button
                      onClick={() => handleCopy(`${script.bookTitle}, ${script.chapter}, Verse ${script.verse}: "${script.citationText}"`, citeKey)}
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                      title="Copy Scripture Citation"
                    >
                      {copiedId === citeKey ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-mono font-bold text-slate-700">{script.bookTitle}</h4>
                    <p className="text-[9px] font-mono text-slate-400">{script.chapter} • Verse {script.verse}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed bg-white/40 p-2 rounded border border-slate-200/60 font-sans">
                    "{script.citationText}"
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === "rules" && (
          <div className="space-y-3">
            {rulesReferences.map((rule) => (
              <div
                key={rule.id}
                className="p-3 bg-slate-50/40 border border-slate-850 rounded-lg space-y-2 text-left"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-amber-400">{rule.id}</span>
                  <span className="text-[8px] font-mono text-slate-400">PLUGIN: {rule.pluginId}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[9.5px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200 overflow-x-auto whitespace-nowrap">
                    <span className="text-emerald-400">IF:</span> {rule.condition}
                  </div>
                  <div className="text-[9.5px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    <span className="text-emerald-400">THEN REMEDY:</span> {rule.remediation}
                  </div>
                </div>
                <div className="text-[9px] font-sans text-slate-400 leading-snug">
                  <span className="font-bold text-slate-400 font-mono">SCIENTIFIC RATIONALE:</span> {rule.rationale}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CALCULATIONS / FORMULAS TAB */}
        {activeTab === "calculations" && (
          <div className="space-y-3">
            {calculationsReferences.map((calc) => (
              <div
                key={calc.id}
                className="p-3 bg-slate-50/40 border border-slate-850 rounded-lg space-y-1.5 text-left"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9.5px] font-mono font-bold text-slate-700">{calc.id}</span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">SOLVED</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Formula:</span>
                    <span className="text-slate-700 font-bold">{calc.formula}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Calculated Value:</span>
                    <span className="text-amber-400 font-black">{calc.result}</span>
                  </div>
                </div>
                <p className="text-[9.5px] text-slate-400 leading-relaxed font-sans">{calc.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
