import React, { useState } from "react";
import { 
  Archive, 
  Calendar, 
  Clock, 
  Compass, 
  Filter, 
  Info, 
  Layers, 
  ListFilter, 
  Lock, 
  Search, 
  ShieldAlert, 
  Tag, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { FUTURE_EXPANSION_BACKLOG_ITEMS, RoadmapItem, BacklogStatus, PriorityLevel } from "../../types/futureExpansionBacklog";

export const FutureExpansionBacklogWorkspace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);

  const filteredItems = FUTURE_EXPANSION_BACKLOG_ITEMS.filter((item) => {
    const matchesSearch = 
      item.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reasonDeferred.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || item.currentStatus === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: BacklogStatus) => {
    switch (status) {
      case "Planned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Planned
          </span>
        );
      case "Backlog":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-500/10 text-slate-600 border border-slate-500/20">
            <Archive className="w-3 h-3" /> Backlog
          </span>
        );
      case "Future Vision":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
            <Sparkles className="w-3 h-3" /> Future Vision
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            High Priority
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            Medium Priority
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. MANDATORY BANNER */}
      <div id="backlog-top-banner" className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 shadow-sm text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="font-semibold text-sm tracking-wide text-amber-800 dark:text-amber-300">
            Strategic Product Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-200/90 leading-relaxed">
            This roadmap represents future expansion opportunities. These modules are intentionally deferred to maintain focus on the URJAFLUX Core Vision.
          </p>
        </div>
      </div>

      {/* 2. HEADER TITLE & METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
              Project Planning & Roadmap
            </span>
            <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full border border-slate-200 dark:border-slate-700">
              Deferred Module Backlog
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Future Expansion Backlog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Preserved roadmap metadata, dependencies, deferred rationale, and future phase projections for URJAFLUX industry vertical extensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-center shadow-xs">
            <span className="block text-xs text-slate-400 font-medium">Total Items</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{FUTURE_EXPANSION_BACKLOG_ITEMS.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-center shadow-xs">
            <span className="block text-xs text-slate-400 font-medium">Active Status</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">Deferred</span>
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deferred roadmap initiatives, dependencies, or reasons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Backlog">Backlog</option>
              <option value="Planned">Planned</option>
              <option value="Future Vision">Future Vision</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. BACKLOG CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            id={`backlog-item-${item.id}`}
            onClick={() => setSelectedItem(item)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs flex flex-col justify-between group hover:shadow-md"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 font-semibold">{item.id}</span>
                    {getPriorityBadge(item.priority)}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.moduleName}
                  </h3>
                </div>
                {getStatusBadge(item.currentStatus)}
              </div>

              {/* Purpose */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {item.purpose}
              </p>

              {/* Phase & Dependencies */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Target Phase:
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.estimatedFuturePhase}</span>
                </div>

                <div className="flex items-start justify-between gap-2 text-slate-500">
                  <span className="text-slate-400 shrink-0 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Dependencies:
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-right line-clamp-1">
                    {item.dependencies.join(", ")}
                  </span>
                </div>
              </div>

              {/* Reason Deferred Highlight */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300 block flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Deferred Rationale:
                </span>
                <p className="line-clamp-2 italic text-slate-600 dark:text-slate-400">
                  "{item.reasonDeferred}"
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span>View Full Roadmap Details</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <Archive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">No matching roadmap items found</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting your search query or status filter.</p>
        </div>
      )}

      {/* 5. ROADMAP ITEM DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-slate-400">{selectedItem.id}</span>
                  {getPriorityBadge(selectedItem.priority)}
                  {getStatusBadge(selectedItem.currentStatus)}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedItem.moduleName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-500" /> Module Purpose & Functional Scope
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {selectedItem.purpose}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Estimated Future Phase</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedItem.estimatedFuturePhase}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Current Execution State</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Deactivated (Backlog Only)
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" /> Required System Dependencies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.dependencies.map((dep, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs border border-indigo-200 dark:border-indigo-800/50">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Reason Intentionally Deferred
                </h4>
                <p className="text-slate-600 dark:text-slate-300 italic bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg">
                  "{selectedItem.reasonDeferred}"
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Metadata preserved in URJAFLUX Core
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
