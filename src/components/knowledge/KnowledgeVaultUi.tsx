import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  accent?: "emerald" | "blue" | "slate" | "violet";
}

const accentMap = {
  emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-200/60 text-emerald-700",
  blue: "from-blue-500/10 to-blue-600/5 border-blue-200/60 text-blue-700",
  slate: "from-slate-500/10 to-slate-600/5 border-slate-200/60 text-slate-700",
  violet: "from-violet-500/10 to-violet-600/5 border-violet-200/60 text-violet-700",
};

export const VaultStatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  accent = "slate",
}) => (
  <div
    className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${accentMap[accent]}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{value}</p>
        <p className="text-[11px] text-slate-500 mt-1">{hint}</p>
      </div>
      <div className="p-2 rounded-xl bg-white/80 border border-white shadow-sm">
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
    </div>
  </div>
);

interface VaultTabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  count?: number;
}

export const VaultTabButton: React.FC<VaultTabButtonProps> = ({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
      active
        ? "bg-white text-emerald-800 shadow-sm border border-emerald-200/80"
        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
    {label}
    {count != null && (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
          active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);
