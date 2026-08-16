import { GeminiRecognitionRequest, GeminiTransportResponse } from "../types";

/**
 * ============================================================================
 * GEMINI TRANSPORT INTERFACE
 * ============================================================================
 * Transport layer abstraction separating recognition logic from request execution
 * (REST, Proxy, SDK, or Mock).
 */
export interface IGeminiTransport {
  /**
   * Transmits a recognition request payload and returns the raw string response.
   */
  transmit(request: GeminiRecognitionRequest): Promise<GeminiTransportResponse>;

  /**
   * Cancels any pending transport operation.
   */
  cancel(): Promise<void>;

  /**
   * Performs diagnostic health check on transport endpoint/connection.
   */
  health(): Promise<{ status: "OK" | "DEGRADED" | "UNAVAILABLE"; message?: string }>;
}
