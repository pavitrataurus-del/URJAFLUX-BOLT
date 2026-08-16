// src/components/lalkitab/KundliOverviewPanel.tsx
import React, { useState } from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Compass, Sparkles, AlertCircle } from "lucide-react";

interface KundliOverviewPanelProps {
  result: LalKitabResult | null;
}

export default function KundliOverviewPanel({ result }: KundliOverviewPanelProps) {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  if (!result) {
    return (
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 animate-pulse" />
        <h3 className="text-sm font-mono font-bold text-slate-700 uppercase tracking-wider">
          Awaiting Calculation Engine Execution
        </h3>
        <p className="text-xs text-slate-400 font-mono max-w-sm">
          No birth details provided, or calculations have not been processed. Provide a valid date of birth in UCMS to compile.
        </p>
      </div>
    );
  }

  // Group planets by house for easy mapping
  const planetsByHouse: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) {
    planetsByHouse[i] = [];
  }
  result.planets.forEach((p) => {
    planetsByHouse[p.house].push(p.name);
  });

  // House center positions for labels and planets (SVG coordinates out of 400x400)
  const housePositions: Record<number, { lx: number; ly: number; px: number; py: number }> = {
    1: { lx: 200, ly: 110, px: 200, py: 140 }, // Top middle
    2: { lx: 100, ly: 50, px: 100, py: 75 },   // Top left
    3: { lx: 50, ly: 100, px: 50, py: 125 },   // Left top
    4: { lx: 110, ly: 200, px: 110, py: 225 }, // Left middle
    5: { lx: 50, ly: 300, px: 50, py: 325 },   // Left bottom
    6: { lx: 100, ly: 350, px: 100, py: 375 }, // Bottom left
    7: { lx: 200, ly: 290, px: 200, py: 260 }, // Bottom middle
    8: { lx: 300, ly: 350, px: 300, py: 375 }, // Bottom right
    9: { lx: 350, ly: 300, px: 350, py: 325 }, // Right bottom
    10: { lx: 290, ly: 200, px: 290, py: 225 }, // Right middle
    11: { lx: 350, ly: 100, px: 350, py: 125 }, // Right top
    12: { lx: 300, ly: 50, px: 300, py: 75 }    // Top right
  };

  const selectedHouseData = selectedHouse ? result.houses.find(h => h.number === selectedHouse) : null;

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">
              LAL KITAB TEWA WORKSPACE (KALPURUSH KUNDLI)
            </h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              1st house is always Aries (Natural Zodiac). Select a sector to retrieve structural readings.
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
          Asc: {result.birthDetails.ascendant.split(" ")[0]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Interactive SVG Chart (7 columns) */}
        <div className="md:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[340px] aspect-square bg-white/10 border border-slate-200 rounded-xl p-3 shadow-inner">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full select-none text-[11px] font-mono font-bold"
            >
              {/* Grid Lines */}
              <rect x="0" y="0" width="400" height="400" fill="none" stroke="#1e293b" strokeWidth="2" />
              
              {/* Diagonals */}
              <line x1="0" y1="0" x2="400" y2="400" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="400" y1="0" x2="0" y2="400" stroke="#1e293b" strokeWidth="1.5" />

              {/* Central Diamond */}
              <polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="#1e293b" strokeWidth="1.5" />

              {/* Render Houses */}
              {Object.keys(housePositions).map((hStr) => {
                const hNum = parseInt(hStr);
                const pos = housePositions[hNum];
                const housePlanets = planetsByHouse[hNum];
                const isSelected = selectedHouse === hNum;

                return (
                  <g 
                    key={hNum} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedHouse(isSelected ? null : hNum)}
                  >
                    {/* Invisible hover area approximation */}
                    <circle cx={pos.lx} cy={pos.ly} r="35" fill="transparent" />

                    {/* House Number Identifier */}
                    <rect
                      x={pos.lx - 12}
                      y={pos.ly - 12}
                      width="24"
                      height="18"
                      rx="3"
                      fill={isSelected ? "#4f46e5" : "#020617"}
                      stroke={isSelected ? "#818cf8" : "#334155"}
                      strokeWidth="1"
                    />
                    <text
                      x={pos.lx}
                      y={pos.ly + 1}
                      textAnchor="middle"
                      fill={isSelected ? "#ffffff" : "#64748b"}
                      className="text-[10px]"
                    >
                      {hNum}
                    </text>

                    {/* Planets list in house */}
                    {housePlanets.map((planet, pIdx) => {
                      const offsetMultiplier = pIdx - (housePlanets.length - 1) / 2;
                      const pyOffset = offsetMultiplier * 13;
                      const isMalefic = planet === "Rahu" || planet === "Ketu" || planet === "Saturn" || planet === "Mars";

                      return (
                        <text
                          key={planet}
                          x={pos.px}
                          y={pos.py + pyOffset}
                          textAnchor="middle"
                          fill={isMalefic ? "#f43f5e" : "#fbbf24"}
                          className="text-[10px] tracking-tight hover:underline font-bold transition-all"
                        >
                          {planet.slice(0, 3).toUpperCase()}
                        </text>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Dynamic Sidebar Reading (5 columns) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-3 bg-white/60 border border-slate-200 rounded-lg space-y-2">
            <h5 className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              Ephemeris & Coordinates
            </h5>
            <div className="space-y-1.5 text-xs font-mono text-slate-700">
              <div className="flex justify-between border-b border-slate-950 pb-1">
                <span className="text-slate-400 text-[10px]">Moon Sign:</span>
                <span className="text-slate-200">{result.birthDetails.moonSign}</span>
              </div>
              <div className="flex justify-between border-b border-slate-950 pb-1">
                <span className="text-slate-400 text-[10px]">Sun Sign:</span>
                <span className="text-slate-200">{result.birthDetails.sunSign}</span>
              </div>
              <div className="flex justify-between border-b border-slate-950 pb-1">
                <span className="text-slate-400 text-[10px]">Nakshatra:</span>
                <span className="text-slate-200">{result.birthDetails.nakshatra} (P-{result.birthDetails.pada})</span>
              </div>
              <div className="flex justify-between border-b border-slate-950 pb-1">
                <span className="text-slate-400 text-[10px]">Ayanamsa:</span>
                <span className="text-slate-200 text-[10px]">{result.birthDetails.ayanamsa.split(" / ")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[10px]">Tithi / Yoga:</span>
                <span className="text-slate-200 text-[10px]">{result.birthDetails.tithi} / {result.birthDetails.yoga}</span>
              </div>
            </div>
          </div>

          {/* House Detail Inspector */}
          {selectedHouseData ? (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-emerald-900/60 pb-1">
                <span className="font-bold text-emerald-300">HOUSE {selectedHouseData.number} INSPECTOR</span>
                <span className="text-[10px] text-emerald-400 font-bold">Strength: {selectedHouseData.strength}%</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                {selectedHouseData.observations}
              </p>
              <p className="text-[10px] text-slate-400">
                <strong className="text-slate-400">Prone to:</strong> {selectedHouseData.weakness}
              </p>
              <div className="text-[9px] bg-slate-50/60 p-1.5 rounded text-emerald-400 flex items-center justify-between">
                <span>Occupying Planets:</span>
                <span className="font-bold text-yellow-500 uppercase">{selectedHouseData.relatedPlanets.join(", ")}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs font-mono py-8">
              Click any house number inside the Kundli to inspect specific planetary aspects and house strength.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
