/**
 * Blueprint-anchored coordinate resolution for Vastu direction mapping.
 *
 * OCR entity positions are stored as normalized blueprint image coordinates (0–1).
 * At analysis time they are transformed into current world meters using the
 * live blueprint center, size, and rotation — never conflated with canvas pixels.
 */

import { CanonicalSpatialCalculationEngine } from "./CanonicalSpatialCalculationEngine";

export interface BlueprintAnchorFrame {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface BlueprintAnchoredMetadata {
  blueprintNormU?: number;
  blueprintNormV?: number;
  ocrText?: string;
  ocrRawText?: string;
}

/**
 * Convert normalized blueprint UV (image space) to world meters.
 * +X = East, +Y = North; image top = smaller V = North edge.
 */
export function resolveBlueprintAnchoredWorldPoint(
  normU: number,
  normV: number,
  blueprint: BlueprintAnchorFrame
): { x: number; y: number } {
  const bx = blueprint.x ?? 0;
  const by = blueprint.y ?? 0;
  const w = blueprint.width ?? 12;
  const h = blueprint.height ?? 10;
  const rotDeg = blueprint.rotation ?? 0;

  let localX = (normU - 0.5) * w;
  let localY = (0.5 - normV) * h;

  if (rotDeg !== 0) {
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = localX * cos - localY * sin;
    const ry = localX * sin + localY * cos;
    localX = rx;
    localY = ry;
  }

  return {
    x: Math.round((bx + localX) * 100) / 100,
    y: Math.round((by + localY) * 100) / 100,
  };
}

/**
 * Resolve an entity centroid for zone assignment — prefers blueprint-anchored UV,
 * then polygon centroid, then stored x/y.
 */
export function resolveEntityWorldCenter(
  entity: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    polygon?: Array<{ x: number; y: number }>;
    metadata?: BlueprintAnchoredMetadata & Record<string, unknown>;
  },
  blueprint: BlueprintAnchorFrame | null | undefined
): { x: number; y: number } {
  const meta = entity.metadata;
  const normU = meta?.blueprintNormU;
  const normV = meta?.blueprintNormV;

  if (
    blueprint &&
    typeof normU === "number" &&
    typeof normV === "number" &&
    !Number.isNaN(normU) &&
    !Number.isNaN(normV)
  ) {
    return resolveBlueprintAnchoredWorldPoint(normU, normV, blueprint);
  }

  if (entity.polygon && entity.polygon.length >= 3) {
    return CanonicalSpatialCalculationEngine.calculateCentroid(entity.polygon);
  }

  const halfW = (entity.width ?? 0) / 2;
  const halfH = (entity.height ?? 0) / 2;
  if (halfW > 0 || halfH > 0) {
    return { x: entity.x + halfW, y: entity.y + halfH };
  }

  return { x: entity.x, y: entity.y };
}
