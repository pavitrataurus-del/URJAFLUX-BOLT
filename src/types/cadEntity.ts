export type EntityCategory = "CATEGORY_A" | "CATEGORY_B" | "CATEGORY_C";

export type EntitySource =
  | "GEOMETRY_ENGINE"
  | "OBJECT_DETECTOR"
  | "OCR"
  | "POLYGON_RECOGNITION"
  | "MULTIMODAL"
  | "USER";

export type CadEntityType =
  | "Wall"
  | "Room"
  | "Door"
  | "Window"
  | "Column"
  | "Stair"
  | "Plot"
  | "Marker"
  | "North"
  | "Text"
  | "Dimension"
  | "Bed"
  | "Sofa"
  | "Chair"
  | "Table"
  | "DiningTable"
  | "Toilet"
  | "Bathtub"
  | "Sink"
  | "Stove"
  | "Wardrobe"
  | "Car"
  | "TV";

export interface CadEntity {
  id: string;
  name: string;
  layer: string;
  type: CadEntityType;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  material: string;
  vastu: string;
  energy: string;
  status: string;
  rotation?: number;
  points: { x: number; y: number; label: string }[];
  category?: EntityCategory;
  source?: EntitySource;
  confidence?: number;
  detectedByReason?: string;
  polygon?: { x: number; y: number }[];
  metadata?: { ocrText?: string };
}
