export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'FIELD_ENGINEER' | 'END_USER';

export type ValidationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'MANUALLY_EDITED' | 'NEEDS_REINSPECTION';

export type ImageFormat = 'JPG' | 'JPEG' | 'PNG' | 'TIFF' | 'BMP' | 'WebP' | 'PDF_PAGE' | 'CAMERA_PHOTO' | 'DRONE_PHOTO' | 'LIDAR_SNAPSHOT' | 'VIDEO_FRAME';

export type SymbolType =
  | 'DOOR'
  | 'WINDOW'
  | 'WALL_SEGMENT'
  | 'STAIRCASE'
  | 'COLUMN'
  | 'BEAM'
  | 'TOILET_FIXTURE'
  | 'KITCHEN_COUNTER'
  | 'ELECTRICAL_PANEL'
  | 'PLUMBING_RISER'
  | 'FURNITURE'
  | 'NORTH_ARROW'
  | 'DIMENSION_LINE'
  | 'ROOM_LABEL'
  | 'REVISION_BLOCK';

export type DefectType =
  | 'WALL_CRACK'
  | 'DAMPNESS_SEEPAGE'
  | 'WATER_LEAKAGE'
  | 'BROKEN_CONCRETE'
  | 'EXPOSED_REBAR'
  | 'UNFINISHED_MASONRY'
  | 'SAFETY_HAZARD'
  | 'MATERIAL_MISPLACEMENT';

export type DefectSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditTrail {
  createdBy: string;
  updatedBy: string;
  changeLog: string[];
}

export interface BoundingBox {
  x: number; // Normalized 0..1 or pixel relative to image width
  y: number; // Normalized 0..1 or pixel relative to image height
  width: number;
  height: number;
}

export interface PolygonMask {
  points: { x: number; y: number }[];
  isClosed: boolean;
}

export interface ConfidenceScore {
  overallPercent: number; // 0 .. 100
  classConfidence: number;
  boxConfidence: number;
  isHighConfidence: boolean; // >= 80%
}

export interface OCRText {
  id: string;
  text: string;
  confidencePercent: number;
  category: 'ROOM_NAME' | 'DIMENSION' | 'NOTE' | 'GRID_ID' | 'SCALE_INFO' | 'REVISION_NO' | 'TITLE_BLOCK' | 'UNCLASSIFIED';
  boundingBox: BoundingBox;
  parsedNumericValue?: number;
  parsedUnit?: 'm' | 'mm' | 'cm' | 'ft' | 'in';
}

export interface Detection {
  id: string;
  version: number;
  assetId: string;
  symbolType: SymbolType;
  label: string;
  boundingBox: BoundingBox;
  polygonMask?: PolygonMask;
  confidence: ConfidenceScore;
  modelName: string;
  detectedAt: string;
  validationStatus: ValidationStatus;
  reviewerId?: string;
  reviewerNotes?: string;
  manualOverride: boolean;
  associatedOcrTextIds: string[];
  metadata: Record<string, any>;
  audit: AuditTrail;
}

export interface DetectionGroup {
  id: string;
  name: string;
  detectionIds: string[];
  groupType: 'ROOM_ASSEMBLY' | 'WALL_NETWORK' | 'OPENING_SET' | 'DEFECT_CLUSTER';
}

export interface InspectionObservation {
  id: string;
  assetId: string;
  defectType: DefectType;
  severity: DefectSeverity;
  description: string;
  boundingBox: BoundingBox;
  confidencePercent: number;
  locationContext: string;
  detectedAt: string;
  validationStatus: ValidationStatus;
  reviewNotes?: string;
}

export interface ImageAsset {
  id: string;
  version: number;
  projectId: string;
  fileName: string;
  fileFormat: ImageFormat;
  sourceUrl: string;
  widthPx: number;
  heightPx: number;
  resolutionDpi: number;
  fileSizeBytes: number;
  sourceDevice: string;
  capturedAt: string;
  uploadedBy: string;
  status: 'PENDING_PROCESSING' | 'PROCESSING' | 'PROCESSED' | 'ERROR';
  processingHistory: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RecognitionResult {
  id: string;
  assetId: string;
  ocrTexts: OCRText[];
  detections: Detection[];
  observations: InspectionObservation[];
  processedAt: string;
  processingTimeMs: number;
  modelProvider: string;
  overallConfidenceAverage: number;
  candidateVectorLines: { start: { x: number; y: number }; end: { x: number; y: number }; type: string }[];
  candidatePolygons: { points: { x: number; y: number }[]; label: string }[];
}

export interface InspectionSession {
  id: string;
  projectId: string;
  sessionTitle: string;
  inspectorName: string;
  assignedRole: UserRole;
  imageAssetIds: string[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface VisionProject {
  id: string;
  name: string;
  buildingId: string;
  description: string;
  sessionCount: number;
  totalAssetsCount: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}
