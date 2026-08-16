import { IGeminiTransport } from "../interfaces/IGeminiTransport";
import { GeminiRecognitionRequest, GeminiTransportResponse } from "../types";
import { GeminiProxyTransport } from "./GeminiProxyTransport";

/**
 * ============================================================================
 * GEMINI SDK TRANSPORT
 * ============================================================================
 * Direct Google Gen AI SDK execution wrapper. Delegated securely to server proxy.
 */
export class GeminiSdkTransport implements IGeminiTransport {
  private proxyDelegate: GeminiProxyTransport;

  constructor() {
    this.proxyDelegate = new GeminiProxyTransport("/api/vision/recognize");
  }

  public async transmit(request: GeminiRecognitionRequest): Promise<GeminiTransportResponse> {
    return this.proxyDelegate.transmit(request);
  }

  public async cancel(): Promise<void> {
    await this.proxyDelegate.cancel();
  }

  public async health(): Promise<{ status: "OK" | "DEGRADED" | "UNAVAILABLE"; message?: string }> {
    return this.proxyDelegate.health();
  }
}
