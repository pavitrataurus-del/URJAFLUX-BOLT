import { GeminiTransportMode } from "./types";

/**
 * ============================================================================
 * GEMINI PROVIDER CONFIGURATION
 * ============================================================================
 * Immutable configuration settings container for GeminiVisionProvider.
 */

export interface GeminiProviderConfigOptions {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retryCount?: number;
  transportMode?: GeminiTransportMode;
  apiEndpoint?: string;
  apiKey?: string;
  minimumWallConfidence?: number;
  minimumRoomConfidence?: number;
  minimumDoorConfidence?: number;
  minimumWindowConfidence?: number;
}

export class GeminiProviderConfig {
  public readonly modelName: string;
  public readonly temperature: number;
  public readonly maxTokens: number;
  public readonly timeoutMs: number;
  public readonly retryCount: number;
  public readonly transportMode: GeminiTransportMode;
  public readonly apiEndpoint: string;
  public readonly apiKey?: string;
  public readonly minimumWallConfidence: number;
  public readonly minimumRoomConfidence: number;
  public readonly minimumDoorConfidence: number;
  public readonly minimumWindowConfidence: number;

  constructor(options: GeminiProviderConfigOptions = {}) {
    this.modelName = options.modelName || "gemini-3.6-flash";
    this.temperature = options.temperature ?? 0.0;
    this.maxTokens = options.maxTokens || 4096;
    this.timeoutMs = options.timeoutMs || 30000;
    this.retryCount = options.retryCount ?? 1;
    this.transportMode = options.transportMode || "PROXY";
    this.apiEndpoint = options.apiEndpoint || "/api/vision/recognize";
    this.apiKey = options.apiKey;
    this.minimumWallConfidence = options.minimumWallConfidence ?? 0.4;
    this.minimumRoomConfidence = options.minimumRoomConfidence ?? 0.4;
    this.minimumDoorConfidence = options.minimumDoorConfidence ?? 0.4;
    this.minimumWindowConfidence = options.minimumWindowConfidence ?? 0.4;

    Object.freeze(this);
  }

  public withOverrides(overrides: GeminiProviderConfigOptions): GeminiProviderConfig {
    return new GeminiProviderConfig({
      modelName: overrides.modelName ?? this.modelName,
      temperature: overrides.temperature ?? this.temperature,
      maxTokens: overrides.maxTokens ?? this.maxTokens,
      timeoutMs: overrides.timeoutMs ?? this.timeoutMs,
      retryCount: overrides.retryCount ?? this.retryCount,
      transportMode: overrides.transportMode ?? this.transportMode,
      apiEndpoint: overrides.apiEndpoint ?? this.apiEndpoint,
      apiKey: overrides.apiKey ?? this.apiKey,
      minimumWallConfidence: overrides.minimumWallConfidence ?? this.minimumWallConfidence,
      minimumRoomConfidence: overrides.minimumRoomConfidence ?? this.minimumRoomConfidence,
      minimumDoorConfidence: overrides.minimumDoorConfidence ?? this.minimumDoorConfidence,
      minimumWindowConfidence: overrides.minimumWindowConfidence ?? this.minimumWindowConfidence
    });
  }
}
