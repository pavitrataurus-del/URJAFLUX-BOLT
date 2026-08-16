import { Property, Client } from "../../types/app";
import React from "react";
import { Bed, Flame, DoorOpen, Trash2, Lock, Activity, Grid3X3, Layers } from "lucide-react";

// --- SPRINT 5 INTERFACE DEFINITIONS ---
export interface AnnotationItem {
  id: string;
  type: "room" | "symbol" | "note" | "wall" | "door" | "window" | "utility";
  name: string;
  x: number; // local coordinate on floorplan background (pixels)
  y: number; // local coordinate on floorplan background (pixels)
  width?: number; // for room rectangles
  height?: number; // for room rectangles
  symbolType?: "bed" | "stove" | "door" | "toilet" | "safe" | "watertank" | "plants" | "heavy" | "puja" | "wall" | "window" | "utility" | "remedy_brass" | "remedy_lead" | "remedy_copper" | "remedy_camphor";
  color: string; // text color
  bg: string; // bg color
  border: string; // border color
  rotation?: number; // rotation in degrees
  notes?: string;
  element?: "Water" | "Fire" | "Earth" | "Air" | "Space" | "None";
  vastuZone?: "NE" | "SE" | "SW" | "NW" | "N" | "E" | "S" | "W" | "Center";
  customRating?: number; // 0-100 manual modifier or calculated rating

  // NEW: Semantic Metadata for Intelligent Spatial Entities
  subType?: string; // e.g., "master_bedroom", "kitchen", "load_bearing_wall", "mahadwara", "septic_tank"
  widthFt?: number;
  lengthFt?: number;
  thicknessInches?: number; // for walls
  heightFt?: number; // for walls/doors/windows
  remediesApplied?: string[]; // array of active remedy IDs like ["lead_helix"]
}

export interface SpatialAnnotationEngineProps {
  key?: string;
  properties: Property[];
  clients: Client[];
  activeProperty: Property | null;
  onSetActiveProperty: (p: Property | null) => void;
  onUpdatePropertyOffset?: (id: string, offset: number) => void;
  pixelScaleRatio?: number; // mm per pixel (e.g. 25)
  scaleUnit?: "Meters" | "Feet" | "Millimeters";
  compassRotation?: number; // rotation from true North (Sprint 4 outcome)
  annotations?: AnnotationItem[];
  onAnnotationsChange?: (ann: AnnotationItem[]) => void;
  layers?: any;
  onLayersChange?: (layers: any) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  pan?: { x: number; y: number };
  onPanChange?: (pan: { x: number; y: number }) => void;
  measurePoints?: { x: number; y: number }[];
  onMeasurePointsChange?: (points: { x: number; y: number }[]) => void;
  onNavigate?: (view: string) => void;
}

// Pre-defined Symbol Templates for the Palette
export interface SymbolTemplate {
  type: "bed" | "stove" | "door" | "toilet" | "safe" | "watertank" | "plants" | "heavy" | "puja";
  name: string;
  icon: React.ComponentType<any>;
  defaultColor: string;
  defaultBg: string;
  defaultBorder: string;
  element: "Water" | "Fire" | "Earth" | "Air" | "Space" | "None";
  idealZone: string;
  description: string;
}

export const SYMBOL_TEMPLATES: SymbolTemplate[] = [
  {
    type: "bed",
    name: "Master Bed (SW)",
    icon: Bed,
    defaultColor: "text-emerald-400",
    defaultBg: "bg-emerald-950/90",
    defaultBorder: "border-emerald-500/50",
    element: "Earth",
    idealZone: "SW",
    description: "Represents stability and grounding. Belongs in the Pitri (South-West) zone."
  },
  {
    type: "stove",
    name: "Agni Stove (SE)",
    icon: Flame,
    defaultColor: "text-amber-500",
    defaultBg: "bg-amber-950/90",
    defaultBorder: "border-amber-500/50",
    element: "Fire",
    idealZone: "SE",
    description: "Culinary fire regulator. Belongs strictly in the South-East quadrant."
  },
  {
    type: "door",
    name: "Mahadwara Door",
    icon: DoorOpen,
    defaultColor: "text-emerald-400",
    defaultBg: "bg-emerald-950/90",
    defaultBorder: "border-emerald-500/50",
    element: "Space",
    idealZone: "NE",
    description: "The main cosmic entrance portal. Ideal in auspicious grids of North or East."
  },
  {
    type: "watertank",
    name: "Underground Tank",
    icon: Layers,
    defaultColor: "text-cyan-400",
    defaultBg: "bg-cyan-950/90",
    defaultBorder: "border-cyan-500/50",
    element: "Water",
    idealZone: "NE",
    description: "Plentiful storage of water element. Auspicious in North-East (Ishanya)."
  },
  {
    type: "toilet",
    name: "Toilet / Waste",
    icon: Trash2,
    defaultColor: "text-rose-400",
    defaultBg: "bg-rose-950/90",
    defaultBorder: "border-rose-500/50",
    element: "Air",
    idealZone: "NW",
    description: "Elimination outlet. Safe in North-West (Vayu) or South-of-SouthWest."
  },
  {
    type: "safe",
    name: "Wealth Vault",
    icon: Lock,
    defaultColor: "text-yellow-400",
    defaultBg: "bg-yellow-950/90",
    defaultBorder: "border-yellow-500/50",
    element: "Earth",
    idealZone: "N",
    description: "Locker or safety cash box. Best facing North, under Kubera's guidance."
  },
  {
    type: "plants",
    name: "Air Flora / Study",
    icon: Activity,
    defaultColor: "text-teal-400",
    defaultBg: "bg-teal-950/90",
    defaultBorder: "border-teal-500/50",
    element: "Air",
    idealZone: "E",
    description: "Brings positive life force. Ideal in East or North-East study areas."
  },
  {
    type: "puja",
    name: "Puja Mandir",
    icon: Grid3X3,
    defaultColor: "text-fuchsia-400",
    defaultBg: "bg-fuchsia-950/90",
    defaultBorder: "border-fuchsia-500/50",
    element: "Space",
    idealZone: "NE",
    description: "Divine worship center. Must be in the pure North-East (Ishanya) sector."
  }
];

