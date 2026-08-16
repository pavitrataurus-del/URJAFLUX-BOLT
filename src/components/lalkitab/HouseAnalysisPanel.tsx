// src/components/lalkitab/HouseAnalysisPanel.tsx
import React, { useState } from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Layers, HelpCircle, ArrowRight } from "lucide-react";

interface HouseAnalysisPanelProps {
  result: LalKitabResult | null;
}

export default function HouseAnalysisPanel({ result }: HouseAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<"all" | "kendra" | "trikona">("all");

  if (!result) return null;

  // Kendra: Houses 1, 4, 7, 10
  // Trikona: Houses 1, 5, 9
  const filteredHouses = result.houses.filter((h) => {
    if (activeTab === "kendra") {
      return [1, 4, 7, 10].includes(h.number);
    }
    if (activeTab === "trikona") {
      return [1, 5, 9].includes(h.number);
    }
    return true;
  });

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Vedic House Structural Analysis (Bhavas)
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Detailed investigation of 1st through 12th houses including natural rulerships and strengths.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-1 bg-white p-1 border border-slate-850 rounded-lg text-[10px] font-mono">
          {[
            { id: "all", label: "ALL HOUSES" },
            { id: "kendra", label: "KENDRAS (1,4,7,10)" },
            { id: "trikona", label: "TRIKONAS (1,5,9)" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2 py-1 rounded font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-slate-50 text-emerald-400 border border-slate-200"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* House List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {filteredHouses.map((house) => {
          return (
            <div 
              key={house.number} 
              className="p-4 bg-white/30 border border-slate-200/80 rounded-lg space-y-3 hover:border-slate-200 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-950 pb-2">
                <span className="font-bold text-emerald-400 text-xs">
                  HOUSE {house.number} ({house.number === 1 ? "Lagna/Ascendant" : `Bhava ${house.number}`})
                </span>
                <span className="text-[10px] bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40">
                  Strength: {house.strength}%
                </span>
              </div>

              {/* Occupants */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase shrink-0">PLANETS:</span>
                <div className="flex flex-wrap gap-1">
                  {house.relatedPlanets.map((p) => {
                    const isNone = p === "None";
                    return (
                      <span 
                        key={p} 
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                          isNone 
                            ? "bg-slate-50 text-slate-600 border-slate-950" 
                            : "bg-yellow-950/20 text-yellow-500 border-yellow-900/20"
                        }`}
                      >
                        {p}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50/30 p-2 rounded border border-slate-950">
                {house.observations}
              </p>

              {/* Vulnerabilities */}
              <div className="flex gap-2 items-start text-[10px]">
                <HelpCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-bold">Structural Vulnerabilities</span>
                  <span className="text-slate-400 italic leading-tight">{house.weakness}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
