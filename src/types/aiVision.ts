export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox2D {
  min: Point2D;
  max: Point2D;
}

export interface RoomDetection {
  id: string;
  name: string; // e.g., "Kitchen", "Master Bedroom", "Living Room"
  confidence: number; // 0.0 to 1.0
  polygon: Point2D[]; // Polygon vertices defining boundaries
  areaMeters?: number;
}

export interface WallDetection {
  id: string;
  type: "exterior" | "interior";
  confidence: number;
  startPoint: Point2D;
  endPoint: Point2D;
  thicknessPx?: number;
}

export interface DoorDetection {
  id: string;
  confidence: number;
  center: Point2D;
  widthPx: number;
  angle: number; // Rotation/swing angle
  isOpen: boolean;
}

export interface WindowDetection {
  id: string;
  confidence: number;
  center: Point2D;
  widthPx: number;
  angle: number; // Orientation angle
}

export interface CompassDetection {
  confidence: number;
  center: Point2D;
  northAngle: number; // Angle in degrees pointing North
}

export interface ScaleDetection {
  confidence: number;
  scaleBarBoundingBox?: BoundingBox2D;
  detectedLengthMeters?: number;
  pixelsPerUnit?: number;
}

export interface OCRLabel {
  id: string;
  text: string;
  confidence: number;
  boundingBox: BoundingBox2D;
}

export interface AIVisionAnalysis {
  id: string; // ID matches project / workspace ID
  projectId: string;
  analyzedAt: string;
  status: "pending" | "processing" | "success" | "failed" | "placeholder";
  analysisState: "placeholder" | "processing" | "completed" | "failed";
  rooms: RoomDetection[];
  walls: WallDetection[];
  doors: DoorDetection[];
  windows: WindowDetection[];
  compass: CompassDetection | null;
  scale: ScaleDetection | null;
  ocrLabels: OCRLabel[];
  rawOutput?: string;
}

export interface FloorPlanValidationResult {
  success: boolean;
  readable: boolean;
  isFloorPlan: boolean;
  confidence: number;
  notes: string;
}

export interface OCRExtractedItem {
  id: string;
  text: string;
  category: "room" | "dimension" | "scale" | "compass" | "annotation" | "other";
  confidence: number;
  boundingBox?: BoundingBox2D;
}

export interface OCRExtractionResult {
  projectId: string;
  extractedAt: string;
  items: OCRExtractedItem[];
}

