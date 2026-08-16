import type { CadEntityType } from "../../types/cadEntity";

export interface FixtureSpec {
  toolId: string;
  type: CadEntityType;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  layer: string;
  fill: string;
  stroke: string;
}

export const FIXTURE_CATALOG: FixtureSpec[] = [
  { toolId: "bed", type: "Bed", label: "Bed", shortLabel: "Bed", width: 2.0, height: 1.6, layer: "Furniture", fill: "rgba(139,92,246,0.35)", stroke: "#7c3aed" },
  { toolId: "sofa", type: "Sofa", label: "Sofa", shortLabel: "Sofa", width: 2.2, height: 0.9, layer: "Furniture", fill: "rgba(168,85,247,0.35)", stroke: "#9333ea" },
  { toolId: "chair", type: "Chair", label: "Chair", shortLabel: "Chair", width: 0.55, height: 0.55, layer: "Furniture", fill: "rgba(192,132,252,0.35)", stroke: "#a855f7" },
  { toolId: "table", type: "Table", label: "Table", shortLabel: "Table", width: 1.2, height: 0.8, layer: "Furniture", fill: "rgba(180,83,9,0.3)", stroke: "#b45309" },
  { toolId: "dining_table", type: "DiningTable", label: "Dining Table", shortLabel: "Dining", width: 1.6, height: 1.0, layer: "Furniture", fill: "rgba(217,119,6,0.3)", stroke: "#d97706" },
  { toolId: "wardrobe", type: "Wardrobe", label: "Wardrobe", shortLabel: "Wardrobe", width: 1.8, height: 0.6, layer: "Furniture", fill: "rgba(120,113,108,0.35)", stroke: "#78716c" },
  { toolId: "tv", type: "TV", label: "TV Unit", shortLabel: "TV", width: 1.4, height: 0.4, layer: "Furniture", fill: "rgba(51,65,85,0.4)", stroke: "#334155" },
  { toolId: "toilet", type: "Toilet", label: "Toilet", shortLabel: "Toilet", width: 0.7, height: 0.7, layer: "Sanitary", fill: "rgba(14,165,233,0.35)", stroke: "#0284c7" },
  { toolId: "bathtub", type: "Bathtub", label: "Bathtub", shortLabel: "Bath", width: 1.7, height: 0.8, layer: "Sanitary", fill: "rgba(56,189,248,0.35)", stroke: "#0ea5e9" },
  { toolId: "sink", type: "Sink", label: "Sink", shortLabel: "Sink", width: 0.6, height: 0.5, layer: "Sanitary", fill: "rgba(125,211,252,0.4)", stroke: "#38bdf8" },
  { toolId: "stove", type: "Stove", label: "Stove", shortLabel: "Stove", width: 0.75, height: 0.6, layer: "Kitchen", fill: "rgba(239,68,68,0.3)", stroke: "#dc2626" },
  { toolId: "car", type: "Car", label: "Car", shortLabel: "Car", width: 4.5, height: 2.0, layer: "Parking", fill: "rgba(71,85,105,0.4)", stroke: "#475569" },
];

export const FIXTURE_BY_TOOL = Object.fromEntries(FIXTURE_CATALOG.map((f) => [f.toolId, f])) as Record<
  string,
  FixtureSpec
>;

export const FIXTURE_BY_TYPE = Object.fromEntries(FIXTURE_CATALOG.map((f) => [f.type, f])) as Partial<
  Record<CadEntityType, FixtureSpec>
>;

export type FurnitureToolId = (typeof FIXTURE_CATALOG)[number]["toolId"];
