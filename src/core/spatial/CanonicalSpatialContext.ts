/**
 * URJAFLUX AI OS — SPRINT 4A.6 (SSOT Consolidation)
 * Canonical Spatial Context DTO
 * 
 * Defines the single, immutable spatial DTO shared across Recognition, Procedural Rules,
 * Decision Engine, Findings, Health Evaluator, Audit Report, UKA, and PDF generator.
 */

import { CanonicalZoneCode, ZoneMetadata } from "./CanonicalZoneRegistry";

export interface Point2D {
  x: number;
  y: number;
  z?: number;
}

export interface BoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface CanonicalSpatialContext {
  /** Unique entity ID (e.g., ENTITY-KITCHEN-0004) */
  readonly entityId: string;
  readonly propertyId: string;
  readonly floorId: string;
  readonly entityType: string;
  
  /** Polygon vertices defining the perimeter */
  readonly polygon: readonly Point2D[];
  /** Center of mass computed via Shoelace algorithm */
  readonly centroid: Point2D;
  /** Axis-aligned bounding box */
  readonly boundingBox: BoundingBox2D;
  
  /** Area in sq units */
  readonly area: number;
  /** Perimeter length */
  readonly perimeter: number;

  /** Geometric bearing from global property centroid (0° to 360°) */
  readonly bearing: number;
  /** Property north rotation offset angle (0° to 360°) */
  readonly northRotation: number;
  /** True compass bearing after applying north rotation */
  readonly adjustedBearing: number;
  
  /** Canonical 16-zone or Brahmasthan code */
  readonly zoneCode: CanonicalZoneCode;
  /** Rich metadata for the assigned zone */
  readonly zoneMetadata: ZoneMetadata;
  
  /** Recognition AI / Vision confidence (0.0 to 1.0) */
  readonly recognitionConfidence: number;
  /** Source of detection (e.g. CAD_PARSER, GEMINI_VISION, MANUAL_ANNOTATION) */
  readonly detectionSource: string;
  
  /** Immutability & provenance tracking */
  readonly geometryVersion: string;
  readonly calculationVersion: string;
  readonly timestamp: number;
}

export interface PropertySpatialContext {
  readonly propertyId: string;
  readonly propertyCentroid: Point2D;
  readonly globalBoundingBox: BoundingBox2D;
  readonly totalArea: number;
  readonly northRotation: number;
  readonly entities: Record<string, CanonicalSpatialContext>;
  readonly geometryVersion: string;
  readonly calculationVersion: string;
  readonly timestamp: number;
}
