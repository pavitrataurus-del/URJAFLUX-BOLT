# URJAFLUX AI OS — DOMAIN-012 AI Model Abstraction Layer
## Provider-Independent Model Interfaces

### 1. Abstract Interfaces
To remain fully provider-agnostic, all AI inference requests are isolated behind the `VisionAIProvider` interface. The underlying business logic doesn't care whether the provider is Google Gemini, GCP Cloud Vision, or a localized custom model.

```typescript
export interface VisionAIProvider {
  id: string;
  name: string;
  detectObjects(asset: ImageAsset, req?: ObjectDetectionRequest): Promise<Detection[]>;
  runOcr(asset: ImageAsset, req?: OcrRequest): Promise<OCRText[]>;
  segmentStructures(asset: ImageAsset, req?: SegmentationRequest): Promise<any>;
  classifySiteDefects(asset: ImageAsset, req?: ClassificationRequest): Promise<InspectionObservation[]>;
}
```

---

### 2. Multi-Provider Factory
The `ModelAbstractionManager` acts as the registration hub and factory:
* **Active Selector:** Allows hot-swapping active providers on the fly.
* **Registered Providers:**
  - `GeminiVisionAIProvider` (Google Gemini 2.0 Flash Vision Engine)
  - `CloudVisionAIProvider` (Google Cloud Vision API)
* **Future Compatibility:** Ready for expansion to offline models, drone systems, thermal analyzers, or LiDAR point cloud processors.
