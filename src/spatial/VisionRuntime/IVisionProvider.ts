import { BlueprintData } from "../../components/CadBlueprintWorkspace";
import {
  RecognitionSessionOptions,
  VisionProviderCapabilities,
  VisionRecognitionResult
} from "./types";

/**
 * ============================================================================
 * VISION PROVIDER INTERFACE
 * ============================================================================
 * Abstract contract implemented by any AI or Algorithmic Spatial Recognition Provider
 * (e.g., Gemini Vision, OpenCV, YOLO, DXF/PDF Parsers, Passive Reference Provider).
 */
export interface IVisionProvider {
  /**
   * One-time initialization of provider credentials or resources.
   */
  initialize(config?: Record<string, unknown>): Promise<void>;

  /**
   * Returns metadata and feature capabilities supported by this provider.
   */
  capabilities(): VisionProviderCapabilities;

  /**
   * Main recognition entry point.
   */
  recognize(
    blueprint: BlueprintData,
    options?: RecognitionSessionOptions,
    onProgress?: (progressPercent: number, stageMessage: string) => void
  ): Promise<VisionRecognitionResult>;

  /**
   * Requests cancellation of an in-flight recognition operation.
   */
  cancel(): Promise<void>;

  /**
   * Releases allocated memory or network resources.
   */
  dispose(): Promise<void>;

  /**
   * Diagnostic health check for the provider.
   */
  health(): Promise<{ status: "OK" | "DEGRADED" | "UNAVAILABLE"; message?: string }>;

  /**
   * Checks whether the provider supports the given blueprint image/file type.
   */
  supportsBlueprint(blueprint: BlueprintData): boolean;

  /**
   * Returns provider version string.
   */
  version(): string;
}
