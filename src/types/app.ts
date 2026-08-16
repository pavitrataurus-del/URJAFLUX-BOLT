import { AIVisionAnalysis } from "./aiVision";
import { 
  WorkspaceObject, 
  WorkspaceMeasurement, 
  WorkspacePhoto, 
  WorkspaceAnnotation 
} from "./workspaceKnowledgeModel";

export interface Client {
  assignedConsultant?: string;
  priority?: string;
  /** Paid subscriber who owns this client record — isolated per member. */
  ownerUserId?: string;
  organizationId?: string;

  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "Active" | "Pending" | "Inactive";
  joinedDate: string;
  avatarUrl?: string;
  address?: string;
  dob?: string;
  birthTime?: string;
  birthPlace?: string;
  occupation?: string;
  familyDetails?: string;
  language?: string;
  reportLanguage?: "English" | "Hindi";
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  preferredLanguage?: string;
  profilePhoto?: string;
  notes?: string;
  // Sprint 13 Birth Registry fields
  birthLatitude?: number;
  birthLongitude?: number;
  birthTimezone?: string;
  birthTimeAccuracy?: "Exact" | "Approximate" | "Unknown";
  birthDataStatus?: "Verified" | "User Entered" | "Incomplete";
  birthAuditLog?: Array<{
    id: string;
    timestamp: string;
    action: string;
    operator: string;
    details: string;
  }>;
  payments?: Array<{
    id: string;
    amount: number;
    date: string;
    status: "Paid" | "Pending";
    module: "Vastu" | "Numerology" | "Lal Kitab" | "Comprehensive";
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: "Blueprint" | "Report" | "ID_Proof" | "Other" | "FloorPlan" | "Contract" | "Invoice" | "Notes";
    url: string;
    date: string;
  }>;
  consultationHistory?: Array<{
    id: string;
    date: string;
    type: "Vastu" | "Numerology" | "Lal Kitab" | "Comprehensive" | "Phone Consultation" | "Site Visit" | "Report Generated" | "Invoice Created" | "Follow-up Completed" | "Created Client" | "Vastu Analysis" | "Numerology Analysis" | "Lal Kitab Consultation";
    notes: string;
    status: string;
  }>;
}

export interface Property {
  id: string;
  ownerUserId?: string;
  organizationId?: string;
  name: string;
  clientId: string;
  ownerName: string; // denormalized for easy lookup
  address: string;
  plotSize: string; // e.g. "2400 sq.ft."
  floors: number;
  constructionStatus: "Planned" | "Under Construction" | "Completed";
  consultationStatus: "Pending" | "In Progress" | "Remedied" | "Verified";
  energyRating?: number; // 0-100 score
  floorplanUrl?: string; // fallback base64 or URL
  directionsOffset?: number; // degrees deviation from true North
  gpsCoordinates?: string;
  compassDeviation?: number;
  latitude?: number;
  longitude?: number;
  facingDirection?: string;
  builtUpArea?: string;
  floorCount?: number;
  floorPlans?: string[];
  compassCalibration?: any;
  analysisHistory?: any[];
  photos?: Array<{
    id: string;
    url: string;
    caption: string;
    date: string;
  }>;
  videos?: Array<{
    id: string;
    url: string;
    caption: string;
    date: string;
  }>;
  measurements?: Array<{
    id: string;
    label: string;
    value: string;
    zone?: string;
  }>;
  siteVisits?: Array<{
    id: string;
    date: string;
    observer: string;
    findings: string;
  }>;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  clientName: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed";
}

export interface VastuRemedy {
  id: string;
  zone: string; // e.g. "North-East (NE)"
  defect: string; // e.g. "Kitchen in NE"
  remedy: string; // e.g. "Install zinc plate under burner, place blue vase"
  scriptureCitation: string; // e.g. "Mayamatam, Ch. 12, Verse 4"
  severity: "High" | "Medium" | "Low";
  status: "Identified" | "Implemented" | "Verified";
}

export interface ProjectReport {
  id: string;
  ownerUserId?: string;
  organizationId?: string;
  title: string;
  propertyId: string;
  propertyName: string;
  clientId: string;
  clientName: string;
  dateCreated: string;
  remedies: VastuRemedy[];
  summaryRating: number; // 0-100 overall score
  consultantNotes: string;
  status: "Draft" | "Approved" | "Sent";
}

export interface ScriptureVerse {
  id: string;
  book: string;
  chapter: string;
  verse: string;
  sanskrit: string;
  translation: string;
  application: string;
  element: string; // "Water" | "Fire" | "Earth" | "Air" | "Space"
}

