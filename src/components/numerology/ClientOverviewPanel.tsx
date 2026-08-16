// src/components/numerology/ClientOverviewPanel.tsx
import React from "react";
import { Client } from "../../types/app";
import { User, Phone, Mail, Calendar, MapPin, Briefcase, Globe, Heart } from "lucide-react";

interface ClientOverviewPanelProps {
  client: Client;
  clients: Client[];
  onSelectClient: (id: string) => void;
}

export default function ClientOverviewPanel({
  client,
  clients,
  onSelectClient
}: ClientOverviewPanelProps) {
  return (
    <div className="p-5 bg-white/40 border border-slate-200 rounded-xl space-y-4">
      {/* Selection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-950 pb-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-400" />
            Active UCMS Dossier Link
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Select a client from the Universal CRM database to instantly synchronize numerology.
          </p>
        </div>

        <select
          value={client.id}
          onChange={(e) => onSelectClient(e.target.value)}
          className="bg-slate-50 border border-slate-850 text-slate-200 text-xs rounded px-3 py-2 focus:outline-none font-mono focus:border-emerald-500 cursor-pointer"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name.toUpperCase()} ({c.email})
            </option>
          ))}
        </select>
      </div>

      {/* Grid representation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-3 bg-slate-50/60 border border-slate-200/80 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Client Identity</span>
          <p className="text-slate-200 font-bold flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {client.name}
          </p>
          <span className="text-[9px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/30 uppercase font-bold inline-block">
            {client.status}
          </span>
        </div>

        <div className="p-3 bg-slate-50/60 border border-slate-200/80 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Contact Channels</span>
          <p className="text-slate-700 truncate flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {client.email || "N/A"}
          </p>
          <p className="text-slate-700 truncate flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {client.phone || "N/A"}
          </p>
        </div>

        <div className="p-3 bg-slate-50/60 border border-slate-200/80 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Role & Occupation</span>
          <p className="text-slate-700 flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {client.occupation || "Independent Consultant"}
          </p>
          <p className="text-[10px] text-slate-400">Joined: {client.joinedDate}</p>
        </div>

        <div className="p-3 bg-slate-50/60 border border-slate-200/80 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Social Dynamics</span>
          <p className="text-slate-700 flex items-center gap-1.5 truncate">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            Marital: {client.maritalStatus || "Single"}
          </p>
          <p className="text-slate-700 flex items-center gap-1.5 truncate">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            Lang: {client.preferredLanguage || "English"}
          </p>
        </div>
      </div>
    </div>
  );
}
