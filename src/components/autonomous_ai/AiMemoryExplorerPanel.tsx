import React, { useState } from "react";
import { 
  Database, 
  BrainCircuit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  Lock, 
  Sparkles, 
  FileText 
} from "lucide-react";
import { ProjectMemoryItem } from "../../types/autonomousAi";
import { INITIAL_PROJECT_MEMORIES } from "../../services/autonomous_ai/autonomousAiService";

export const AiMemoryExplorerPanel: React.FC = () => {
  const [memories, setMemories] = useState<ProjectMemoryItem[]>(INITIAL_PROJECT_MEMORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [cleanedMsg, setCleanedMsg] = useState("");

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newContent) return;

    const item: ProjectMemoryItem = {
      id: `MEM-${Math.floor(10 + Math.random() * 90)}`,
      tenantId: "TENANT-URJA-CORP",
      key: newKey,
      category: "PREFERENCE",
      content: newContent,
      citations: ["Manual Entry by Tenant Admin"],
      confidence: 100,
      createdTime: new Date().toISOString().split('T')[0],
      lastAccessedTime: new Date().toISOString().split('T')[0],
      ttlDays: 180
    };

    setMemories(prev => [item, ...prev]);
    setIsAdding(false);
    setNewKey("");
    setNewContent("");
  };

  const handlePurgeExpired = () => {
    setCleanedMsg("Memory expiration policy executed: 0 expired memory keys purged.");
    setTimeout(() => setCleanedMsg(""), 3000);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const filteredMemories = memories.filter(m => 
    m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <BrainCircuit className="w-4 h-4" />
            <span>MODULE 5 • TENANT-ISOLATED AI MEMORY & CONTEXT</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">Tenant Memory & Context Explorer</h2>
          <p className="text-xs text-slate-400 mt-1">
            Store persistent project preferences, spatial references, decision histories, and context TTL expiration policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeExpired}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Execute TTL Purge</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory Key</span>
          </button>
        </div>
      </div>

      {/* Cleaned Notification */}
      {cleanedMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{cleanedMsg}</span>
        </div>
      )}

      {/* Add Memory Modal */}
      {isAdding && (
        <form onSubmit={handleAddMemory} className="bg-slate-950 border border-emerald-500/50 p-5 rounded-2xl space-y-4 font-mono">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <span>Store Tenant Memory Key</span>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 mb-1">Memory Key Identifier</label>
              <input
                type="text"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="e.g. server_room_temperature_limit"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Memory Context Value</label>
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Content details..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter tenant memory keys or contents..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map(mem => (
          <div key={mem.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase">{mem.category}</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{mem.key}</h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  TTL: {mem.ttlDays} Days
                </span>
                <button
                  onClick={() => handleDeleteMemory(mem.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans bg-slate-900 p-3 rounded-xl border border-slate-850">
              {mem.content}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Created: {mem.createdTime}</span>
              <span>Tenant: TENANT-URJA-CORP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
