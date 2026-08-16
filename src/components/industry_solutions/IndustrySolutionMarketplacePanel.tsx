import { useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Download, 
  Star, 
  Tag, 
  AlertTriangle, 
  Layers 
} from "lucide-react";
import { MarketplacePackageItem } from "../../types/industrySolutions";
import { MARKETPLACE_PACKAGE_ITEMS } from "../../services/industry_solutions/industrySolutionsService";

export const IndustrySolutionMarketplacePanel = () => {
  const [items, setItems] = useState<MarketplacePackageItem[]>(MARKETPLACE_PACKAGE_ITEMS);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [installedIds, setInstalledIds] = useState<string[]>(["MKT-CONST-PACK-01", "MKT-MFG-AI-03"]);

  const filteredItems = items.filter(item => {
    const matchesType = selectedType === "ALL" || item.packageType === selectedType;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.industryId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleInstallPackage = (id: string) => {
    if (!installedIds.includes(id)) {
      setInstalledIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <ShoppingBag className="w-4 h-4" />
            <span>MODULE 14 • URJAFLUX INDUSTRY SOLUTION MARKETPLACE</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Industry Extension Ecosystem</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and activate certified Industry Packs, Knowledge Libraries, AI Agents, Workflow Templates, and Dashboard Extensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
            {installedIds.length} PACKS INSTALLED
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "INDUSTRY_PACK", "KNOWLEDGE_PACK", "AI_PACK", "WORKFLOW_PACK", "DASHBOARD_PACK"].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === type
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search packs or domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* MARKETPLACE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isInstalled = installedIds.includes(item.id);
          return (
            <div key={item.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                    {item.packageType}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.industryId}</span>
                </div>

                <h4 className="text-xs font-bold text-white">{item.name}</h4>
                <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{item.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-850">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>Publisher: <strong className="text-slate-200 font-mono">{item.publisher}</strong></span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                    <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                  </span>
                </div>

                {item.compatibilityStatus === "REQUIRES_DEPENDENCY" && (
                  <div className="text-[10px] text-amber-300 font-sans flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Requires External Data Credentials</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-white">{item.priceTier}</span>
                  <button
                    onClick={() => handleInstallPackage(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isInstalled
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Activate Pack</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
