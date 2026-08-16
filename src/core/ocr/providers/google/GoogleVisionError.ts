export enum GoogleVisionErrorCode {
  MISSING_CREDENTIALS = 'MISSING_CREDENTIALS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  AUTHENTICATION_FAILURE = 'AUTHENTICATION_FAILURE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  TIMEOUT = 'TIMEOUT',
  SDK_EXCEPTION = 'SDK_EXCEPTION',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export class GoogleVisionError extends Error {
  public readonly code: GoogleVisionErrorCode;
  public readonly originalError?: Error;

  constructor(message: string, code: GoogleVisionErrorCode, originalError?: Error) {
    super(message);
    this.name = 'GoogleVisionError';
    this.code = code;
    this.originalError = originalError;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static fromSDKException(err: unknown): GoogleVisionError {
    if (err instanceof GoogleVisionError) {
      return err;
    }

    const errorObj = err instanceof Error ? err : new Error(String(err));
    const message = errorObj.message || 'Google Vision SDK Error';

    if (
      message.includes('Could not load the default credentials') ||
      message.includes('MISSING_CREDENTIALS') ||
      message.includes('credentials') ||
      message.includes('ENOENT')
    ) {
      return new GoogleVisionError(
        `Google Vision Credentials Missing/Invalid: ${message}`,
        GoogleVisionErrorCode.MISSING_CREDENTIALS,
        errorObj
      );
    }
    if (
      message.includes('UNAUTHENTICATED') ||
      message.includes('Unauthenticated') ||
      message.includes('invalid key') ||
      message.includes('invalid credentials')
    ) {
      return new GoogleVisionError(
        `Google Vision Authentication Failure: ${message}`,
        GoogleVisionErrorCode.AUTHENTICATION_FAILURE,
        errorObj
      );
    }
    if (message.includes('PERMISSION_DENIED') || message.includes('Permission denied')) {
      return new GoogleVisionError(
        `Google Vision Permission Denied: ${message}`,
        GoogleVisionErrorCode.PERMISSION_DENIED,
        errorObj
      );
    }
    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('Quota exceeded') || message.includes('429')) {
      return new GoogleVisionError(
        `Google Vision Quota Exceeded: ${message}`,
        GoogleVisionErrorCode.QUOTA_EXCEEDED,
        errorObj
      );
    }
    if (
      message.includes('DEADLINE_EXCEEDED') ||
      message.includes('timeout') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ABORTED')
    ) {
      return new GoogleVisionError(
        `Google Vision Request Timeout: ${message}`,
        GoogleVisionErrorCode.TIMEOUT,
        errorObj
      );
    }
    if (
      message.includes('Unsupported image format') ||
      message.includes('BAD_REQUEST') ||
      message.includes('invalid format')
    ) {
      return new GoogleVisionError(
        `Google Vision Unsupported Format: ${message}`,
        GoogleVisionErrorCode.UNSUPPORTED_FORMAT,
        errorObj
      );
    }

    return new GoogleVisionError(
      `Google Vision SDK Error: ${message}`,
      GoogleVisionErrorCode.SDK_EXCEPTION,
      errorObj
    );
  }
}
