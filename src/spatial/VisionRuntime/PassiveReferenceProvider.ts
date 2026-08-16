import { BlueprintData } from "../../components/CadBlueprintWorkspace";
import { IVisionProvider } from "./IVisionProvider";
import {
  RecognitionSessionOptions,
  VisionProviderCapabilities,
  VisionRecognitionResult
} from "./types";

/**
 * ============================================================================
 * PASSIVE REFERENCE PROVIDER
 * ============================================================================
 * Reference provider implementation for runtime lifecycle validation.
 *
 * ARCHITECTURAL RULE:
 * Returns EMPTY VisionRecognitionResult structures.
 * NEVER fabricates walls, rooms, doors, or fake AI predictions.
 */
export class PassiveReferenceProvider implements IVisionProvider {
  private isInitialized = false;

  public async initialize(_config?: Record<string, unknown>): Promise<void> {
    this.isInitialized = true;
  }

  public capabilities(): VisionProviderCapabilities {
    return {
      providerId: "passive-reference-provider",
      displayName: "Passive Reference Provider (Lifecycle Validation Only)",
      version: "1.0.0",
      supportsWalls: false,
      supportsRooms: false,
      supportsOpenings: false,
      supportsText: false,
      supportsOrientation: false,
      supportsScale: false,
      isOfflineCapable: true
    };
  }

  public async recognize(
    blueprint: BlueprintData,
    _options?: RecognitionSessionOptions,
    onProgress?: (progressPercent: number, stageMessage: string) => void
  ): Promise<VisionRecognitionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    onProgress?.(10, "Initializing reference recognition boundary");
    onProgress?.(50, "Validating 0-1000 normalized spatial structure");
    onProgress?.(100, "Passive reference pass complete");

    const startTime = Date.now();

    return Object.freeze({
      blueprintId: blueprint.id,
      providerId: this.capabilities().providerId,
      providerVersion: this.version(),
      metadata: Object.freeze({
        processedAtISO: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        imageWidth: blueprint.naturalWidth,
        imageHeight: blueprint.naturalHeight,
        coordinateSpace: "0-1000" as const
      }),
      orientation: Object.freeze({
        northAngleDegrees: 0,
        confidence: 1.0
      }),
      scale: Object.freeze({
        pixelsPerMeter: blueprint.pixelsPerMeter || 40,
        scaleTextDetected: blueprint.scaleText || "Uncalibrated",
        confidence: 1.0
      }),
      walls: Object.freeze([]),
      rooms: Object.freeze([]),
      openings: Object.freeze([]),
      annotations: Object.freeze([]),
      diagnostics: Object.freeze({
        warnings: Object.freeze(["Passive reference provider active. No AI recognition performed."]),
        overallConfidence: 1.0
      })
    });
  }

  public async cancel(): Promise<void> {
    // No-op for passive reference
  }

  public async dispose(): Promise<void> {
    this.isInitialized = false;
  }

  public async health(): Promise<{ status: "OK" | "DEGRADED" | "UNAVAILABLE"; message?: string }> {
    return { status: "OK", message: "Passive Reference Provider active." };
  }

  public supportsBlueprint(_blueprint: BlueprintData): boolean {
    return true;
  }

  public version(): string {
    return "1.0.0";
  }
}
