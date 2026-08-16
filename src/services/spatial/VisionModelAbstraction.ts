import { VisionModelProvider } from "../../types/spatialIntelligence";

/**
 * ============================================================================
 *               URJAFLUX AI OS — VISION MODEL ABSTRACTION LAYER
 * ============================================================================
 * 
 * Abstract contracts and capability declarations for vision models.
 * Decouples spatial intelligence processing from specific external computer vision engines
 * such as Gemini 2.5/3 Flash Vision, OpenAI GPT-4o Vision, OpenCV edge pipelines,
 * YOLO v8/v11 object detectors, and Segment Anything Model (SAM) floorplan segmenters.
 */

export class VisionModelAbstraction {

  /**
   * Registry of supported vision model provider interfaces
   */
  public static getRegisteredProviders(): VisionModelProvider[] {
    return [
      {
        id: "vis_gemini_2_5",
        name: "Google Gemini 2.5 Flash Vision API",
        version: "2.5.0",
        type: "GEMINI_VISION",
        status: "ACTIVE",
        description: "Multimodal floor plan layout understanding, room label extraction, and compass rosette detection.",
        capabilities: {
          supportsFloorPlanSegmentation: true,
          supportsOCRTextRecognition: true,
          supportsDoorWindowDetection: true,
          supportsVectorOutput: false,
          averageLatencyMs: 1400,
          requiresCloudAPIKey: true
        }
      },
      {
        id: "vis_openai_gpt4o",
        name: "OpenAI GPT-4o Vision Engine",
        version: "4o-2024",
        type: "OPENAI_VISION",
        status: "AVAILABLE_EXTERNAL",
        description: "High-resolution architectural blueprint element parsing and semantic spatial labeling.",
        capabilities: {
          supportsFloorPlanSegmentation: true,
          supportsOCRTextRecognition: true,
          supportsDoorWindowDetection: true,
          supportsVectorOutput: false,
          averageLatencyMs: 2100,
          requiresCloudAPIKey: true
        }
      },
      {
        id: "vis_opencv_native",
        name: "OpenCV C++/WASM Edge Pipeline",
        version: "4.8.0",
        type: "OPENCV_PIPELINE",
        status: "AVAILABLE_EXTERNAL",
        description: "Local high-speed Hough line transform wall vectorizer and contour boundary extractor.",
        capabilities: {
          supportsFloorPlanSegmentation: false,
          supportsOCRTextRecognition: false,
          supportsDoorWindowDetection: true,
          supportsVectorOutput: true,
          averageLatencyMs: 120,
          requiresCloudAPIKey: false
        }
      },
      {
        id: "vis_yolo_v11_arch",
        name: "YOLO v11 Architectural Detector",
        version: "11.0.2",
        type: "YOLO_DETECTOR",
        status: "PLANNED",
        description: "Fine-tuned YOLO object detection for doors, swing arcs, windows, columns, and furniture symbols.",
        capabilities: {
          supportsFloorPlanSegmentation: false,
          supportsOCRTextRecognition: false,
          supportsDoorWindowDetection: true,
          supportsVectorOutput: true,
          averageLatencyMs: 45,
          requiresCloudAPIKey: false
        }
      },
      {
        id: "vis_sam2_floorplan",
        name: "Meta SAM 2 Segment Anything Model",
        version: "2.1",
        type: "SAM_SEGMENTER",
        status: "PLANNED",
        description: "Zero-shot room polygon segmentation and spatial wall boundary extraction.",
        capabilities: {
          supportsFloorPlanSegmentation: true,
          supportsOCRTextRecognition: false,
          supportsDoorWindowDetection: false,
          supportsVectorOutput: true,
          averageLatencyMs: 850,
          requiresCloudAPIKey: false
        }
      }
    ];
  }

  public static getProviderById(id: string): VisionModelProvider | undefined {
    return this.getRegisteredProviders().find(p => p.id === id);
  }
}
