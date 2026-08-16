import type { CadEntity, CadEntityType } from "../../types/cadEntity";
import { FIXTURE_BY_TOOL, FIXTURE_BY_TYPE, FIXTURE_CATALOG, type FurnitureToolId } from "./architectFixtures";

export type ArchitectDrawTool =
  | "select"
  | "pan"
  | "eraser"
  | "plot"
  | "wall"
  | "room"
  | "door"
  | "window"
  | FurnitureToolId;

export interface WorldPoint {
  x: number;
  y: number;
}

export interface DrawDraft {
  tool: ArchitectDrawTool;
  start: WorldPoint;
  current: WorldPoint;
  active: boolean;
}

const SNAP_M = 0.25;
const MIN_ROOM_M = 0.6;
const MIN_WALL_M = 0.4;

const DRAG_DRAW_TOOLS: ArchitectDrawTool[] = ["plot", "wall", "room"];
const OPENING_TOOLS: ArchitectDrawTool[] = ["door", "window"];

export function isDragDrawTool(tool: ArchitectDrawTool): boolean {
  return DRAG_DRAW_TOOLS.includes(tool);
}

export function isClickPlaceTool(tool: ArchitectDrawTool): boolean {
  return OPENING_TOOLS.includes(tool) || FIXTURE_CATALOG.some((f) => f.toolId === tool);
}

export function toolToEntityType(tool: ArchitectDrawTool): CadEntityType | null {
  if (tool === "door") return "Door";
  if (tool === "window") return "Window";
  const fixture = FIXTURE_BY_TOOL[tool];
  return fixture?.type ?? null;
}

export function screenToWorldMeters(
  clientX: number,
  clientY: number,
  viewOriginX: number,
  viewOriginY: number,
  panX: number,
  panY: number,
  ppm: number,
  zoom: number
): WorldPoint {
  return {
    x: (clientX - viewOriginX - panX) / (ppm * zoom),
    y: -(clientY - viewOriginY - panY) / (ppm * zoom),
  };
}

export function snapWorldPoint(p: WorldPoint, enabled: boolean): WorldPoint {
  if (!enabled) return p;
  return {
    x: Math.round(p.x / SNAP_M) * SNAP_M,
    y: Math.round(p.y / SNAP_M) * SNAP_M,
  };
}

export function rectFromCorners(a: WorldPoint, b: WorldPoint) {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function formatMeters(value: number): string {
  return `${value.toFixed(2)} m`;
}

export function formatArea(width: number, height: number): string {
  return `${(width * height).toFixed(1)} m²`;
}

function nextLabel(type: CadEntityType, entities: CadEntity[]): string {
  const count = entities.filter((e) => e.type === type).length + 1;
  const fixture = FIXTURE_BY_TYPE[type];
  if (fixture) return `${fixture.label} ${count}`;
  const names: Partial<Record<CadEntityType, string>> = {
    Plot: "Plot Boundary",
    Room: `Room ${count}`,
    Wall: `Wall ${count}`,
    Door: `Door ${count}`,
    Window: `Window ${count}`,
  };
  return names[type] ?? `${type} ${count}`;
}

export function entityFromRectDrag(
  type: "Plot" | "Room",
  start: WorldPoint,
  end: WorldPoint,
  entities: CadEntity[]
): CadEntity | null {
  const rect = rectFromCorners(start, end);
  if (rect.width < MIN_ROOM_M || rect.height < MIN_ROOM_M) return null;

  return {
    id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: type === "Plot" ? "Plot Boundary" : nextLabel("Room", entities),
    layer: type === "Plot" ? "Site" : "Rooms",
    type,
    x: rect.x,
    y: rect.y,
    z: 0,
    width: rect.width,
    height: rect.height,
    rotation: 0,
    material: type === "Plot" ? "Site" : "Interior",
    vastu: "Neutral",
    energy: "Balanced",
    status: "Proposed",
    points: [],
    source: "USER",
    category: "CATEGORY_C",
  };
}

export function entityFromWallDrag(
  start: WorldPoint,
  end: WorldPoint,
  entities: CadEntity[]
): CadEntity | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < MIN_WALL_M) return null;

  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: nextLabel("Wall", entities),
    layer: "Architecture",
    type: "Wall",
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
    z: 0,
    width: length,
    height: 0.25,
    rotation: angleDeg,
    material: "Masonry",
    vastu: "Neutral",
    energy: "Balanced",
    status: "Proposed",
    points: [
      { x: start.x, y: start.y, label: "start" },
      { x: end.x, y: end.y, label: "end" },
    ],
    source: "USER",
    category: "CATEGORY_C",
  };
}

