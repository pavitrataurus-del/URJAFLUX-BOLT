import { IGeminiTransport } from "../interfaces/IGeminiTransport";
import { GeminiRecognitionRequest, GeminiTransportResponse } from "../types";
import { GeminiNetworkError, GeminiTimeoutError } from "../GeminiErrorModel";

/**
 * ============================================================================
 * GEMINI PROXY TRANSPORT
 * ============================================================================
 * Secure server-side proxy transport transmitting requests to /api/vision/recognize.
 */
export class GeminiProxyTransport implements IGeminiTransport {
  private readonly endpoint: string;
  private abortController: AbortController | null = null;

  constructor(endpoint = "/api/vision/recognize") {
    this.endpoint = endpoint;
  }

  public async transmit(request: GeminiRecognitionRequest): Promise<GeminiTransportResponse> {
    this.abortController = new AbortController();
    const startTime = Date.now();

    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, request.timeoutMs);

    try {
      // In infrastructure setup stage, fallback gracefully if backend proxy endpoint is not yet configured
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprintId: request.blueprintId,
          promptText: request.promptText,
          naturalWidth: request.naturalWidth,
          naturalHeight: request.naturalHeight,
          imageDataUrl: request.imageDataUrl
        }),
        signal: this.abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errDetails = `Proxy endpoint HTTP error ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.error) errDetails = errJson.error;
        } catch {}
        throw new GeminiNetworkError(errDetails);
      }

      const json = await response.json();
      const executionTimeMs = Date.now() - startTime;
      const rawJsonText = typeof json.rawJsonText === "string"
        ? json.rawJsonText
        : (typeof json.text === "string" ? json.text : JSON.stringify(json));

      return {
        rawJsonText,
        executionTimeMs,
        metadata: {
          transport: "GeminiProxyTransport",
          status: response.status,
          latencyMs: json.diagnostics?.latencyMs ?? executionTimeMs,
          tokenUsage: json.diagnostics?.tokenUsage ?? null,
          modelName: json.diagnostics?.modelName ?? "gemini-3.6-flash",
          responseSizeBytes: json.diagnostics?.responseSizeBytes ?? (typeof rawJsonText === "string" ? rawJsonText.length : 0)
        }
      };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === "AbortError") {
        throw new GeminiTimeoutError(`Proxy request timed out after ${request.timeoutMs}ms`);
      }

      if (err instanceof GeminiNetworkError || err instanceof GeminiTimeoutError) {
        throw err;
      }

      throw new GeminiNetworkError(`Gemini Proxy transport execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  public async cancel(): Promise<void> {
    this.abortController?.abort();
  }

  public async health(): Promise<{ status: "OK" | "DEGRADED" | "UNAVAILABLE"; message?: string }> {
    return { status: "OK", message: `Proxy endpoint configured at '${this.endpoint}'.` };
  }
}
