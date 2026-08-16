export interface ISpatialPoint {
  x: number;
  y: number;
}

export interface ISpatialGeometry {
  vertices: ISpatialPoint[];
  centroid?: ISpatialPoint;
  area?: number;
  rotation?: number;
  dimensions?: { width: number; height: number };
}

export interface ISpatialConfidence {
  ocrConfidence: number;
  ontologyConfidence: number;
  geometryConfidence: number;
  relationshipConfidence: number;
  compositeConfidence: number;
  evidenceChain: string[];
}

export enum SpatialRelationshipType {
  CONTAINS = "CONTAINS",
  ADJACENT = "ADJACENT",
  CONNECTED = "CONNECTED",
  OVERLAPS = "OVERLAPS",
  INSIDE = "INSIDE",
  OUTSIDE = "OUTSIDE",
  NEAR = "NEAR",
  INTERSECTS = "INTERSECTS"
}

export interface ISpatialRelationship {
  id: string;
  sourceObjectId: string;
  targetObjectId: string;
  relationshipType: SpatialRelationshipType;
  confidence: number;
  metadata: Record<string, any>;
}

export interface ISpatialObject {
  id: string;
  documentId: string;
  pageNumber: number;
  canonicalType: string;
  ontologyReference: string;
  geometry: ISpatialGeometry;
  confidence: ISpatialConfidence;
  namespaceId: string;
  relationships: ISpatialRelationship[];
  metadata: Record<string, any>;
}
