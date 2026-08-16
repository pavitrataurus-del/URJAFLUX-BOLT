import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "../../localization/hooks/useTranslation";

interface ClientSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export const ClientSearch: React.FC<ClientSearchProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-emerald-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("client.searchPlaceholder") || "Search clients by name, email, phone or city..."}
        className="w-full bg-white/90 hover:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
      />
    </div>
  );
};
export default ClientSearch;
