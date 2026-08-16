import { FloorPlanValidationResult, OCRExtractionResult } from "../types/aiVision";
import { geminiVisionService } from "./geminiVisionService";

/**
 * Normalizes any error caught during Vision operations into a standardized format.
 */
function normalizeError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  return new Error(`[Vision Adapter Error] ${message}`);
}

/**
 * Verifies the connection to the underlying Gemini Vision service.
 */
export async function testGeminiConnection(): Promise<string> {
  try {
    return await geminiVisionService.testGeminiConnection();
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Validates a floor plan image by performing initial quality and architectural layout checks.
 */
export async function validateFloorPlan(
  projectId: string,
  imageBase64: string
): Promise<FloorPlanValidationResult> {
  try {
    return await geminiVisionService.analyzeFloorPlan(projectId, imageBase64);
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Extracts OCR labels and spatial metadata from a floor plan image.
 */
export async function extractOCRMetadata(
  projectId: string,
  imageBase64: string
): Promise<OCRExtractionResult> {
  try {
    return await geminiVisionService.extractOCRMetadata(projectId, imageBase64);
  } catch (error) {
    throw normalizeError(error);
  }
}

export const visionAdapter = {
  testGeminiConnection,
  validateFloorPlan,
  extractOCRMetadata,
};
