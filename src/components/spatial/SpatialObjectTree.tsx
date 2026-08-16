import React, { useState } from 'react';
import {
  Building2,
  Folder,
  Home,
  Square,
  DoorOpen,
  AppWindow,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { FloorPlan } from '../../core/spatial/SpatialTypes';

interface SpatialObjectTreeProps {
  floorPlan: FloorPlan;
  selectedObjectId?: string | null;
  onSelectObject: (id: string, type: string) => void;
}

export const SpatialObjectTree: React.FC<SpatialObjectTreeProps> = ({
  floorPlan,
  selectedObjectId,
  onSelectObject
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    ROOMS: true,
    WALLS: true,
    DOORS: true,
    WINDOWS: true
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          Spatial Entity Tree
        </h3>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {/* Rooms Group */}
        <div>
          <button
            onClick={() => toggleSection('ROOMS')}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold transition"
          >
            <span className="flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              Rooms ({floorPlan.rooms.length})
            </span>
            {openSections.ROOMS ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {openSections.ROOMS && (
            <div className="pl-4 pt-1 space-y-1">
              {floorPlan.rooms.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onSelectObject(r.id, 'ROOM')}
                  className={`p-1.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    selectedObjectId === r.id
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{r.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{r.cardinalDirection}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Walls Group */}
        <div>
          <button
            onClick={() => toggleSection('WALLS')}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold transition"
          >
            <span className="flex items-center gap-2">
              <Square className="w-3.5 h-3.5 text-sky-400" />
              Walls ({floorPlan.walls.length})
            </span>
            {openSections.WALLS ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {openSections.WALLS && (
            <div className="pl-4 pt-1 space-y-1">
              {floorPlan.walls.map((w) => (
                <div
                  key={w.id}
                  onClick={() => onSelectObject(w.id, 'WALL')}
                  className={`p-1.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    selectedObjectId === w.id
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{w.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{w.lengthMeters}m</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doors Group */}
        <div>
          <button
            onClick={() => toggleSection('DOORS')}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold transition"
          >
            <span className="flex items-center gap-2">
              <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
              Doors ({floorPlan.doors.length})
            </span>
            {openSections.DOORS ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {openSections.DOORS && (
            <div className="pl-4 pt-1 space-y-1">
              {floorPlan.doors.map((d) => (
                <div
                  key={d.id}
                  onClick={() => onSelectObject(d.id, 'DOOR')}
                  className={`p-1.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    selectedObjectId === d.id
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{d.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{d.widthMeters}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
