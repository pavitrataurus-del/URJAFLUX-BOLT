/**
 * Blueprint Understanding Engine
 *
 * Hybrid pipeline (blueprint understanding, not raw OCR dump):
 * 1. Read all blueprint labels (position-anchored, filtered)
 * 2. Detect orientation markers (N/E/S/W) — never entities
 * 3. When room polygons exist, bind label → polygon inside boundary
 * 4. Every valid label becomes an entity with permanent ID + blueprintNormU/V
 *    so Vastu Chakra zone assignment works after North alignment
 */

import { CadEntity } from "../components/CadBlueprintWorkspace";
import { PropertyRecognitionEngine } from "../recognition/PropertyRecognitionEngine";
import { RawCadOrVisionEntity } from "../recognition/types";
import {
  isStructuralBlueprintLabel,
  isValidBlueprintEntityLabel,
  preserveOcrLabel,
} from "../recognition/ocrLabelPolicy";
import { classifyArchitecturalEntity } from "../recognition/ocrEntityNormalizer";
import { PolygonEngine } from "../core/spatial_recognition/geometry/PolygonEngine";
import { segmentRoomRegionsFromCanvas, type RoomRegion } from "./blueprintRoomSegmenter";
import { detectOrientationMarkers, type OrientationDetectionResult } from "./blueprintOrientationDetector";
import {
  BlueprintIntelligenceEngine,
  mergeOcrDetectionItems,
  type OcrDetectionItem,
} from "./blueprintIntelligenceEngine";

type BlueprintWorldContext = {
  naturalWidth?: number;
  naturalHeight?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
};

export interface BlueprintUnderstandingResult {
  entities: CadEntity[];
  orientation: OrientationDetectionResult;
  roomRegionCount: number;
  labeledRoomCount: number;
  structuralLabelCount: number;
  /** Valid labels accepted for entities */
  detectedLabels: string[];
  entityCount: number;
}

const MAX_REGION_BINDINGS = 35;
const MAX_REGION_OCR_FALLBACK = 14;
const MIN_ENTITY_CONFIDENCE = 0.38;

function isBrowserDomAvailable(): boolean {
  return typeof document !== "undefined" && typeof HTMLCanvasElement !== "undefined";
}

async function loadCanvasFromUrl(url: string): Promise<HTMLCanvasElement> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load blueprint image"));
    image.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0);
  return canvas;
}

function mapPixelToWorld(
  px: number,
  py: number,
  imgWidth: number,
  imgHeight: number,
  blueprint?: BlueprintWorldContext
): { x: number; y: number; normU: number; normV: number } {
  const worldW = blueprint?.width ?? 12;
  const worldH = blueprint?.height ?? 10;
  const worldX = blueprint?.x ?? 0;
  const worldY = blueprint?.y ?? 0;
  const normU = px / imgWidth;
  const normV = py / imgHeight;
  const x = Math.round((worldX + (normU - 0.5) * worldW) * 100) / 100;
  const y = Math.round((worldY + (0.5 - normV) * worldH) * 100) / 100;
  return { x, y, normU, normV };
}

function mapRegionToWorldPolygon(
  region: RoomRegion,
  imgWidth: number,
  imgHeight: number,
  blueprint?: BlueprintWorldContext
): { polygon: Array<{ x: number; y: number }>; normU: number; normV: number } {
  const polygon = region.polygon.map((p) => {
    const mapped = mapPixelToWorld(p.x, p.y, imgWidth, imgHeight, blueprint);
    return { x: mapped.x, y: mapped.y };
  });
  const center = mapPixelToWorld(region.centroid.x, region.centroid.y, imgWidth, imgHeight, blueprint);
  return { polygon, normU: center.normU, normV: center.normV };
}

function labelPixelCenter(item: OcrDetectionItem, imgWidth: number, imgHeight: number): { x: number; y: number } {
  if (typeof item.blueprintNormU === "number" && typeof item.blueprintNormV === "number") {
    return { x: item.blueprintNormU * imgWidth, y: item.blueprintNormV * imgHeight };
  }
  return {
    x: ((item.bbox.x / (imgWidth || 1)) + 0.5) * imgWidth,
    y: (0.5 - item.bbox.y / (imgHeight || 1)) * imgHeight,
  };
}

