import React from "react";
import {
  Move,
  RotateCcw,
  RotateCw,
  Trash2,
  X,
  Copy,
  FlipHorizontal2,
  Minus,
  Plus,
} from "lucide-react";
import type { CadEntity } from "../../types/cadEntity";
import { formatArea, formatMeters } from "./architectDrawUtils";

interface ArchitectSelectionBarProps {
  canvasTheme: "light" | "dark";
  entity: CadEntity;
  onMove: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDuplicate: () => void;
  onFlip: () => void;
  onAdjustWidth: (delta: number) => void;
  onAdjustHeight: (delta: number) => void;
  onAdjustLength?: (delta: number) => void;
  onDelete: () => void;
  onDeselect: () => void;
}

const stepBtn = (isDark: boolean) =>
  `p-1 rounded-md border text-[10px] font-bold ${
    isDark
      ? "border-white/10 hover:bg-white/10 text-slate-300"
      : "border-slate-200 hover:bg-slate-100 text-slate-600"
  }`;

export const ArchitectSelectionBar: React.FC<ArchitectSelectionBarProps> = ({
  canvasTheme,
  entity,
  onMove,
  onRotateLeft,
  onRotateRight,
  onDuplicate,
  onFlip,
  onAdjustWidth,
  onAdjustHeight,
  onAdjustLength,
  onDelete,
  onDeselect,
}) => {
  const isDark = canvasTheme === "dark";
  const isWall = entity.type === "Wall";
  const isRoom = entity.type === "Room";

  return (
    <div
      className={`pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 px-3 py-2 rounded-2xl border shadow-lg max-w-3xl ${
        isDark
          ? "bg-[#0a0e16]/95 border-emerald-500/30 shadow-black/40"
          : "bg-white/95 border-emerald-200 shadow-slate-300/30"
      }`}
      style={{ backdropFilter: "blur(16px)" }}
    >
      <div className="flex items-center gap-2 pr-2 mr-1 border-r border-emerald-500/20">
        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Edit
        </span>
        <span className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
          {entity.name}
        </span>
      </div>

      <button type="button" onClick={onMove} title="Move" className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold ${isDark ? "bg-white/10 hover:bg-white/15 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
        <Move className="w-3.5 h-3.5" />
        Move
      </button>

      <button type="button" onClick={onRotateLeft} title="Rotate −15°" className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold ${isDark ? "bg-white/10 hover:bg-white/15 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
        <RotateCcw className="w-3.5 h-3.5" />
        −15°
      </button>
      <button type="button" onClick={onRotateRight} title="Rotate +15°" className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold ${isDark ? "bg-white/10 hover:bg-white/15 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
        <RotateCw className="w-3.5 h-3.5" />
        +15°
      </button>

      <button type="button" onClick={onFlip} title="Flip 180°" className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold ${isDark ? "bg-white/10 hover:bg-white/15 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
        <FlipHorizontal2 className="w-3.5 h-3.5" />
        Flip
      </button>

      <button type="button" onClick={onDuplicate} title="Duplicate" className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold ${isDark ? "bg-white/10 hover:bg-white/15 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
        <Copy className="w-3.5 h-3.5" />
        Copy
      </button>

      {isWall && onAdjustLength && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <span className="text-[10px] text-slate-500">Len</span>
          <button type="button" onClick={() => onAdjustLength(-0.25)} className={stepBtn(isDark)} aria-label="Shorter">
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono w-12 text-center">{formatMeters(entity.width)}</span>
          <button type="button" onClick={() => onAdjustLength(0.25)} className={stepBtn(isDark)} aria-label="Longer">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      {!isWall && (
        <>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <span className="text-[10px] text-slate-500">W</span>
            <button type="button" onClick={() => onAdjustWidth(-0.1)} className={stepBtn(isDark)} aria-label="Narrower">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono w-10 text-center">{entity.width.toFixed(1)}m</span>
            <button type="button" onClick={() => onAdjustWidth(0.1)} className={stepBtn(isDark)} aria-label="Wider">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <span className="text-[10px] text-slate-500">H</span>
            <button type="button" onClick={() => onAdjustHeight(-0.1)} className={stepBtn(isDark)} aria-label="Shorter">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono w-10 text-center">{entity.height.toFixed(1)}m</span>
            <button type="button" onClick={() => onAdjustHeight(0.1)} className={stepBtn(isDark)} aria-label="Taller">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </>
      )}

      {isRoom && (
        <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {formatArea(entity.width, entity.height)}
        </span>
      )}

      <span className={`hidden lg:inline text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        {isWall ? "drag endpoints · eraser removes" : "blue corners = resize"}
      </span>

      <button type="button" onClick={onDelete} title="Delete" className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400">
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <button type="button" onClick={onDeselect} title="Deselect" className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ArchitectSelectionBar;
