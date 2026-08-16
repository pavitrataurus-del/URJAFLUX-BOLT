import React, { useState } from "react";
import { Layers, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface Floor {
  id: string;
  name: string;
  level: number;
}

interface FloorSelectionPanelProps {
  floors: Floor[];
  activeFloorId: string;
  onSelectFloor: (floorId: string) => void;
  onAddFloor: (name: string, level: number) => void;
  onDeleteFloor?: (floorId: string) => void;
}

export default function FloorSelectionPanel({
  floors,
  activeFloorId,
  onSelectFloor,
  onAddFloor,
  onDeleteFloor
}: FloorSelectionPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newFloorName, setNewFloorName] = useState("");
  const [newFloorLevel, setNewFloorLevel] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFloorName.trim()) {
      onAddFloor(newFloorName.trim(), newFloorLevel);
      setNewFloorName("");
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Floors</h3>
            <p className="text-[10px] text-slate-400 font-mono">Floor Level Management</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 bg-slate-50 border border-slate-200 hover:border-emerald-500/40 hover:bg-white rounded text-emerald-400 font-mono text-[9px] flex items-center gap-1 font-bold tracking-wider transition-all"
        >
          <Plus className="w-3 h-3" />
          ADD
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-850 space-y-2">
          <div>
            <label className="text-[8px] font-mono text-slate-400 uppercase block mb-1">Floor Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Third Floor"
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[8px] font-mono text-slate-400 uppercase block mb-1">Level (Order Index)</label>
            <input
              type="number"
              value={newFloorLevel}
              onChange={(e) => setNewFloorLevel(parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 text-[9px] font-mono bg-white text-slate-400 hover:text-slate-900 rounded border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 text-[9px] font-mono bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded"
            >
              Confirm
            </button>
          </div>
        </form>
      )}

      <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-0.5">
        {floors.map((f) => {
          const isActive = f.id === activeFloorId;
          return (
            <div
              key={f.id}
              onClick={() => onSelectFloor(f.id)}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-50/40 border-slate-850 hover:border-slate-200 hover:bg-white/30 text-slate-400 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                <span className={`text-xs font-mono ${isActive ? "font-bold text-slate-900" : ""}`}>{f.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-50/80 border border-slate-850">
                  L{f.level}
                </span>
                {onDeleteFloor && floors.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFloor(f.id);
                    }}
                    className="p-1 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                    title="Remove Floor"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
