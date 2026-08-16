import { OCRCapabilities, IOCRCapabilitiesData } from '../../engines/OCRCapabilities';

export class GoogleVisionCapabilities extends OCRCapabilities {
  constructor(data?: Partial<IOCRCapabilitiesData>) {
    super({
      supportsHandwriting: true,
      supportsTableExtraction: true,
      supportsLanguageDetection: true,
      supportsScriptDetection: true,
      supportsLayoutAnalysis: true,
      supportedLanguages: [
        'en', 'hi', 'sa', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'ru', 'pt', 'it', 'ko', 'ta', 'te', 'bn'
      ],
      supportedScripts: ['Latin', 'Devanagari', 'Arabic', 'Han', 'Kana', 'Bengali', 'Tamil', 'Telugu', 'Cyrillic'],
      maxPagesPerBatch: 16,
      ...data
    });
  }

  public static googleVisionCapabilities(): GoogleVisionCapabilities {
    return new GoogleVisionCapabilities();
  }
}
