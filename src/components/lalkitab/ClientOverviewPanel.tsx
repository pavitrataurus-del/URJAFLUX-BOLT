// src/components/lalkitab/ClientOverviewPanel.tsx
import React from "react";
import { Client } from "../../types/app";
import { User, Phone, Mail, Calendar, Briefcase, Globe, Heart, ShieldCheck } from "lucide-react";

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
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      {/* Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            LAL KITAB UCMS ACTIVE CLIENT INTEGRATION
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Select a profile from the Universal CRM to dynamically synchronize Lal Kitab Kundli parameters.
          </p>
        </div>

        <select
          value={client.id}
          onChange={(e) => onSelectClient(e.target.value)}
          className="bg-white border border-slate-200 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none font-mono focus:border-emerald-500 cursor-pointer"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name.toUpperCase()} ({c.email})
            </option>
          ))}
        </select>
      </div>

      {/* 4-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        {/* Col 1 */}
        <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Identity Name</span>
          <p className="text-slate-200 font-bold flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {client.name}
          </p>
          <span className="text-[9px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/30 border border-emerald-900/30 uppercase font-bold inline-block">
            {client.status}
          </span>
        </div>

        {/* Col 2 */}
        <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Communication Channels</span>
          <p className="text-slate-700 truncate flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {client.email || "N/A"}
          </p>
          <p className="text-slate-700 truncate flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {client.phone || "N/A"}
          </p>
        </div>

        {/* Col 3 */}
        <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Occupation & Role</span>
          <p className="text-slate-700 flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {client.occupation || "Chief Consultant"}
          </p>
          <p className="text-[9px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-600" />
            Dossier: {client.joinedDate || "2026-01-01"}
          </p>
        </div>

        {/* Col 4 */}
        <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Social Demographics</span>
          <p className="text-slate-700 flex items-center gap-1.5 truncate">
            <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            {client.maritalStatus || "Single"}
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
