import { BlueprintData } from "../../components/CadBlueprintWorkspace";
import { blueprintEngine } from "../BlueprintEngine/BlueprintEngine";
import { IVisionProvider } from "./IVisionProvider";
import { RecognitionSession } from "./RecognitionSession";

import {
  RecognitionSessionOptions,
  VisionRecognitionResult,
  VisionRuntimeConfig
} from "./types";
import { visionProviderRegistry } from "./VisionProviderRegistry";

/**
 * ============================================================================
 * VISION RUNTIME
 * ============================================================================
 * Central runtime orchestrator for spatial recognition requests.
 * Connects BlueprintEngine to vision providers and forwards normalized
 * Spatial JSON results to downstream geometry frameworks.
 */
export class VisionRuntime {
  private config: VisionRuntimeConfig = {
    requestTimeoutMs: 30000,
    retryCount: 1,
    minimumWallConfidence: 0.5,
    minimumRoomConfidence: 0.5,
    minimumDoorConfidence: 0.5,
    minimumWindowConfidence: 0.5
  };

  private activeSessions: Map<string, RecognitionSession> = new Map();

  constructor(customConfig?: Partial<VisionRuntimeConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
  }

  /**
   * Updates runtime configuration thresholds and timeouts.
   */
  public updateConfig(newConfig: Partial<VisionRuntimeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current runtime configuration settings.
   */
  public getConfig(): Readonly<VisionRuntimeConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Initiates a spatial recognition pipeline run for a blueprint.
   */
  public async executeRecognition(
    blueprint: BlueprintData,
    providerId?: string,
    options?: RecognitionSessionOptions
  ): Promise<{ session: RecognitionSession; result: VisionRecognitionResult }> {
    const targetProviderId =
      providerId ||
      this.config.defaultProviderId ||
      visionProviderRegistry.getDefaultProvider()?.capabilities().providerId;

    if (!targetProviderId) {
      throw new Error(
        "No vision provider specified and no default provider registered in VisionProviderRegistry."
      );
    }

    const provider = visionProviderRegistry.getProvider(targetProviderId);
    if (!provider) {
      throw new Error(`Vision provider '${targetProviderId}' is not registered.`);
    }

    if (!provider.supportsBlueprint(blueprint)) {
      throw new Error(`Provider '${targetProviderId}' does not support blueprint format.`);
    }

    const session = new RecognitionSession(blueprint.id, targetProviderId);
    this.activeSessions.set(session.id, session);

    session.start();

    const timeoutMs = options?.timeoutMs || this.config.requestTimeoutMs;

    try {
      const recognitionPromise = provider.recognize(
        blueprint,
        options,
        (progress, message) => session.updateProgress(progress, message)
      );

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Vision recognition timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const result = await Promise.race([recognitionPromise, timeoutPromise]);

      session.complete(result);
      return { session, result };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      session.fail(errorMsg);
      throw err;
    } finally {
      this.activeSessions.delete(session.id);
    }
  }

  /**
   * Cancels an active recognition session.
   */
  public async cancelSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const provider = visionProviderRegistry.getProvider(session.providerId);
    if (provider) {
      await provider.cancel();
    }
    session.cancel();
    this.activeSessions.delete(sessionId);
  }

  /**
   * Creates a pipeline hook handler for STAGE_SPATIAL_RECOGNITION registration in BlueprintEngine.
   */
  public createPipelineStageHook(): (blueprint: BlueprintData) => Promise<void> {
    return async (blueprint: BlueprintData): Promise<void> => {
      const defaultProvider = visionProviderRegistry.getDefaultProvider();
      if (defaultProvider) {
        await this.executeRecognition(blueprint, defaultProvider.capabilities().providerId);
      }
    };
  }
}

export const visionRuntime = new VisionRuntime();

/**
 * Global helper to retrieve the active transport mode (PROXY / MOCK / SDK) from registered vision provider.
 */
export function getActiveTransportMode(): "MOCK" | "PROXY" | "SDK" {
  const provider = visionProviderRegistry.getDefaultProvider();
  if (provider && "getTransportMode" in provider && typeof (provider as any).getTransportMode === "function") {
    return (provider as any).getTransportMode();
  }
  return "PROXY";
}

// Register STAGE_SPATIAL_RECOGNITION hook into BlueprintEngine stage registry
blueprintEngine.registerStageHook(
  "STAGE_SPATIAL_RECOGNITION",
  visionRuntime.createPipelineStageHook()
);