export function getWallEndpoints(wall: CadEntity): [WorldPoint, WorldPoint] {
  if (wall.points.length >= 2) {
    return [
      { x: wall.points[0].x, y: wall.points[0].y },
      { x: wall.points[1].x, y: wall.points[1].y },
    ];
  }
  const half = wall.width / 2;
  const rad = ((wall.rotation ?? 0) * Math.PI) / 180;
  return [
    { x: wall.x - Math.cos(rad) * half, y: wall.y - Math.sin(rad) * half },
    { x: wall.x + Math.cos(rad) * half, y: wall.y + Math.sin(rad) * half },
  ];
}

export function wallFromEndpoints(start: WorldPoint, end: WorldPoint, wall: CadEntity): CadEntity {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < MIN_WALL_M) return wall;

  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    ...wall,
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
    width: length,
    rotation: angleDeg,
    points: [
      { x: start.x, y: start.y, label: "start" },
      { x: end.x, y: end.y, label: "end" },
    ],
  };
}

export function rotateWallByDegrees(wall: CadEntity, deltaDeg: number): CadEntity {
  const [start, end] = getWallEndpoints(wall);
  const cx = wall.x;
  const cy = wall.y;
  const rad = (deltaDeg * Math.PI) / 180;
  const rotatePoint = (p: WorldPoint): WorldPoint => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  };
  return wallFromEndpoints(rotatePoint(start), rotatePoint(end), wall);
}

export function rotateEntityByDegrees(entity: CadEntity, deltaDeg: number): CadEntity {
  if (entity.type === "Wall") return rotateWallByDegrees(entity, deltaDeg);
  return {
    ...entity,
    rotation: (((entity.rotation ?? 0) + deltaDeg) % 360 + 360) % 360,
  };
}

export function rotationFromWorldPoint(entity: CadEntity, point: WorldPoint): number {
  const dx = point.x - entity.x;
  const dy = point.y - entity.y;
  return (((Math.atan2(dx, dy) * 180) / Math.PI) % 360 + 360) % 360;
}

export function getRotationHandlePosition(entity: CadEntity): WorldPoint {
  if (entity.type === "Wall") {
    const [start, end] = getWallEndpoints(entity);
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    return { x: mx + nx * 0.45, y: my + ny * 0.45 };
  }
  const rad = ((entity.rotation ?? 0) * Math.PI) / 180;
  const dist = Math.max(entity.width, entity.height) / 2 + 0.35;
  return {
    x: entity.x + Math.sin(rad) * dist,
    y: entity.y + Math.cos(rad) * dist,
  };
}

export type WallEndpoint = "start" | "end";

export function entityFromClickPlacement(
  type: CadEntityType,
  point: WorldPoint,
  entities: CadEntity[]
): CadEntity {
  const fixture = FIXTURE_BY_TYPE[type];
  const openingSizes: Partial<Record<CadEntityType, { w: number; h: number; layer: string }>> = {
    Door: { w: 1.0, h: 0.15, layer: "Openings" },
    Window: { w: 1.2, h: 0.12, layer: "Openings" },
  };
  const opening = openingSizes[type];

  return {
    id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: nextLabel(type, entities),
    layer: fixture?.layer ?? opening?.layer ?? "Furniture",
    type,
    x: point.x,
    y: point.y,
    z: 0,
    width: fixture?.width ?? opening?.w ?? 1,
    height: fixture?.height ?? opening?.h ?? 1,
    rotation: 0,
    material: fixture ? "Fixture" : "Opening",
    vastu: "Neutral",
    energy: "Balanced",
    status: "Proposed",
    points: [],
    source: "USER",
    category: "CATEGORY_C",
  };
}

/** @deprecated use entityFromClickPlacement */
export function entityFromPointClick(
  type: "Door" | "Window",
  point: WorldPoint,
  entities: CadEntity[]
): CadEntity {
  return entityFromClickPlacement(type, point, entities);
}

export function getEntityVisual(entity: CadEntity): { fill: string; stroke: string; label: string } {
  const fixture = FIXTURE_BY_TYPE[entity.type];
  if (fixture) {
    return { fill: fixture.fill, stroke: fixture.stroke, label: fixture.shortLabel };
  }
  const map: Partial<Record<CadEntityType, { fill: string; stroke: string; label: string }>> = {
    Door: { fill: "rgba(16,185,129,0.45)", stroke: "#059669", label: "Door" },
    Window: { fill: "rgba(56,189,248,0.45)", stroke: "#0284c7", label: "Window" },
    Room: { fill: "rgba(59,130,246,0.14)", stroke: "#2563eb", label: entity.name },
    Plot: { fill: "rgba(245,158,11,0.06)", stroke: "#d97706", label: entity.name },
    Wall: { fill: "#475569", stroke: "#334155", label: formatMeters(entity.width) },
  };
  return map[entity.type] ?? { fill: "rgba(148,163,184,0.3)", stroke: "#64748b", label: entity.type };
}

