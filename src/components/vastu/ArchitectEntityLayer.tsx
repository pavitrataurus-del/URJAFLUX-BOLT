import React from "react";
import type { CadEntity } from "../../types/cadEntity";
import {
  formatArea,
  formatMeters,
  getEntityVisual,
  getResizeHandlePositions,
  getRotationHandlePosition,
  getWallEndpoints,
  canResizeEntity,
  type ResizeHandle,
  type WallEndpoint,
} from "./architectDrawUtils";

interface ArchitectEntityLayerProps {
  entities: CadEntity[];
  ppm: number;
  selectedEntityId: string;
  canvasTheme: "light" | "dark";
  eraserActive?: boolean;
  onSelect: (id: string) => void;
  onEntityMouseDown?: (id: string, e: React.MouseEvent) => void;
  onWallEndpointDragStart?: (id: string, endpoint: WallEndpoint, e: React.MouseEvent) => void;
  onRotationHandleDragStart?: (id: string, e: React.MouseEvent) => void;
  onResizeHandleDragStart?: (id: string, handle: ResizeHandle, e: React.MouseEvent) => void;
}

function EntityHandlers({
  id,
  isSelected,
  eraserActive,
  onSelect,
  onEntityMouseDown,
  children,
}: {
  id: string;
  isSelected: boolean;
  eraserActive?: boolean;
  onSelect: (id: string) => void;
  onEntityMouseDown?: (id: string, e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <g
      style={{
        cursor: eraserActive ? "crosshair" : isSelected ? "move" : "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onEntityMouseDown?.(id, e);
      }}
    >
      {children}
    </g>
  );
}

export const ArchitectEntityLayer: React.FC<ArchitectEntityLayerProps> = ({
  entities,
  ppm,
  selectedEntityId,
  canvasTheme,
  eraserActive = false,
  onSelect,
  onEntityMouseDown,
  onWallEndpointDragStart,
  onRotationHandleDragStart,
  onResizeHandleDragStart,
}) => {
  const labelFill = canvasTheme === "light" ? "#1e293b" : "#e2e8f0";
  const dimFill = canvasTheme === "light" ? "#64748b" : "#94a3b8";
  const selectedEntity = entities.find((e) => e.id === selectedEntityId) ?? null;
  const selectedWall = selectedEntity?.type === "Wall" ? selectedEntity : null;

  return (
    <>
      {entities.map((ent) => {
        const isSelected = selectedEntityId === ent.id;
        const stroke = isSelected ? "#10b981" : undefined;
        const strokeWidth = isSelected ? 2.5 : 1.5;
        const visual = getEntityVisual(ent);
        const cx = ent.x * ppm;
        const cy = -ent.y * ppm;
        const w = ent.width * ppm;
        const h = ent.height * ppm;
        const rotation = ent.rotation ?? 0;

        if (ent.type === "Wall") {
          const wallH = Math.max(h, 6);
          return (
            <g key={ent.id} transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
              <EntityHandlers
                id={ent.id}
                isSelected={isSelected}
                eraserActive={eraserActive}
                onSelect={onSelect}
                onEntityMouseDown={onEntityMouseDown}
              >
                <rect
                  x={-w / 2}
                  y={-wallH / 2}
                  width={w}
                  height={wallH}
                  fill={visual.fill}
                  stroke={stroke ?? visual.stroke}
                  strokeWidth={strokeWidth}
                />
                <text
                  x={0}
                  y={-wallH / 2 - 4}
                  textAnchor="middle"
                  className="text-[9px] font-medium pointer-events-none select-none"
                  fill={dimFill}
                >
                  {visual.label}
                </text>
              </EntityHandlers>
            </g>
          );
        }

        if (ent.type === "Plot") {
          return (
            <g key={ent.id} transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
              <EntityHandlers
                id={ent.id}
                isSelected={isSelected}
                eraserActive={eraserActive}
                onSelect={onSelect}
                onEntityMouseDown={onEntityMouseDown}
              >
                <rect
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                  fill={visual.fill}
                  stroke={stroke ?? visual.stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray="8 4"
                />
                <text x={0} y={-4} textAnchor="middle" className="text-[11px] font-bold pointer-events-none" fill="#b45309">
                  {ent.name}
                </text>
                <text x={0} y={10} textAnchor="middle" className="text-[9px] pointer-events-none" fill={dimFill}>
                  {formatMeters(ent.width)} × {formatMeters(ent.height)}
                </text>
              </EntityHandlers>
            </g>
          );
        }

        if (ent.type === "Room") {
          return (
            <g key={ent.id} transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
              <EntityHandlers
                id={ent.id}
                isSelected={isSelected}
                eraserActive={eraserActive}
                onSelect={onSelect}
                onEntityMouseDown={onEntityMouseDown}
              >
                <rect
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                  fill={visual.fill}
                  stroke={stroke ?? visual.stroke}
                  strokeWidth={strokeWidth}
                />
                <text x={0} y={-2} textAnchor="middle" className="text-[11px] font-semibold pointer-events-none" fill={labelFill}>
                  {ent.name}
                </text>
                <text x={0} y={12} textAnchor="middle" className="text-[9px] pointer-events-none" fill={dimFill}>
                  {formatArea(ent.width, ent.height)}
                </text>
              </EntityHandlers>
            </g>
          );
        }

        return (
          <g key={ent.id} transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
            <EntityHandlers
              id={ent.id}
              isSelected={isSelected}
              eraserActive={eraserActive}
              onSelect={onSelect}
              onEntityMouseDown={onEntityMouseDown}
            >
              <rect
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                fill={visual.fill}
                stroke={stroke ?? visual.stroke}
                strokeWidth={strokeWidth}
                rx={ent.type === "Toilet" || ent.type === "Sink" ? 3 : 1}
              />
              <text x={0} y={3} textAnchor="middle" className="text-[8px] font-bold pointer-events-none" fill={labelFill}>
                {visual.label}
              </text>
            </EntityHandlers>
          </g>
        );
      })}

      {selectedWall && !eraserActive && (() => {
        const [start, end] = getWallEndpoints(selectedWall);
        const handleProps = (endpoint: WallEndpoint, hx: number, hy: number) => ({
          cx: hx,
          cy: hy,
          r: 7,
          fill: "#10b981",
          stroke: "#ffffff",
          strokeWidth: 2,
          style: { cursor: "crosshair" as const },
          onMouseDown: (e: React.MouseEvent) => {
            e.stopPropagation();
            onWallEndpointDragStart?.(selectedWall.id, endpoint, e);
          },
        });
        return (
          <g className="pointer-events-auto">
            <line
              x1={start.x * ppm}
              y1={-start.y * ppm}
              x2={end.x * ppm}
              y2={-end.y * ppm}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 3"
              pointerEvents="none"
              opacity={0.7}
            />
            <circle {...handleProps("start", start.x * ppm, -start.y * ppm)} />
            <circle {...handleProps("end", end.x * ppm, -end.y * ppm)} />
          </g>
        );
      })()}

      {selectedEntity && selectedEntity.type !== "Wall" && !eraserActive && (() => {
        const handle = getRotationHandlePosition(selectedEntity);
        const hx = handle.x * ppm;
        const hy = -handle.y * ppm;
        const cx = selectedEntity.x * ppm;
        const cy = -selectedEntity.y * ppm;
        const resizeHandles = canResizeEntity(selectedEntity) ? getResizeHandlePositions(selectedEntity) : null;
        return (
          <g className="pointer-events-auto">
            {resizeHandles &&
              (Object.entries(resizeHandles) as [ResizeHandle, { x: number; y: number }][]).map(
                ([corner, pos]) => (
                  <rect
                    key={corner}
                    x={pos.x * ppm - 5}
                    y={-pos.y * ppm - 5}
                    width={10}
                    height={10}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    rx={1}
                    style={{ cursor: `${corner}-resize` }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onResizeHandleDragStart?.(selectedEntity.id, corner, e);
                    }}
                  />
                )
              )}
            <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.8} />
            <circle
              cx={hx}
              cy={hy}
              r={7}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth={2}
              style={{ cursor: "grab" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onRotationHandleDragStart?.(selectedEntity.id, e);
              }}
            />
          </g>
        );
      })()}
    </>
  );
};

export default ArchitectEntityLayer;
