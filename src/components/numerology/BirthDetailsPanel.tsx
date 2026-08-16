// src/components/numerology/BirthDetailsPanel.tsx
import React from "react";
import { Client } from "../../types/app";
import { Calendar, Clock, MapPin, Globe, Sparkles } from "lucide-react";

interface BirthDetailsPanelProps {
  client: Client;
}

export default function BirthDetailsPanel({ client }: BirthDetailsPanelProps) {
  const hasBirthDetails = client.dob;

  return (
    <div className="p-5 bg-white/40 border border-slate-200 rounded-xl space-y-4">
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Birth Coordinates & Epoch Registry
        </h3>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Verifiable time-space metadata used directly for the high-precision calculations.
        </p>
      </div>

      {!hasBirthDetails ? (
        <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-lg text-amber-300 font-mono text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Awaiting DOB Registry inside the client's CRM profile. Please configure to activate calculation pipeline.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-950/50 border border-emerald-900/30 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">Epoch Date (DOB)</span>
              <p className="text-slate-900 font-bold">{client.dob}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-950/50 border border-emerald-900/30 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">Time of Alignment</span>
              <p className="text-slate-900 font-bold">{client.birthTime || "12:00 (Standard)"}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="p-2 rounded bg-amber-950/50 border border-amber-900/30 text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">Location of Origin</span>
              <p className="text-slate-900 font-bold truncate max-w-[140px]">{client.birthPlace || "Not Specified"}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="p-2 rounded bg-purple-950/50 border border-purple-900/30 text-purple-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">Preferred Lang</span>
              <p className="text-slate-900 font-bold">{client.preferredLanguage || "English"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
