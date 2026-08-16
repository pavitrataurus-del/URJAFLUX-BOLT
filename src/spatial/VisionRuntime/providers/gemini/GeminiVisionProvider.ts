import { BlueprintData } from "../../../../components/CadBlueprintWorkspace";
import { IVisionProvider } from "../../IVisionProvider";
import {
  RecognitionSessionOptions,
  VisionProviderCapabilities,
  VisionRecognitionResult
} from "../../types";
import { GeminiAuthHandler } from "./GeminiAuthHandler";
import { GeminiMalformedResponseError, GeminiSchemaValidationError } from "./GeminiErrorModel";
import { GeminiProviderConfig } from "./GeminiProviderConfig";
import { GeminiPromptBuilder } from "./GeminiPromptBuilder";
import { GeminiResponseValidator } from "./GeminiResponseValidator";
import { GeminiSpatialJsonMapper } from "./GeminiSpatialJsonMapper";
import { IGeminiTransport } from "./interfaces/IGeminiTransport";
import { GeminiMockTransport } from "./transports/GeminiMockTransport";
import { GeminiProxyTransport } from "./transports/GeminiProxyTransport";
import { GeminiSdkTransport } from "./transports/GeminiSdkTransport";
import { GeminiTransportMode } from "./types";

/**
 * ============================================================================
 * GEMINI VISION PROVIDER
 * ============================================================================
 * Production-grade Gemini Vision Provider plugging cleanly into VisionRuntime via IVisionProvider.
 *
 * ARCHITECTURAL BOUNDARY RULES:
 * - Provider is responsible ONLY for preparing requests, invoking transport, validating output,
 *   and mapping spatial candidates into VisionRecognitionResult.
 * - ZERO mutation of BuildingElementRegistry, BlueprintEngine, or Wall Framework.
 * - Transport implementation is fully decoupled via IGeminiTransport.
 */
export class GeminiVisionProvider implements IVisionProvider {
  private config: GeminiProviderConfig;
  private transport: IGeminiTransport;
  private authHandler: GeminiAuthHandler;
  private promptBuilder: GeminiPromptBuilder;
  private responseValidator: GeminiResponseValidator;
  private spatialJsonMapper: GeminiSpatialJsonMapper;
  private isInitialized = false;

  constructor(
    customConfig?: GeminiProviderConfig,
    customTransport?: IGeminiTransport,
    customAuthHandler?: GeminiAuthHandler,
    customPromptBuilder?: GeminiPromptBuilder,
    customResponseValidator?: GeminiResponseValidator,
    customSpatialJsonMapper?: GeminiSpatialJsonMapper
  ) {
    this.config = customConfig || new GeminiProviderConfig();
    this.authHandler = customAuthHandler || new GeminiAuthHandler();
    this.promptBuilder = customPromptBuilder || new GeminiPromptBuilder();
    this.responseValidator = customResponseValidator || new GeminiResponseValidator();
    this.spatialJsonMapper = customSpatialJsonMapper || new GeminiSpatialJsonMapper();

    this.transport = customTransport || this.resolveTransport(this.config);
  }

  public async initialize(customConfigRecord?: Record<string, unknown>): Promise<void> {
    if (customConfigRecord) {
      this.config = this.config.withOverrides(customConfigRecord as any);
      this.transport = this.resolveTransport(this.config);
    }

    this.authHandler.verifyAuth(this.config);
    this.isInitialized = true;
  }

  public getTransportMode(): GeminiTransportMode {
    return this.config.transportMode;
  }

  public capabilities(): VisionProviderCapabilities {
    return {
      providerId: "gemini-vision-provider",
      displayName: "Gemini AI Vision Spatial Recognition Provider",
      version: this.version(),
      supportsWalls: true,
      supportsRooms: true,
      supportsOpenings: true,
      supportsText: true,
      supportsOrientation: true,
      supportsScale: true,
      isOfflineCapable: this.config.transportMode === "MOCK"
    };
  }

  public async recognize(
    blueprint: BlueprintData,
    options?: RecognitionSessionOptions,
    onProgress?: (progressPercent: number, stageMessage: string) => void
  ): Promise<VisionRecognitionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const timeoutMs = options?.timeoutMs || this.config.timeoutMs;

    onProgress?.(10, "Building prompt request from template");
    const requestPayload = this.promptBuilder.buildRequest(
      blueprint,
      "BLUEPRINT_FULL",
      timeoutMs,
      options?.customSettings
    );

    onProgress?.(30, `Transmitting request via ${this.config.transportMode} transport`);
    const transportResponse = await this.transport.transmit(requestPayload);

    onProgress?.(70, "Validating model JSON response and spatial bounds");
    const validationResult = this.responseValidator.validate(transportResponse.rawJsonText);

    if (!validationResult.isValid) {
      throw new GeminiSchemaValidationError(
        `Gemini output validation failed: ${validationResult.errors.join("; ")}`,
        { errors: validationResult.errors, rawText: transportResponse.rawJsonText }
      );
    }

    onProgress?.(90, "Mapping candidates into 0-1000 normalized spatial structure");
    const result = this.spatialJsonMapper.mapToRecognitionResult(
      blueprint,
      this.capabilities().providerId,
      this.version(),
      validationResult,
      transportResponse.executionTimeMs
    );

    onProgress?.(100, "Gemini spatial recognition complete");
    return result;
  }

  public async cancel(): Promise<void> {
    await this.transport.cancel();
  }

  public async dispose(): Promise<void> {
    await this.cancel();
    this.isInitialized = false;
  }

  public async health(): Promise<{ status: "OK" | "DEGRADED" | "UNAVAILABLE"; message?: string }> {
    return this.transport.health();
  }

  public supportsBlueprint(blueprint: BlueprintData): boolean {
    return Boolean(blueprint && blueprint.id);
  }

  public version(): string {
    return "1.0.0";
  }

  private resolveTransport(config: GeminiProviderConfig): IGeminiTransport {
    switch (config.transportMode) {
      case "PROXY":
        return new GeminiProxyTransport(config.apiEndpoint);
      case "SDK":
        return new GeminiSdkTransport();
      case "MOCK":
      default:
        return new GeminiMockTransport();
    }
  }
}
