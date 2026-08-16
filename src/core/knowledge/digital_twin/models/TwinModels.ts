import { ISpatialGeometry, ISpatialConfidence } from "../../spatial";

export enum TwinLifecycleState {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED"
}

export enum TwinRelationshipType {
  CONTAINS = "CONTAINS",
  INSIDE = "INSIDE",
  ADJACENT_TO = "ADJACENT_TO",
  CONNECTED_TO = "CONNECTED_TO",
  INTERSECTS = "INTERSECTS",
  OVERLAPS = "OVERLAPS",
  OPENS_INTO = "OPENS_INTO",
  BELONGS_TO = "BELONGS_TO",
  ALIGNED_WITH = "ALIGNED_WITH",
  NEAR = "NEAR"
}

export interface ITwinRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: TwinRelationshipType;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface ITwinObject {
  id: string;
  canonicalType: string;
  ontologyReference: string;
  geometry: ISpatialGeometry;
  confidence: ISpatialConfidence;
  namespaceId: string;
  lifecycleState: TwinLifecycleState;
  metadata: Record<string, any>;
  relationships: ITwinRelationship[];
}

export interface ITwinVersionMetadata {
  versionId: string;
  revision: number;
  timestamp: number;
  author: string;
  changeSummary: string;
  rollbackMetadata?: Record<string, any>;
}

export interface IDigitalTwin {
  id: string;
  projectId: string;
  floorId: string;
  name: string;
  version: ITwinVersionMetadata;
  objects: ITwinObject[];
  metadata: Record<string, any>;
}
