// Module 10: Marketplace Foundation Store UI
import React, { useState } from "react";
import {
  ShoppingBag,
  Star,
  CheckCircle2,
  Download,
  Search,
  Filter,
  ShieldCheck
} from "lucide-react";
import { MarketplaceItem } from "../../types/integrationPlatform";
import { MarketplaceEngine } from "../../core/integration/MarketplaceEngine";

export const MarketplaceFoundationStore: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>(() => MarketplaceEngine.getMarketplaceItems());
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [installedMessage, setInstalledMessage] = useState<string | null>(null);

  const handleFilter = (cat: string) => {
    setSelectedCategory(cat);
    setItems(MarketplaceEngine.getMarketplaceItems(cat));
  };

  const handleInstall = (id: string) => {
    const res = MarketplaceEngine.installMarketplaceItem(id);
    setInstalledMessage(res.message);
    setItems(MarketplaceEngine.getMarketplaceItems(selectedCategory));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 10
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Verified Marketplace
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Enterprise Extension & Knowledge Marketplace
          </h2>
          <p className="text-xs text-slate-300">
            Discover verified plugins, canonical knowledge packs, and pre-built workflow templates.
          </p>
        </div>
      </div>

      {installedMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between">
          <span>{installedMessage}</span>
          <button onClick={() => setInstalledMessage(null)} className="text-emerald-700 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "Energy & Vastu", "Classical Vastu", "Workflow Automation"].map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                  {item.type}
                </span>
                <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {item.rating} ({item.reviewsCount})
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {item.publisher}
                </span>
                <span>{item.downloadsCount} installs</span>
              </div>

              <button
                onClick={() => handleInstall(item.id)}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Install Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