function labelItemKey(item: OcrDetectionItem): string {
  const u = (item.blueprintNormU ?? 0).toFixed(3);
  const v = (item.blueprintNormV ?? 0).toFixed(3);
  return `${item.text.toLowerCase()}@${u},${v}`;
}

function pushEntityFromLabel(
  item: OcrDetectionItem,
  entityId: string,
  polygon: Array<{ x: number; y: number }> | undefined,
  rawEntities: RawCadOrVisionEntity[],
  consumedLabelKeys: Set<string>
): boolean {
  const key = labelItemKey(item);
  if (consumedLabelKeys.has(key)) return false;
  consumedLabelKeys.add(key);

  const entity = buildRawEntityFromLabel(item, entityId, polygon);
  if (!entity) return false;
  rawEntities.push(entity);
  return true;
}

function detectionItemFromRegionText(
  text: string,
  confidence: number,
  region: RoomRegion,
  imgWidth: number,
  imgHeight: number,
  blueprintData?: BlueprintWorldContext
): OcrDetectionItem | null {
  const rawLabel = preserveOcrLabel(text);
  if (!rawLabel || !isValidBlueprintEntityLabel(rawLabel)) return null;
  const classified = classifyArchitecturalEntity(rawLabel, confidence);
  if (classified.isUnknown && !classified.isStructural) return null;

  const mapped = mapPixelToWorld(region.centroid.x, region.centroid.y, imgWidth, imgHeight, blueprintData);
  const worldPoly = mapRegionToWorldPolygon(region, imgWidth, imgHeight, blueprintData);

  return {
    id: `region_ocr_${region.id}`,
    text: rawLabel,
    confidence,
    bbox: {
      x: mapped.x,
      y: mapped.y,
      width: 2.5,
      height: 2.5,
    },
    polygon: worldPoly.polygon,
    source: "OCR",
    blueprintNormU: mapped.normU,
    blueprintNormV: mapped.normV,
  };
}

function buildRawEntityFromLabel(
  item: OcrDetectionItem,
  id: string,
  polygon?: Array<{ x: number; y: number }>
): RawCadOrVisionEntity | null {
  const rawLabel = preserveOcrLabel(item.text);
  if (!isValidBlueprintEntityLabel(rawLabel)) return null;
  if (item.confidence < MIN_ENTITY_CONFIDENCE) return null;

  const classified = classifyArchitecturalEntity(rawLabel, item.confidence);
  if (classified.isUnknown && !classified.isStructural) return null;

  return {
    id,
    name: classified.normalizedLabel,
    type: classified.isStructural ? "Marker" : "Room",
    x: item.bbox.x,
    y: item.bbox.y,
    width: item.bbox.width,
    height: item.bbox.height,
    polygon: polygon ?? item.polygon,
    metadata: {
      ocrRawText: rawLabel,
      ocrText: classified.normalizedLabel,
      ocrConfidence: item.confidence,
      blueprintNormU: item.blueprintNormU,
      blueprintNormV: item.blueprintNormV,
      entityClassified: true,
      normalizationUnknown: false,
      canonicalType: classified.canonicalType,
      entityCategory: classified.entityCategory,
      ruleElementType: classified.ruleElementType,
      geometryFirst: Boolean(polygon),
    },
  };
}

