import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Layers,
  Ruler,
  Maximize,
  Move,
  RotateCw,
  Info
} from 'lucide-react';
import { FloorPlan, Room, Wall, Door, Window, Stair, Coordinate, Layer } from '../../core/spatial/SpatialTypes';

interface CadCanvasViewerProps {
  floorPlan: FloorPlan;
  selectedObjectId?: string | null;
  onSelectObject: (objectId: string, objectType: string) => void;
  activeTool: 'SELECT' | 'MEASURE' | 'NORTH_MARKER';
  onMeasureDistance?: (distMeters: number) => void;
}

export const CadCanvasViewer: React.FC<CadCanvasViewerProps> = ({
  floorPlan,
  selectedObjectId,
  onSelectObject,
  activeTool,
  onMeasureDistance
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [measurePoints, setMeasurePoints] = useState<Coordinate[]>([]);

  // Scale pixels per meter
  const ppm = (floorPlan.scalePixelsPerMeter || 50) * zoomLevel;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.altKey || activeTool === 'SELECT')) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const isLayerVisible = (layerType: string): boolean => {
    const l = floorPlan.layers.find((layer) => layer.type === layerType);
    return l ? l.isVisible : true;
  };

  // Convert floor plan meters to canvas pixel coordinates
  const toPx = (meterX: number, meterY: number) => {
    return {
      x: panOffset.x + meterX * ppm,
      y: panOffset.y + meterY * ppm
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'MEASURE') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = (e.clientX - rect.left - panOffset.x) / ppm;
      const clickY = (e.clientY - rect.top - panOffset.y) / ppm;

      const newPoints = [...measurePoints, { x: clickX, y: clickY }];
      if (newPoints.length === 2) {
        const dx = newPoints[1].x - newPoints[0].x;
        const dy = newPoints[1].y - newPoints[0].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (onMeasureDistance) onMeasureDistance(dist);
        setMeasurePoints([]);
      } else {
        setMeasurePoints(newPoints);
      }
    }
  };

  return (
    <div className="relative w-full h-[580px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden select-none">
      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
        <button
          onClick={() => setZoomLevel((z) => Math.min(3, z + 0.2))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.2))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoomLevel(1);
            setPanOffset({ x: 40, y: 40 });
          }}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-emerald-400 px-2 font-bold">
          {Math.round(zoomLevel * 100)}% Scale
        </span>
      </div>

      {/* Top Right North Compass Indicator */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center">
          <Compass
            className="w-7 h-7 text-emerald-400 transition-transform duration-500"
            style={{ transform: `rotate(${floorPlan.orientation.northAngleDegrees}deg)` }}
          />
          <span className="absolute -top-1 font-mono text-[9px] font-bold text-rose-400">N</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">North Direction</span>
          <span className="text-xs font-mono font-bold text-white">
            {floorPlan.orientation.northAngleDegrees}° True North
          </span>
        </div>
      </div>

      {/* SVG Vector Drawing Canvas */}
      <svg
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <defs>
          {/* Architectural Grid Pattern */}
          <pattern
            id="cadGrid"
            width={floorPlan.grid.minorSpacingMeters * ppm}
            height={floorPlan.grid.minorSpacingMeters * ppm}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${floorPlan.grid.minorSpacingMeters * ppm} 0 L 0 0 0 ${floorPlan.grid.minorSpacingMeters * ppm}`}
              fill="none"
              stroke="#334155"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
          </pattern>
        </defs>

        {/* Render Grid Layer */}
        {isLayerVisible('GRID') && (
          <rect width="100%" height="100%" fill="url(#cadGrid)" />
        )}

        {/* Render Outer Boundary */}
        {floorPlan.outerBoundary && (
          <polygon
            points={floorPlan.outerBoundary.points
              .map((p) => {
                const px = toPx(p.x, p.y);
                return `${px.x},${px.y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        )}

        {/* Render Rooms Polygon Layer */}
        {isLayerVisible('ROOMS') &&
          floorPlan.rooms.map((room) => {
            const pointsStr = room.boundary.points
              .map((p) => {
                const px = toPx(p.x, p.y);
                return `${px.x},${px.y}`;
              })
              .join(' ');

            const centerPx = toPx(room.centroid.x, room.centroid.y);
            const isSelected = selectedObjectId === room.id;

            return (
              <g key={room.id} onClick={(e) => { e.stopPropagation(); onSelectObject(room.id, 'ROOM'); }}>
                <polygon
                  points={pointsStr}
                  fill={isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.4)'}
                  stroke={isSelected ? '#10b981' : '#475569'}
                  strokeWidth={isSelected ? '2.5' : '1'}
                  className="hover:fill-emerald-500/20 cursor-pointer transition"
                />
                <circle cx={centerPx.x} cy={centerPx.y} r="3" fill="#10b981" />
                <text
                  x={centerPx.x}
                  y={centerPx.y - 10}
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none font-sans"
                >
                  {room.name}
                </text>
                <text
                  x={centerPx.x}
                  y={centerPx.y + 12}
                  fill="#a1a1aa"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {room.areaSqMeters} m² ({room.cardinalDirection})
                </text>
              </g>
            );
          })}

        {/* Render Wall Vectors Layer */}
        {isLayerVisible('WALLS') &&
          floorPlan.walls.map((wall) => {
            const p1 = toPx(wall.startPoint.x, wall.startPoint.y);
            const p2 = toPx(wall.endPoint.x, wall.endPoint.y);
            const isSelected = selectedObjectId === wall.id;

            return (
              <g key={wall.id} onClick={(e) => { e.stopPropagation(); onSelectObject(wall.id, 'WALL'); }}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={wall.isExternal ? '#10b981' : isSelected ? '#38bdf8' : '#e2e8f0'}
                  strokeWidth={wall.isExternal ? '6' : '3.5'}
                  strokeLinecap="round"
                  className="hover:stroke-sky-400 cursor-pointer transition"
                />
              </g>
            );
          })}

        {/* Render Doors Layer */}
        {isLayerVisible('DOORS') &&
          floorPlan.doors.map((door) => {
            const p = toPx(door.location.x, door.location.y);
            const isSelected = selectedObjectId === door.id;

            return (
              <g key={door.id} onClick={(e) => { e.stopPropagation(); onSelectObject(door.id, 'DOOR'); }}>
                <circle cx={p.x} cy={p.y} r={isSelected ? '7' : '5'} fill="#f59e0b" className="cursor-pointer" />
                <text x={p.x + 8} y={p.y + 3} fill="#fbbf24" fontSize="9" fontWeight="bold">
                  {door.name}
                </text>
              </g>
            );
          })}

        {/* Render Windows Layer */}
        {isLayerVisible('WINDOWS') &&
          floorPlan.windows.map((win) => {
            const p = toPx(win.location.x, win.location.y);
            const isSelected = selectedObjectId === win.id;

            return (
              <g key={win.id} onClick={(e) => { e.stopPropagation(); onSelectObject(win.id, 'WINDOW'); }}>
                <rect x={p.x - 6} y={p.y - 6} width="12" height="12" fill="#06b6d4" rx="2" className="cursor-pointer" />
              </g>
            );
          })}

        {/* Render Active Measurement Points */}
        {measurePoints.map((pt, idx) => {
          const px = toPx(pt.x, pt.y);
          return <circle key={idx} cx={px.x} cy={px.y} r="5" fill="#f43f5e" />;
        })}
      </svg>
    </div>
  );
};
