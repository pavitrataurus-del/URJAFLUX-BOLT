import React from "react";
import {
  MousePointer2,
  Hand,
  MapPin,
  Minus,
  LayoutGrid,
  DoorOpen,
  AppWindow,
  Grid3X3,
  Undo2,
  Redo2,
  Eraser,
  BedDouble,
  Sofa,
  Armchair,
  Table2,
  UtensilsCrossed,
  Shirt,
  Monitor,
  Bath,
  Droplets,
  Flame,
  Car,
} from "lucide-react";
import type { ArchitectDrawTool } from "./architectDrawUtils";
import { getToolHint } from "./architectDrawUtils";
import { FIXTURE_CATALOG } from "./architectFixtures";

interface ArchitectFloorPlanToolbarProps {
  canvasTheme: "light" | "dark";
  activeTool: ArchitectDrawTool;
  snapEnabled: boolean;
  roomCount: number;
  wallCount: number;
  plotDrawn: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: ArchitectDrawTool) => void;
  onToggleSnap: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const STRUCTURE_TOOLS: { id: ArchitectDrawTool; label: string; icon: React.ElementType }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "pan", label: "Pan", icon: Hand },
  { id: "eraser", label: "Eraser", icon: Eraser },
  { id: "plot", label: "Plot", icon: MapPin },
  { id: "wall", label: "Wall", icon: Minus },
  { id: "room", label: "Room", icon: LayoutGrid },
  { id: "door", label: "Door", icon: DoorOpen },
  { id: "window", label: "Window", icon: AppWindow },
];

const FIXTURE_ICONS: Record<string, React.ElementType> = {
  bed: BedDouble,
  sofa: Sofa,
  chair: Armchair,
  table: Table2,
  dining_table: UtensilsCrossed,
  wardrobe: Shirt,
  tv: Monitor,
  toilet: Bath,
  bathtub: Bath,
  sink: Droplets,
  stove: Flame,
  car: Car,
};

export const ArchitectFloorPlanToolbar: React.FC<ArchitectFloorPlanToolbarProps> = ({
  canvasTheme,
  activeTool,
  snapEnabled,
  roomCount,
  wallCount,
  plotDrawn,
  canUndo,
  canRedo,
  onToolChange,
  onToggleSnap,
  onUndo,
  onRedo,
}) => {
  const isDark = canvasTheme === "dark";

  const toolBtn = (id: ArchitectDrawTool, label: string, Icon: React.ElementType) => {
    const active = activeTool === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onToolChange(id)}
        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
          active
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
            : isDark
              ? "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
              : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
        }`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </button>
    );
  };

  return (
    <div className="fixed left-3 right-3 bottom-[4.5rem] z-40 flex flex-col items-center gap-2 pointer-events-none">
      <div
        className={`pointer-events-none px-4 py-2 rounded-xl border text-xs max-w-3xl text-center ${
          isDark
            ? "bg-[#0a0e16]/90 border-white/10 text-slate-300"
            : "bg-white/90 border-slate-200 text-slate-600"
        }`}
        style={{ backdropFilter: "blur(12px)" }}
      >
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Architect mode — </span>
        {getToolHint(activeTool)}
      </div>

      <div
        className={`pointer-events-auto w-full max-w-5xl flex flex-col gap-2 px-3 py-2.5 rounded-2xl border shadow-lg ${
          isDark
            ? "bg-[#0a0e16]/95 border-white/10 shadow-black/40"
            : "bg-white/95 border-slate-200/80 shadow-slate-300/30"
        }`}
        style={{ backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <div
            className={`flex items-center gap-0.5 pr-1 mr-1 border-r shrink-0 ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                canUndo
                  ? isDark
                    ? "hover:bg-white/10 text-slate-200"
                    : "hover:bg-slate-100 text-slate-700"
                  : "opacity-35 cursor-not-allowed text-slate-400"
              }`}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                canRedo
                  ? isDark
                    ? "hover:bg-white/10 text-slate-200"
                    : "hover:bg-slate-100 text-slate-700"
                  : "opacity-35 cursor-not-allowed text-slate-400"
              }`}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          {STRUCTURE_TOOLS.map(({ id, label, icon }) => toolBtn(id, label, icon))}
        </div>

        <div
          className={`flex items-center gap-1 overflow-x-auto pt-1 border-t ${
            isDark ? "border-white/10" : "border-slate-100"
          }`}
        >
          <span
            className={`text-[9px] font-bold uppercase tracking-wider shrink-0 pr-2 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Furnish
          </span>
          {FIXTURE_CATALOG.map((fixture) => {
            const Icon = FIXTURE_ICONS[fixture.toolId] ?? Table2;
            return toolBtn(fixture.toolId as ArchitectDrawTool, fixture.shortLabel, Icon);
          })}
        </div>

        <div
          className={`flex flex-wrap items-center gap-2 text-[10px] shrink-0 pt-1 border-t ${
            isDark ? "border-white/10 text-slate-400" : "border-slate-100 text-slate-500"
          }`}
        >
          <button
            type="button"
            onClick={onToggleSnap}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
              snapEnabled
                ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                : isDark
                  ? "border-white/10"
                  : "border-slate-200"
            }`}
          >
            <Grid3X3 className="w-3 h-3" />
            Snap {snapEnabled ? "ON" : "OFF"}
          </button>
          <span>{plotDrawn ? "Plot ✓" : "Plot — draw first"}</span>
          <span>{wallCount} walls</span>
          <span>{roomCount} rooms</span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectFloorPlanToolbar;