export class BlueprintUnderstandingEngine {
  public static async understandBlueprint(
    imageUrl: string,
    blueprintData?: BlueprintWorldContext
  ): Promise<BlueprintUnderstandingResult> {
    const empty: BlueprintUnderstandingResult = {
      entities: [],
      orientation: { markers: [] },
      roomRegionCount: 0,
      labeledRoomCount: 0,
      structuralLabelCount: 0,
      detectedLabels: [],
      entityCount: 0,
    };

    if (!imageUrl || !isBrowserDomAvailable()) return empty;

    const rawCanvas = await loadCanvasFromUrl(imageUrl);
    const imgWidth = blueprintData?.naturalWidth ?? rawCanvas.width;
    const imgHeight = blueprintData?.naturalHeight ?? rawCanvas.height;

    const ocrContext = {
      ...blueprintData,
      naturalWidth: imgWidth,
      naturalHeight: imgHeight,
    };

    const primaryOcr = await BlueprintIntelligenceEngine.extractOcrFromImage(imageUrl, ocrContext);
    const supplementalOcr = await BlueprintIntelligenceEngine.extractSupplementalWordOcrFromImage(
      imageUrl,
      ocrContext,
      primaryOcr
    );
    const ocrLabels = mergeOcrDetectionItems(primaryOcr, supplementalOcr);

    const ocrWords = await BlueprintIntelligenceEngine.extractOcrWordsFromImage(imageUrl);
    const orientation = detectOrientationMarkers(ocrWords, imgWidth, imgHeight);

    const validLabels = ocrLabels.filter((item) => isValidBlueprintEntityLabel(preserveOcrLabel(item.text)));
    const detectedLabels = validLabels.map((l) => preserveOcrLabel(l.text));

    const { regions } = segmentRoomRegionsFromCanvas(rawCanvas);
    const bindRegions = regions.length > 0 && regions.length <= MAX_REGION_BINDINGS;

    const consumedLabelKeys = new Set<string>();
    const rawEntities: RawCadOrVisionEntity[] = [];
    let labeledRoomCount = 0;
    let structuralLabelCount = 0;

    if (bindRegions) {
      for (const region of regions) {
        const inside = validLabels.filter((item) => {
          const center = labelPixelCenter(item, imgWidth, imgHeight);
          return PolygonEngine.isPointInPolygon(center, region.polygon);
        });

        if (inside.length === 0) continue;

        const worldPoly = mapRegionToWorldPolygon(region, imgWidth, imgHeight, blueprintData);

        for (let labelIdx = 0; labelIdx < inside.length; labelIdx++) {
          const item = inside[labelIdx];
          const entityId = `${region.id}_lbl_${labelIdx}`;
          if (
            pushEntityFromLabel(item, entityId, worldPoly.polygon, rawEntities, consumedLabelKeys)
          ) {
            if (isStructuralBlueprintLabel(item.text)) {
              structuralLabelCount++;
            } else {
              labeledRoomCount++;
            }
          }
        }
      }

      let regionFallbackCount = 0;
      for (const region of regions) {
        if (regionFallbackCount >= MAX_REGION_OCR_FALLBACK) break;

        const regionHasEntity = rawEntities.some((entity) => entity.id.startsWith(`${region.id}_`));
        if (regionHasEntity) continue;

        const regionOcr = await BlueprintIntelligenceEngine.extractOcrTextFromRegion(
          imageUrl,
          region.bbox
        );
        if (!regionOcr?.text) continue;

        const confidence = (regionOcr.confidence || 0) / 100;
        const item = detectionItemFromRegionText(
          regionOcr.text,
          confidence,
          region,
          imgWidth,
          imgHeight,
          blueprintData
        );
        if (!item) continue;

        const worldPoly = mapRegionToWorldPolygon(region, imgWidth, imgHeight, blueprintData);

        if (
          pushEntityFromLabel(
            item,
            `${region.id}_ocr`,
            worldPoly.polygon,
            rawEntities,
            consumedLabelKeys
          )
        ) {
          regionFallbackCount++;
          if (isStructuralBlueprintLabel(item.text)) {
            structuralLabelCount++;
          } else {
            labeledRoomCount++;
          }
        }
      }
    }

    for (const item of validLabels) {
      const entityId = `label_${rawEntities.length}_${Math.round((item.blueprintNormU ?? 0) * 1000)}`;
      if (pushEntityFromLabel(item, entityId, undefined, rawEntities, consumedLabelKeys)) {
        if (isStructuralBlueprintLabel(item.text)) {
          structuralLabelCount++;
        } else {
          labeledRoomCount++;
        }
      }
    }

    if (rawEntities.length === 0) return { ...empty, detectedLabels };

    const recognitionSummary = PropertyRecognitionEngine.recognizeProperty(rawEntities, 0, true);
    const entities = BlueprintIntelligenceEngine.mapRecognitionToCadEntities(recognitionSummary);

    return {
      entities,
      orientation,
      roomRegionCount: regions.length,
      labeledRoomCount,
      structuralLabelCount,
      detectedLabels,
      entityCount: entities.length,
    };
  }
}
