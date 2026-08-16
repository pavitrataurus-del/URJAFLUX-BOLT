import fs from 'fs';
import path from 'path';
import { RetryPolicy } from '../../../knowledge_population/recovery/RetryPolicy';

export interface IGoogleVisionConfigurationData {
  readonly projectId?: string;
  readonly credentialsPath?: string;
  readonly apiKey?: string;
  readonly endpoint: string;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
  readonly languageHints: readonly string[];
  readonly batchSize: number;
  readonly featureTypes: readonly string[];
}

export class GoogleVisionConfiguration implements IGoogleVisionConfigurationData {
  public readonly projectId?: string;
  public readonly credentialsPath?: string;
  public readonly apiKey?: string;
  public readonly endpoint: string;
  public readonly timeoutMs: number;
  public readonly retryPolicy: RetryPolicy;
  public readonly languageHints: readonly string[];
  public readonly batchSize: number;
  public readonly featureTypes: readonly string[];

  constructor(data?: Partial<IGoogleVisionConfigurationData>) {
    const env = typeof process !== 'undefined' && process.env ? process.env : {};
    this.projectId = data?.projectId || env.GOOGLE_CLOUD_PROJECT || env.GCP_PROJECT;
    this.credentialsPath = data?.credentialsPath || env.GOOGLE_APPLICATION_CREDENTIALS;
    this.apiKey = data?.apiKey || env.GOOGLE_VISION_API_KEY;
    this.endpoint = data?.endpoint || 'https://vision.googleapis.com/v1/images:annotate';
    this.timeoutMs = data?.timeoutMs ?? 30000;
    this.retryPolicy = data?.retryPolicy || new RetryPolicy({ maxRetries: 3, initialDelayMs: 1000, maxDelayMs: 10000 });
    this.languageHints = Object.freeze([...(data?.languageHints || ['en', 'hi', 'sa'])]);
    this.batchSize = data?.batchSize ?? 16;
    this.featureTypes = Object.freeze([...(data?.featureTypes || ['DOCUMENT_TEXT_DETECTION'])]);

    Object.freeze(this);
  }

  public static defaultConfiguration(): GoogleVisionConfiguration {
    return new GoogleVisionConfiguration();
  }

  public validate(): { readonly isValid: boolean; readonly errors: readonly string[] } {
    const errors: string[] = [];

    if (this.timeoutMs <= 0) {
      errors.push('timeoutMs must be a positive integer.');
    }
    if (this.batchSize <= 0 || this.batchSize > 100) {
      errors.push('batchSize must be between 1 and 100.');
    }
    if (this.featureTypes.length === 0) {
      errors.push('At least one featureType must be specified.');
    }
    if (this.credentialsPath && typeof fs !== 'undefined' && typeof fs.existsSync === 'function') {
      const resolvedPath = path.isAbsolute(this.credentialsPath) ? this.credentialsPath : path.resolve(process.cwd(), this.credentialsPath);
      if (!fs.existsSync(resolvedPath)) {
        errors.push(`Credentials file specified does not exist at path: ${this.credentialsPath}`);
      }
    }

    return Object.freeze({
      isValid: errors.length === 0,
      errors: Object.freeze(errors)
    });
  }

  public toJSON(): Record<string, unknown> {
    return {
      projectId: this.projectId,
      credentialsPath: this.credentialsPath,
      hasApiKey: Boolean(this.apiKey),
      endpoint: this.endpoint,
      timeoutMs: this.timeoutMs,
      retryPolicy: {
        maxRetries: this.retryPolicy.maxRetries,
        initialDelayMs: this.retryPolicy.initialDelayMs,
        maxDelayMs: this.retryPolicy.maxDelayMs
      },
      languageHints: this.languageHints,
      batchSize: this.batchSize,
      featureTypes: this.featureTypes
    };
  }
}
