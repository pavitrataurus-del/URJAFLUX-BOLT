// src/components/lalkitab/GocharPanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Move, Calendar, RefreshCw, AlertTriangle } from "lucide-react";

interface GocharPanelProps {
  result: LalKitabResult | null;
}

export default function GocharPanel({ result }: GocharPanelProps) {
  if (!result) return null;

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <Move className="w-4 h-4 text-emerald-400" />
            Vedic Gochar (Transit) Dashboard
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Current orbital transits of slow and fast-moving planets through the client's natal houses.
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold bg-white text-slate-400 border border-slate-200 px-2 py-0.5 rounded">
          YEAR 2026 TRANSIT EPHEMERIS
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-xs">
        {/* Current transits table (7 columns) */}
        <div className="lg:col-span-8 space-y-3">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Current Active Transits</span>
          
          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[9px] border-b border-slate-200 uppercase">
                  <th className="p-2.5 font-bold">Planet</th>
                  <th className="p-2.5 font-bold">Transit House</th>
                  <th className="p-2.5 font-bold">Movement</th>
                  <th className="p-2.5 font-bold">Influence Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-950 text-slate-700">
                {result.gochars.map((g) => {
                  const isRetro = g.movement === "Retrograde";
                  const isMal = g.influence.includes("Malefic");

                  return (
                    <tr key={g.planet} className="hover:bg-white/30 transition-all">
                      <td className="p-2.5 font-bold text-slate-200">{g.planet}</td>
                      <td className="p-2.5">House {g.house}</td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isRetro ? "text-amber-500" : "text-slate-400"}`}>
                          {isRetro && <RefreshCw className="w-3 h-3 animate-spin-slow" />}
                          {g.movement}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[10px] font-bold ${
                          isMal ? "text-rose-400" : "text-emerald-400"
                        }`}>
                          {g.influence}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key transit dates (5 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Upcoming Orbital Shifts</span>

          <div className="space-y-2.5">
            {[
              { planet: "Jupiter", desc: "Transiting to Virgo (6th House)", date: "12 Oct 2026", imp: true },
              { planet: "Saturn", desc: "Retrograde concludes in Pisces", date: "15 Nov 2026", imp: false },
              { planet: "Mars", desc: "Enters Leo (5th House) high-velocity", date: "04 Dec 2026", imp: true },
              { planet: "Rahu", desc: "Nodal shift to Aquarius axis", date: "24 Dec 2026", imp: true }
            ].map((transit, idx) => (
              <div 
                key={idx}
                className="p-3 bg-white/30 border border-slate-200 rounded-lg flex flex-col justify-between space-y-1"
              >
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-700">{transit.planet} Shift</span>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.2 rounded">
                    {transit.date}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {transit.desc}
                </p>
                {transit.imp && (
                  <span className="text-[8px] font-bold text-amber-500 flex items-center gap-1 uppercase mt-1">
                    <AlertTriangle className="w-3 h-3" /> Important transit trigger
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
