import React from "react";
import { Layout, Square, DoorOpen, AppWindow, MapPin } from "lucide-react";

export type BlankDrawEntityType = "Plot" | "Wall" | "Room" | "Door" | "Window";

interface BlankDrawingToolbarProps {
  canvasTheme: "light" | "dark";
  roomCount: number;
  onInsert: (type: BlankDrawEntityType) => void;
}

const TOOLS: { type: BlankDrawEntityType; label: string; icon: React.ElementType }[] = [
  { type: "Plot", label: "Plot", icon: MapPin },
  { type: "Wall", label: "Wall", icon: Square },
  { type: "Room", label: "Room", icon: Layout },
  { type: "Door", label: "Door", icon: DoorOpen },
  { type: "Window", label: "Window", icon: AppWindow },
];

export const BlankDrawingToolbar: React.FC<BlankDrawingToolbarProps> = ({
  canvasTheme,
  roomCount,
  onInsert,
}) => {
  const isDark = canvasTheme === "dark";

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[4.5rem] z-40 max-w-[calc(100vw-24px)]">
      <div
        className={`flex flex-col sm:flex-row items-center gap-2 px-3 py-2.5 rounded-2xl border shadow-lg ${
          isDark
            ? "bg-[#0a0e16]/92 border-white/10 shadow-black/40"
            : "bg-white/92 border-slate-200/80 shadow-slate-300/30"
        }`}
        style={{ backdropFilter: "blur(16px)" }}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-wide shrink-0 px-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Draw floor plan
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {TOOLS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => onInsert(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                type === "Room"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25"
                  : isDark
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
                    : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
        <span className={`text-[10px] shrink-0 px-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {roomCount} room{roomCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
};

export default BlankDrawingToolbar;
