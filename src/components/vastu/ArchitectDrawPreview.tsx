import React from "react";
import type { DrawDraft } from "./architectDrawUtils";
import { formatArea, formatMeters, rectFromCorners } from "./architectDrawUtils";

interface ArchitectDrawPreviewProps {
  draft: DrawDraft | null;
  ppm: number;
}

export const ArchitectDrawPreview: React.FC<ArchitectDrawPreviewProps> = ({ draft, ppm }) => {
  if (!draft?.active) return null;

  const { start, current, tool } = draft;

  if (tool === "wall") {
    return (
      <line
        x1={start.x * ppm}
        y1={-start.y * ppm}
        x2={current.x * ppm}
        y2={-current.y * ppm}
        stroke="#475569"
        strokeWidth={Math.max(0.25 * ppm, 6)}
        strokeLinecap="square"
        opacity={0.85}
        pointerEvents="none"
      />
    );
  }

  if (tool === "plot" || tool === "room") {
    const rect = rectFromCorners(start, current);
    const w = rect.width * ppm;
    const h = rect.height * ppm;
    const cx = rect.x * ppm;
    const cy = -rect.y * ppm;
    const isPlot = tool === "plot";

    return (
      <g transform={`translate(${cx}, ${cy})`} pointerEvents="none" opacity={0.75}>
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill={isPlot ? "rgba(245,158,11,0.08)" : "rgba(59,130,246,0.12)"}
          stroke={isPlot ? "#d97706" : "#2563eb"}
          strokeWidth={1.5}
          strokeDasharray={isPlot ? "6 3" : undefined}
        />
        <text x={0} y={0} textAnchor="middle" className="text-[10px] font-semibold fill-slate-600">
          {formatMeters(rect.width)} × {formatMeters(rect.height)}
        </text>
        <text x={0} y={14} textAnchor="middle" className="text-[9px] fill-slate-500">
          {formatArea(rect.width, rect.height)}
        </text>
      </g>
    );
  }

  return null;
};

export default ArchitectDrawPreview;
