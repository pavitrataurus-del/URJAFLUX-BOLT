import { 
  getAIVisionAnalysis as serviceGet,
  saveAIVisionAnalysis as serviceSave,
  triggerMockAIVisionAnalysis as serviceTrigger
} from "../services/aiVisionAnalysisService";
import { AIVisionAnalysis } from "../types/aiVision";

/**
 * Repository layer for managing AI Vision Analysis models
 */
export async function getAIVisionAnalysis(projectId: string): Promise<AIVisionAnalysis | null> {
  return serviceGet(projectId);
}

export async function saveAIVisionAnalysis(analysis: AIVisionAnalysis): Promise<AIVisionAnalysis> {
  return serviceSave(analysis);
}

export async function triggerMockAIVisionAnalysis(projectId: string): Promise<AIVisionAnalysis> {
  return serviceTrigger(projectId);
}

export const AIVisionAnalysisRepository = {
  getAIVisionAnalysis,
  saveAIVisionAnalysis,
  triggerMockAIVisionAnalysis
};
