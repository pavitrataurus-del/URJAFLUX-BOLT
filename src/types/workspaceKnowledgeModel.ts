import { Client, Property, Project } from "./app";
import { Workspace } from "../services/workspaceService";

export interface WorkspaceObject {
  id: string;
  type: "object" | "room" | "note";
  name: string;
  iconName?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  bg: string;
  border: string;
  text?: string;
  index?: number;
}

export interface WorkspaceAnnotation {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  bg?: string;
  border?: string;
  text?: string;
  points?: { x: number; y: number }[];
  distance?: string;
  rotation?: number;
  symbolType?: string;
  notes?: string;
  element?: string;
  vastuZone?: string;
  customRating?: number;
}

export interface WorkspaceMeasurement {
  id: string;
  name: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  distance: string;
  unit: string;
  isLocked?: boolean;
}

export interface WorkspacePhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  timestamp?: string;
}

export interface WorkspaceKnowledgeModel {
  client: Client | null;
  property: Property | null;
  project: Project | null;
  workspace: Workspace | null;
  objects: WorkspaceObject[];
  annotations: WorkspaceAnnotation[];
  measurements: WorkspaceMeasurement[];
  compass: {
    northAngle: number;
    northType?: "True" | "Magnetic";
    magneticDeviation?: number;
  };
  scale: {
    scale: string;
    isScaleLocked?: boolean;
    scalePoints?: { x: number; y: number }[];
    scaleDistance?: string;
    scaleUnit?: "Meters" | "Feet" | "Millimeters";
    pixelScaleRatio?: number;
  };
  notes: string;
  photos: WorkspacePhoto[];
}
