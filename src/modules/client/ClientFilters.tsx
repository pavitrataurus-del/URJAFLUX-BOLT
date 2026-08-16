import React from "react";
import { Filter, Calendar, Building2, Eye, ShieldAlert } from "lucide-react";

export interface FilterOptions {
  status: "All" | "Active" | "Pending" | "Inactive";
  propertyCount: "All" | "Has Properties" | "No Properties";
  consultationType: "All" | "Vastu" | "Numerology" | "Lal Kitab" | "Comprehensive";
  joinedPeriod: "All" | "This Month" | "This Year";
}

interface ClientFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export const ClientFilters: React.FC<ClientFiltersProps> = ({ filters, onChange, onReset }) => {
  const handleSelectChange = (key: keyof FilterOptions, val: string) => {
    onChange({
      ...filters,
      [key]: val
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white/40 p-3.5 border border-slate-200 rounded-xl">
      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase tracking-wider font-bold">
        <Filter className="w-3.5 h-3.5 text-emerald-400" />
        <span>System Filters:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs flex-1">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Status:</span>
          <select
            value={filters.status}
            onChange={(e) => handleSelectChange("status", e.target.value)}
            className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Property Count Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.propertyCount}
            onChange={(e) => handleSelectChange("propertyCount", e.target.value)}
            className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
          >
            <option value="All">All Property Portfolios</option>
            <option value="Has Properties">Has Properties</option>
            <option value="No Properties">No Properties</option>
          </select>
        </div>

        {/* Consultation Type Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.consultationType}
            onChange={(e) => handleSelectChange("consultationType", e.target.value)}
            className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
          >
            <option value="All">All Consultations</option>
            <option value="Vastu">Vastu</option>
            <option value="Numerology">Numerology</option>
            <option value="Lal Kitab">Lal Kitab</option>
            <option value="Comprehensive">Comprehensive</option>
          </select>
        </div>

        {/* Joined Period Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.joinedPeriod}
            onChange={(e) => handleSelectChange("joinedPeriod", e.target.value)}
            className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
          >
            <option value="All">All Periods</option>
            <option value="This Month">Joined This Month</option>
            <option value="This Year">Joined This Year</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-3.5 py-1.5 text-[10.5px] font-mono border border-emerald-950/40 hover:border-emerald-900/60 text-emerald-400 hover:text-emerald-300 rounded cursor-pointer transition-colors bg-emerald-950/20"
        >
          RESET FILTERS
        </button>
      </div>
    </div>
  );
};
export default ClientFilters;
