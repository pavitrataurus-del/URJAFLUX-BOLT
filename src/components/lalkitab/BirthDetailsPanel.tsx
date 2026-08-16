// src/components/lalkitab/BirthDetailsPanel.tsx
import React from "react";
import { Client } from "../../types/app";
import { Calendar, Clock, MapPin, UserCheck, Award, Smile } from "lucide-react";

interface BirthDetailsPanelProps {
  client: Client;
}

export default function BirthDetailsPanel({ client }: BirthDetailsPanelProps) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-lg">
      <div className="border-b border-slate-200 pb-2 mb-3">
        <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Birth Coordinates & Ephemeris Inputs
        </h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          These temporal and spatial parameters form the foundation for all Lal Kitab rule calculations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
        <div className="p-2.5 bg-white/30 border border-slate-200 rounded-lg">
          <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Date of Birth</span>
          <p className="text-slate-200 font-semibold mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {client.dob || "Awaiting Data"}
          </p>
        </div>

        <div className="p-2.5 bg-white/30 border border-slate-200 rounded-lg">
          <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Time of Birth</span>
          <p className="text-slate-200 font-semibold mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            {client.birthTime || "Awaiting Data"}
          </p>
        </div>

        <div className="p-2.5 bg-white/30 border border-slate-200 rounded-lg">
          <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Birth Location</span>
          <p className="text-slate-200 font-semibold mt-1 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {client.birthPlace || "Awaiting Data"}
          </p>
        </div>

        <div className="p-2.5 bg-white/30 border border-slate-200 rounded-lg">
          <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Gender Profile</span>
          <p className="text-slate-200 font-semibold mt-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            {client.gender || "Male"}
          </p>
        </div>

        <div className="p-2.5 bg-white/30 border border-slate-200 rounded-lg">
          <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Linguistic Context</span>
          <p className="text-slate-200 font-semibold mt-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            {client.preferredLanguage || "English"}
          </p>
        </div>

        <div className="p-2.5 bg-white/30 border border-slate-200 rounded-lg">
          <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Marital Status</span>
          <p className="text-slate-200 font-semibold mt-1 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            {client.maritalStatus || "Single"}
          </p>
        </div>
      </div>
    </div>
  );
}