export const ARCHITECT_TOOL_HINTS: Record<string, string> = {
  select: "Select — move, resize (blue corners), rotate (green handle), edit in bar above",
  pan: "Pan — drag canvas to navigate",
  eraser: "Eraser — click any wall, door, or item to remove it",
  plot: "Plot — drag site outline; click item to re-select & correct",
  wall: "Wall — drag new wall; click existing element to select",
  room: "Room — drag room box; click item to re-select",
  door: "Door — click to place; then rotate with handle or −15°/+15°",
  window: "Window — click to place; rotate after placing",
  bed: "Bed — click to place in bedroom",
  sofa: "Sofa — click to place in living area",
  chair: "Chair — click to place",
  table: "Table — click to place",
  dining_table: "Dining table — click to place",
  wardrobe: "Wardrobe — click to place",
  tv: "TV unit — click to place",
  toilet: "Toilet — click to place in bathroom",
  bathtub: "Bathtub — click to place",
  sink: "Sink — click to place",
  stove: "Stove — click to place in kitchen",
  car: "Car — click to place in parking / porch",
};

export function getToolHint(tool: ArchitectDrawTool): string {
  return ARCHITECT_TOOL_HINTS[tool] ?? "Click canvas to place fixture; click item to re-select";
}

export type ResizeHandle = "nw" | "ne" | "se" | "sw";

export function worldToLocal(entity: CadEntity, point: WorldPoint): WorldPoint {
  const rad = (-(entity.rotation ?? 0) * Math.PI) / 180;
  const dx = point.x - entity.x;
  const dy = point.y - entity.y;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

export function localToWorld(entity: CadEntity, lx: number, ly: number): WorldPoint {
  const rad = ((entity.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: entity.x + lx * cos - ly * sin,
    y: entity.y + lx * sin + ly * cos,
  };
}

export function getResizeHandlePositions(entity: CadEntity): Record<ResizeHandle, WorldPoint> {
  const hw = entity.width / 2;
  const hh = entity.height / 2;
  return {
    nw: localToWorld(entity, -hw, hh),
    ne: localToWorld(entity, hw, hh),
    se: localToWorld(entity, hw, -hh),
    sw: localToWorld(entity, -hw, -hh),
  };
}

export function resizeEntityFromHandle(
  entity: CadEntity,
  handle: ResizeHandle,
  dragWorld: WorldPoint,
  minWidth = 0.25,
  minHeight = 0.25
): CadEntity {
  if (entity.type === "Wall") return entity;

  const hw = entity.width / 2;
  const hh = entity.height / 2;
  const oppositeLocal: Record<ResizeHandle, [number, number]> = {
    nw: [hw, -hh],
    ne: [-hw, -hh],
    se: [-hw, hh],
    sw: [hw, hh],
  };
  const [fixLx, fixLy] = oppositeLocal[handle];
  const fixedWorld = localToWorld(entity, fixLx, fixLy);
  const newCenter = {
    x: (fixedWorld.x + dragWorld.x) / 2,
    y: (fixedWorld.y + dragWorld.y) / 2,
  };
  const dx = dragWorld.x - fixedWorld.x;
  const dy = dragWorld.y - fixedWorld.y;
  const rad = ((entity.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const newW = Math.max(minWidth, Math.abs(dx * cos + dy * sin));
  const newH = Math.max(minHeight, Math.abs(-dx * sin + dy * cos));

  return {
    ...entity,
    x: newCenter.x,
    y: newCenter.y,
    width: newW,
    height: newH,
  };
}

export function adjustEntityDimension(
  entity: CadEntity,
  dimension: "width" | "height" | "length",
  delta: number,
  min = 0.25
): CadEntity {
  if (entity.type === "Wall" && dimension === "length") {
    const newLen = Math.max(min, entity.width + delta);
    const rad = ((entity.rotation ?? 0) * Math.PI) / 180;
    const half = newLen / 2;
    const start = { x: entity.x - Math.cos(rad) * half, y: entity.y - Math.sin(rad) * half };
    const end = { x: entity.x + Math.cos(rad) * half, y: entity.y + Math.sin(rad) * half };
    return wallFromEndpoints(start, end, entity);
  }
  if (dimension === "width") {
    return { ...entity, width: Math.max(min, entity.width + delta) };
  }
  return { ...entity, height: Math.max(min, entity.height + delta) };
}

export function flipEntityHorizontal(entity: CadEntity): CadEntity {
  return rotateEntityByDegrees(entity, 180);
}

export function canResizeEntity(entity: CadEntity): boolean {
  return entity.type !== "Wall";
}

export function isEraserTool(tool: ArchitectDrawTool): boolean {
  return tool === "eraser";
}
