import { GeminiAuthenticationError } from "./GeminiErrorModel";
import { GeminiProviderConfig } from "./GeminiProviderConfig";

/**
 * ============================================================================
 * GEMINI AUTH HANDLER
 * ============================================================================
 * Handles authentication verification and secure header generation.
 */
export class GeminiAuthHandler {
  /**
   * Verifies authentication status according to configured transport mode.
   */
  public verifyAuth(config: GeminiProviderConfig): boolean {
    if (config.transportMode === "MOCK") {
      return true;
    }

    if (config.transportMode === "PROXY") {
      // Proxy transport delegates server key verification to backend
      return true;
    }

    if (config.transportMode === "SDK") {
      const apiKey = config.apiKey || (typeof process !== "undefined" ? process.env.GEMINI_API_KEY : undefined);
      if (!apiKey) {
        throw new GeminiAuthenticationError(
          "GEMINI_API_KEY environment variable or config.apiKey is required for SDK transport mode."
        );
      }
      return true;
    }

    return true;
  }

  /**
   * Returns authorization headers for proxy requests without exposing secret keys in logs.
   */
  public getProxyHeaders(config: GeminiProviderConfig): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (config.apiKey) {
      headers["X-Gemini-Key"] = config.apiKey;
    }

    return headers;
  }
}
