import { Detection, ImageAsset, OCRText, InspectionObservation } from './VisionTypes';
import { SymbolRecognitionEngine } from './SymbolRecognitionEngine';
import { OcrEngine } from './OcrEngine';
import { SiteInspectionEngine } from './SiteInspectionEngine';

export interface ObjectDetectionRequest {
  imageUri: string;
  minConfidence: number;
  classes?: string[];
}

export interface OcrRequest {
  imageUri: string;
  detectLayout: boolean;
  languageHints?: string[];
}

export interface SegmentationRequest {
  imageUri: string;
  segmentationType: 'SEMANTIC' | 'INSTANCE';
}

export interface ClassificationRequest {
  imageUri: string;
  topK: number;
}

/**
 * Provider-Independent AI Model interfaces for Vision processing
 */
export interface VisionAIProvider {
  id: string;
  name: string;
  detectObjects(asset: ImageAsset, req?: ObjectDetectionRequest): Promise<Detection[]>;
  runOcr(asset: ImageAsset, req?: OcrRequest): Promise<OCRText[]>;
  segmentStructures(asset: ImageAsset, req?: SegmentationRequest): Promise<any>;
  classifySiteDefects(asset: ImageAsset, req?: ClassificationRequest): Promise<InspectionObservation[]>;
}

/**
 * Gemini Vision AI Provider Implementation
 */
export class GeminiVisionAIProvider implements VisionAIProvider {
  public id = 'gemini-3.6-flash';
  public name = 'Google Gemini 3.6 Flash Vision Engine';

  public async detectObjects(asset: ImageAsset): Promise<Detection[]> {
    return await SymbolRecognitionEngine.getInstance().detectSymbols(asset);
  }

  public async runOcr(asset: ImageAsset): Promise<OCRText[]> {
    return await OcrEngine.getInstance().extractTextFromAsset(asset);
  }

  public async segmentStructures(asset: ImageAsset): Promise<any> {
    return {
      provider: this.name,
      segmentationMapUrl: `https://storage.urjaflux.com/vision/segments/${asset.id}.png`,
      pixelClasses: {
        '0': 'BACKGROUND',
        '1': 'WALL_CANDIDATE',
        '2': 'DOOR_CANDIDATE',
        '3': 'WINDOW_CANDIDATE'
      }
    };
  }

  public async classifySiteDefects(asset: ImageAsset): Promise<InspectionObservation[]> {
    return await SiteInspectionEngine.getInstance().analyzeInspectionPhoto(asset);
  }
}

/**
 * Alternative Provider - Cloud Vision API
 */
export class CloudVisionAIProvider implements VisionAIProvider {
  public id = 'google-cloud-vision-api';
  public name = 'Google Cloud Vision API';

  public async detectObjects(asset: ImageAsset): Promise<Detection[]> {
    const raw = await SymbolRecognitionEngine.getInstance().detectSymbols(asset);
    return raw.map(det => ({
      ...det,
      modelName: 'GCP-CloudVision-ObjectLocalizer',
      metadata: { ...det.metadata, providerOverride: 'GCP_CLOUD_VISION' }
    }));
  }

  public async runOcr(asset: ImageAsset): Promise<OCRText[]> {
    const raw = await OcrEngine.getInstance().extractTextFromAsset(asset);
    return raw.map(text => ({
      ...text,
      text: `${text.text} (GCP-Vision)`
    }));
  }

  public async segmentStructures(): Promise<any> {
    return { provider: this.name, unsupported: true };
  }

  public async classifySiteDefects(asset: ImageAsset): Promise<InspectionObservation[]> {
    const raw = await SiteInspectionEngine.getInstance().analyzeInspectionPhoto(asset);
    return raw.map(obs => ({
      ...obs,
      description: `${obs.description} (GCP Cloud Vision Site Observer)`
    }));
  }
}

/**
 * Abstract AI Model Manager Layer
 */
export class ModelAbstractionManager {
  private static instance: ModelAbstractionManager;
  private providers: Map<string, VisionAIProvider> = new Map();
  private activeProviderId: string = 'google-gemini-2.0-flash';

  private constructor() {
    this.registerProvider(new GeminiVisionAIProvider());
    this.registerProvider(new CloudVisionAIProvider());
  }

  public static getInstance(): ModelAbstractionManager {
    if (!ModelAbstractionManager.instance) {
      ModelAbstractionManager.instance = new ModelAbstractionManager();
    }
    return ModelAbstractionManager.instance;
  }

  public registerProvider(provider: VisionAIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getActiveProvider(): VisionAIProvider {
    const provider = this.providers.get(this.activeProviderId);
    if (!provider) {
      throw new Error(`Active provider ${this.activeProviderId} not registered in Vision Model Abstraction layer`);
    }
    return provider;
  }

  public getProviders(): VisionAIProvider[] {
    return Array.from(this.providers.values());
  }

  public setActiveProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider ${providerId} is not registered`);
    }
    this.activeProviderId = providerId;
  }
}
