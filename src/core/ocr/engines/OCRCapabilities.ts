export interface IOCRCapabilitiesData {
  readonly supportsHandwriting: boolean;
  readonly supportsTableExtraction: boolean;
  readonly supportsLanguageDetection: boolean;
  readonly supportsScriptDetection: boolean;
  readonly supportsLayoutAnalysis: boolean;
  readonly supportedLanguages: readonly string[];
  readonly supportedScripts: readonly string[];
  readonly maxPagesPerBatch: number;
}

export class OCRCapabilities implements IOCRCapabilitiesData {
  public readonly supportsHandwriting: boolean;
  public readonly supportsTableExtraction: boolean;
  public readonly supportsLanguageDetection: boolean;
  public readonly supportsScriptDetection: boolean;
  public readonly supportsLayoutAnalysis: boolean;
  public readonly supportedLanguages: readonly string[];
  public readonly supportedScripts: readonly string[];
  public readonly maxPagesPerBatch: number;

  constructor(data?: Partial<IOCRCapabilitiesData>) {
    this.supportsHandwriting = data?.supportsHandwriting ?? false;
    this.supportsTableExtraction = data?.supportsTableExtraction ?? true;
    this.supportsLanguageDetection = data?.supportsLanguageDetection ?? true;
    this.supportsScriptDetection = data?.supportsScriptDetection ?? true;
    this.supportsLayoutAnalysis = data?.supportsLayoutAnalysis ?? true;
    this.supportedLanguages = Object.freeze([...(data?.supportedLanguages || ['en', 'hi', 'sa'])]);
    this.supportedScripts = Object.freeze([...(data?.supportedScripts || ['Latin', 'Devanagari'])]);
    this.maxPagesPerBatch = data?.maxPagesPerBatch ?? 100;

    Object.freeze(this);
  }

  public static defaultCapabilities(): OCRCapabilities {
    return new OCRCapabilities();
  }

  public toJSON(): IOCRCapabilitiesData {
    return {
      supportsHandwriting: this.supportsHandwriting,
      supportsTableExtraction: this.supportsTableExtraction,
      supportsLanguageDetection: this.supportsLanguageDetection,
      supportsScriptDetection: this.supportsScriptDetection,
      supportsLayoutAnalysis: this.supportsLayoutAnalysis,
      supportedLanguages: this.supportedLanguages,
      supportedScripts: this.supportedScripts,
      maxPagesPerBatch: this.maxPagesPerBatch
    };
  }
}
