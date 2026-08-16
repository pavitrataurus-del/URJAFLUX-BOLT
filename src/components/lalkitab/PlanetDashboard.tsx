// src/components/lalkitab/PlanetDashboard.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Sun, Moon, Zap, Award, Flame, RefreshCw, Star, Info } from "lucide-react";

interface PlanetDashboardProps {
  result: LalKitabResult | null;
}

export default function PlanetDashboard({ result }: PlanetDashboardProps) {
  if (!result) return null;

  const getPlanetIcon = (name: string) => {
    switch (name) {
      case "Sun": return <Sun className="w-4 h-4 text-amber-500 animate-pulse" />;
      case "Moon": return <Moon className="w-4 h-4 text-cyan-400" />;
      case "Mars": return <Zap className="w-4 h-4 text-rose-500" />;
      case "Jupiter": return <Award className="w-4 h-4 text-yellow-400" />;
      default: return <Star className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      <div className="border-b border-slate-200 pb-3">
        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-400" />
          Planetary Frequencies & State Matrix
        </h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Lal Kitab attributes specific states (Awake, Asleep, Dharmin) and friendships based on fixed positions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {result.planets.map((planet) => {
          const isMalefic = planet.name === "Rahu" || planet.name === "Ketu" || planet.name === "Saturn" || planet.name === "Mars";
          
          return (
            <div 
              key={planet.name} 
              className="p-3.5 bg-white/40 border border-slate-200 rounded-lg hover:border-slate-200 transition-all flex flex-col justify-between space-y-3.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
                    {getPlanetIcon(planet.name)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">{planet.name.toUpperCase()}</span>
                    <span className="text-[9px] text-slate-400 block">House {planet.house} / Sign {planet.sign}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                    planet.state === "Awake" 
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                      : planet.state === "Dharmin"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                      : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}>
                    {planet.state}
                  </span>
                </div>
              </div>

              {/* Progress Bar Strength */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>PLANETARY STRENGTH</span>
                  <span className="font-bold text-slate-700">{planet.strength}%</span>
                </div>
                <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${planet.strength}%` }}
                  />
                </div>
              </div>

              {/* Badges/States row */}
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-center">
                  <span className="text-slate-400 block uppercase">Friendship</span>
                  <span className="font-bold text-slate-700 truncate">{planet.friendship}</span>
                </div>
                
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-center">
                  <span className="text-slate-400 block uppercase">Dignity</span>
                  <span className={`font-bold ${
                    planet.exalted 
                      ? "text-yellow-400" 
                      : planet.debilitated 
                      ? "text-rose-500" 
                      : "text-slate-400"
                  }`}>
                    {planet.exalted ? "EXALTED" : planet.debilitated ? "DEBILITATED" : "NORMAL"}
                  </span>
                </div>
              </div>

              {/* Combat / Retro Flags */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-950">
                {planet.combust && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/20 text-amber-500 border border-amber-900/20 text-[9px] font-bold">
                    <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                    COMBUST
                  </span>
                )}
                {planet.retrograde && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-900/20 text-[9px] font-bold">
                    <RefreshCw className="w-3 h-3 text-emerald-400 shrink-0" />
                    RETRO
                  </span>
                )}
                {!planet.combust && !planet.retrograde && (
                  <span className="text-[9px] text-slate-600 block italic">No kinetic combustion or retrograde flags.</span>
                )}
              </div>

              {/* Relationship notes */}
              <p className="text-[10px] text-slate-400 leading-relaxed italic bg-slate-50/40 p-2 rounded border border-slate-200">
                {planet.relationshipNotes}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
