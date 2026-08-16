import { isCardinalDirectionMarker } from "../recognition/ocrLabelPolicy";

export type CardinalLabel = "NORTH" | "EAST" | "SOUTH" | "WEST";

export interface OrientationMarker {
  label: CardinalLabel;
  centroid: { x: number; y: number };
  confidence: number;
}

export interface OrientationDetectionResult {
  markers: OrientationMarker[];
  /** Hint: degrees to rotate blueprint so True North (0°) aligns with image-up. */
  suggestedBlueprintRotationOffsetDeg?: number;
}

function normalizeCardinal(text: string): CardinalLabel | null {
  const t = text.trim().toUpperCase().replace(/\./g, "");
  if (t === "NORTH" || t === "N") return "NORTH";
  if (t === "EAST" || t === "E") return "EAST";
  if (t === "SOUTH" || t === "S") return "SOUTH";
  if (t === "WEST" || t === "W") return "WEST";
  return null;
}

function bearingFromCenterToPoint(
  centerX: number,
  centerY: number,
  px: number,
  py: number
): number {
  const dx = px - centerX;
  const dy = py - centerY;
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}

/**
 * Detect orientation margin labels. These are NOT room entities.
 * True North is always 0°; returned offset aligns blueprint to True North.
 */
export function detectOrientationMarkers(
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>,
  imageWidth: number,
  imageHeight: number
): OrientationDetectionResult {
  const markers: OrientationMarker[] = [];
  const marginX = imageWidth * 0.18;
  const marginY = imageHeight * 0.18;
  const centerX = imageWidth / 2;
  const centerY = imageHeight / 2;

  for (const word of words) {
    if (!isCardinalDirectionMarker(word.text)) continue;
    const label = normalizeCardinal(word.text);
    if (!label) continue;

    const cx = (word.bbox.x0 + word.bbox.x1) / 2;
    const cy = (word.bbox.y0 + word.bbox.y1) / 2;
    const onMargin =
      cx < marginX ||
      cx > imageWidth - marginX ||
      cy < marginY ||
      cy > imageHeight - marginY;

    if (!onMargin) continue;

    markers.push({
      label,
      centroid: { x: cx, y: cy },
      confidence: word.confidence,
    });
  }

  const north = markers.find((m) => m.label === "NORTH");
  let suggestedBlueprintRotationOffsetDeg: number | undefined;
  if (north) {
    suggestedBlueprintRotationOffsetDeg = Math.round(
      bearingFromCenterToPoint(centerX, centerY, north.centroid.x, north.centroid.y)
    );
  }

  return { markers, suggestedBlueprintRotationOffsetDeg };
}