export interface Drawing {
  id: string;
  name: string;
  fileType: "PDF" | "DWG" | "DXF" | "PNG" | "JPG" | "JPEG" | "WEBP";
  url: string;
  uploadDate: string;
  fileSize: string;
  versionId: string;
}

export interface WorkspaceDigitalTwinDrawing {
  id: string;
  fileName: string;
  originalFileName: string;
  extension: string;
  mimeType: string;
  size: string; // e.g. "2.4 MB" or number of bytes as string
  storagePath: string;
  downloadURL: string;
  uploadedAt: string; // ISO string
  uploadedBy: string;
  version: string; // selected version ID or name
  aiStatus: string; // "Pending", "Success", or other AI status
  drawingType: "PDF" | "PNG" | "JPG" | "JPEG" | "WEBP";
}

export interface WorkspaceDigitalTwin {
  id: string; // matches project ID
  workspaceId: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyName: string;
  workspaceName?: string;
  
  // AI Vision Analysis Foundation
  aiVisionAnalysis?: AIVisionAnalysis | null;
  
  // Floor Plan / Design File
  floorPlanImage: {
    name: string;
    size: string;
    url: string;
  } | null;

  // Drawings list
  drawings: WorkspaceDigitalTwinDrawing[];

  // Space Engineering Layers & State
  northAngle: number;
  scale: string; // e.g., "4.8 Meters (25px/unit)"
  canvasZoom: number;
  canvasOffset: { x: number; y: number };
  layers: {
    original: boolean;
    reference: boolean;
    compass: boolean;
    grid: boolean;
    rooms: boolean;
    objects: boolean;
    notes: boolean;
    futureAi: boolean;
  };
  objects: WorkspaceObject[];
  measurements: WorkspaceMeasurement[];
  photos: WorkspacePhoto[];
  notes: string;
  lastUpdated: string;

  // Sprint 5 Annotations
  annotations?: WorkspaceAnnotation[];
  annotationLayers?: {
    blueprint: boolean;
    grid: boolean;
    rooms: boolean;
    symbols: boolean;
    compassOverlay: boolean;
    vastuZones: boolean;
    measurements: boolean;
  };
  annotationZoom?: number;
  annotationPan?: { x: number; y: number };
  annotationMeasurePoints?: { x: number; y: number }[];

  // Calibration parameters
  calibrationStep?: number;
  northType?: "True" | "Magnetic";
  magneticDeviation?: number;
  isScaleLocked?: boolean;
  scalePoints?: { x: number; y: number }[];
  scaleDistance?: string;
  scaleUnit?: "Meters" | "Feet" | "Millimeters";
  pixelScaleRatio?: number;
  isPropertyLocked?: boolean;
  propertyVertices?: { x: number; y: number }[];
  isBuildingLocked?: boolean;
  buildingVertices?: { x: number; y: number }[];
  propertyObservations?: string;
  pendingQuestions?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectVersion {
  id: string;
  name: string;
  createdDate: string;
  createdBy: string;
  description: string;
  drawings: Drawing[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  type: "created" | "uploaded" | "revision" | "started" | "analysis" | "report";
}

export interface ProjectTask {
  id: string;
  title: string;
  status: "Pending" | "Completed";
  dueDate?: string;
}

export interface FollowUpInfo {
  nextMeeting: string;
  reminder: string;
  pendingTasks: ProjectTask[];
  status: "Pending" | "Scheduled" | "Completed";
}

export interface ProjectNotes {
  privateNotes: string;
  clientQuestions: string;
  siteVisitNotes: string;
  pendingInformation: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  category: "Blueprints" | "Images" | "CAD" | "Documents" | "Reports";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  status: "Uploading" | "Completed" | "Failed";
  progress: number;
  error?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  propertyId: string;
  propertyName: string;
  clientId: string;
  clientName: string;
  projectType: "New Construction" | "Existing Building" | "Renovation" | "Commercial Audit" | "Industrial Audit" | "Apartment" | "Villa" | "House" | "Commercial" | "Office" | "Temple" | "Other";
  description?: string;
  owner?: string;
  status: "Draft" | "In Progress" | "Waiting for Client" | "Completed" | "Archived";
  priority: "High" | "Medium" | "Low";
  createdDate: string;
  lastUpdated: string;
  assignedConsultant: string;
  versions: ProjectVersion[];
  timeline: TimelineEvent[];
  notes: ProjectNotes;
  followUp: FollowUpInfo;
  files?: ProjectFile[];
  isFavorite?: boolean;
  isPinned?: boolean;
  tags?: string[];
  categories?: string[];
  floorCount?: number;
  units?: number;
  measurementSystem?: "Metric" | "Imperial";
  northOrientation?: number;
  timezone?: string;
}
