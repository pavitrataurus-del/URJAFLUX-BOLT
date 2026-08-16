/**
 * ============================================================================
 * GEMINI VISION ERROR MODEL
 * ============================================================================
 * Strongly typed error hierarchy for all failure modes in GeminiVisionProvider.
 */

export class GeminiVisionError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code = "GEMINI_VISION_ERROR", details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GeminiAuthenticationError extends GeminiVisionError {
  constructor(message = "Gemini authentication failed or API key missing", details?: Record<string, unknown>) {
    super(message, "GEMINI_AUTH_ERROR", details);
  }
}

export class GeminiTimeoutError extends GeminiVisionError {
  constructor(message = "Gemini vision request timed out", details?: Record<string, unknown>) {
    super(message, "GEMINI_TIMEOUT_ERROR", details);
  }
}

export class GeminiRateLimitError extends GeminiVisionError {
  constructor(message = "Gemini API rate limit exceeded", details?: Record<string, unknown>) {
    super(message, "GEMINI_RATE_LIMIT_ERROR", details);
  }
}

export class GeminiMalformedResponseError extends GeminiVisionError {
  constructor(message = "Failed to parse JSON response from Gemini model", details?: Record<string, unknown>) {
    super(message, "GEMINI_MALFORMED_RESPONSE", details);
  }
}

export class GeminiSchemaValidationError extends GeminiVisionError {
  constructor(message = "Gemini response violated Spatial JSON schema specifications", details?: Record<string, unknown>) {
    super(message, "GEMINI_SCHEMA_VALIDATION_ERROR", details);
  }
}

export class GeminiNetworkError extends GeminiVisionError {
  constructor(message = "Network error during Gemini vision request transmission", details?: Record<string, unknown>) {
    super(message, "GEMINI_NETWORK_ERROR", details);
  }
}

export class GeminiUnsupportedModelError extends GeminiVisionError {
  constructor(message = "Configured Gemini model is unsupported or invalid", details?: Record<string, unknown>) {
    super(message, "GEMINI_UNSUPPORTED_MODEL", details);
  }
}
