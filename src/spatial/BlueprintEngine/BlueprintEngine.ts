import { BlueprintData } from "../../components/CadBlueprintWorkspace";
import { isPdfFile, rasterizePdfFirstPageToDataUrl } from "./blueprintRasterUtils";

/**
 * ============================================================================
 * URJAFLUX AI OS - BLUEPRINT ENGINE / PROCESSOR
 * ============================================================================
 * Single source of entry for loading, metadata extraction, calibration,
 * and memory management for floor plan images.
 *
 * ARCHITECTURE CONSTRAINTS:
 * 1. UI-Agnostic: Returns immutable BlueprintData objects; does not manage React state.
 * 2. No Viewport Logic: Viewport placement, zoom, and pan remain in CadBlueprintWorkspace.
 * 3. Extension Points Only: Pipeline hooks are registration points for future recognition.
 */

export type PipelineStageName =
  | "STAGE_SPATIAL_RECOGNITION"
  | "STAGE_2_WALL_EXTRACTION"
  | "STAGE_3_POLYGON_DETECTION"
  | "STAGE_4_ROOM_DETECTION"
  | "STAGE_5_OPENING_DETECTION"
  | "STAGE_6_SEMANTIC_CLASSIFICATION";

export type PipelineStageHook = (blueprint: BlueprintData) => Promise<void>;

export class BlueprintEngine {
  private currentBlueprint: BlueprintData | null = null;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private objectUrlsToRevoke: Set<string> = new Set();
  private registeredStageHooks: Map<PipelineStageName, PipelineStageHook[]> = new Map();

  constructor() {
    const stages: PipelineStageName[] = [
      "STAGE_SPATIAL_RECOGNITION",
      "STAGE_2_WALL_EXTRACTION",
      "STAGE_3_POLYGON_DETECTION",
      "STAGE_4_ROOM_DETECTION",
      "STAGE_5_OPENING_DETECTION",
      "STAGE_6_SEMANTIC_CLASSIFICATION",
    ];
    stages.forEach((stage) => this.registeredStageHooks.set(stage, []));
  }

  /**
   * Loads a blueprint from a user-selected File object.
   * PDFs are rasterized to PNG data URLs so they render on the SVG canvas.
   */
  public async loadFromFile(file: File): Promise<BlueprintData> {
    let displayUrl: string;
    let dimensions: { width: number; height: number };
    let fileType: BlueprintData["fileType"] = "image";

    if (isPdfFile(file)) {
      const raster = await rasterizePdfFirstPageToDataUrl(file);
      displayUrl = raster.dataUrl;
      dimensions = { width: raster.width, height: raster.height };
      fileType = "pdf";
    } else {
      const objectUrl = URL.createObjectURL(file);
      this.objectUrlsToRevoke.add(objectUrl);
      displayUrl = objectUrl;
      dimensions = await this.preloadImage(objectUrl);
      fileType = "image";
    }

    const aspect = dimensions.width / (dimensions.height || 1);

    const blueprint: BlueprintData = {
      id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: file.name,
      url: displayUrl,
      fileType,
      naturalWidth: dimensions.width,
      naturalHeight: dimensions.height,
      aspectRatio: aspect,
      x: 0,
      y: 0,
      width: 20,
      height: 20 / (aspect || 1),
      rotation: 0,
      opacity: 0.85,
      locked: false,
      visible: true,
      calibrated: false,
      pixelsPerMeter: 40,
      scaleText: "Uncalibrated",
    };

    this.currentBlueprint = blueprint;
    return { ...blueprint };
  }

  /**
   * Loads a blueprint from a remote URL or pre-packaged sample asset.
   */
  public async loadFromUrl(url: string, name: string = "Blueprint"): Promise<BlueprintData> {
    const dimensions = await this.preloadImage(url);
    const aspect = dimensions.width / (dimensions.height || 1);

    const blueprint: BlueprintData = {
      id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      url,
      fileType: url.endsWith(".pdf") ? "pdf" : "image",
      naturalWidth: dimensions.width,
      naturalHeight: dimensions.height,
      aspectRatio: aspect,
      x: 0,
      y: 0,
      width: 20,
      height: 20 / (aspect || 1),
      rotation: 0,
      opacity: 0.85,
      locked: false,
      visible: true,
      calibrated: false,
      pixelsPerMeter: 40,
      scaleText: "Uncalibrated",
    };

    this.currentBlueprint = blueprint;
    return { ...blueprint };
  }

  /**
   * Preload image dimensions. Blob/data URLs must not use crossOrigin (breaks in browser).
   */
  private preloadImage(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        const cached = this.imageCache.get(src)!;
        resolve({
          width: cached.naturalWidth || cached.width,
          height: cached.naturalHeight || cached.height,
        });
        return;
      }

      const img = new Image();
      if (!src.startsWith("blob:") && !src.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve({
          width: img.naturalWidth || img.width || 1920,
          height: img.naturalHeight || img.height || 1080,
        });
      };
      img.onerror = () => {
        reject(new Error(`Failed to load blueprint image from ${src}`));
      };
      img.src = src;
    });
  }

  public registerStageHook(stage: PipelineStageName, hook: PipelineStageHook): void {
    const hooks = this.registeredStageHooks.get(stage) || [];
    hooks.push(hook);
    this.registeredStageHooks.set(stage, hooks);
  }

  public getCurrentBlueprint(): BlueprintData | null {
    return this.currentBlueprint ? { ...this.currentBlueprint } : null;
  }

  public hasBlueprint(): boolean {
    return this.currentBlueprint !== null;
  }

  public getStageHooks(stage: PipelineStageName): readonly PipelineStageHook[] {
    return Object.freeze([...(this.registeredStageHooks.get(stage) || [])]);
  }

  public clear(): void {
    this.currentBlueprint = null;
    this.objectUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrlsToRevoke.clear();
    this.imageCache.clear();
  }

  public dispose(): void {
    this.clear();
    this.registeredStageHooks.clear();
  }
}

export const blueprintEngine = new BlueprintEngine();
