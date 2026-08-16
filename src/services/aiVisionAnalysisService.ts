import { 
  doc, 
  getDoc, 
  setDoc 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { AIVisionAnalysis } from "../types/aiVision";

const COLLECTION_NAME = "ai_vision_analyses";
const LOCAL_STORAGE_KEY = "urjaflux_ai_vision_analyses_fallback";

// Local storage fallback helpers
function getLocalFallbackAnalyses(): AIVisionAnalysis[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("[URJAFLUX AI OS] Error parsing local storage fallback AI vision analyses:", e);
    }
  }
  return [];
}

function saveLocalFallbackAnalyses(analyses: AIVisionAnalysis[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(analyses));
}

/**
 * Fetch an AI Vision Analysis for a given projectId
 */
export async function getAIVisionAnalysis(projectId: string): Promise<AIVisionAnalysis | null> {

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {

        return docSnap.data() as AIVisionAnalysis;
      }
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error fetching AI vision analysis from Firestore:", error);
    }
  }

  // Fallback to local storage
  const analyses = getLocalFallbackAnalyses();
  return analyses.find((a) => a.projectId === projectId || a.id === projectId) || null;
}

/**
 * Save an AI Vision Analysis document
 */
export async function saveAIVisionAnalysis(analysis: AIVisionAnalysis): Promise<AIVisionAnalysis> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, analysis.id);
      await setDoc(docRef, analysis, { merge: true });

      return analysis;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error saving AIVisionAnalysis to Firestore:", error);
    }
  }

  // Local storage fallback
  const analyses = getLocalFallbackAnalyses();
  const filtered = analyses.filter((a) => a.id !== analysis.id);
  filtered.push(analysis);
  saveLocalFallbackAnalyses(filtered);

  return analysis;
}

/**
 * Trigger real AI Vision Analysis document initialization for architecture verification
 */
export async function triggerMockAIVisionAnalysis(projectId: string): Promise<AIVisionAnalysis> {
  const emptyAnalysis: AIVisionAnalysis = {
    id: projectId,
    projectId: projectId,
    analyzedAt: new Date().toISOString(),
    status: "placeholder",
    analysisState: "placeholder",
    rooms: [],
    walls: [],
    doors: [],
    windows: [],
    compass: {
      confidence: 0,
      center: { x: 0, y: 0 },
      northAngle: 0
    },
    scale: {
      confidence: 0,
      scaleBarBoundingBox: {
        min: { x: 0, y: 0 },
        max: { x: 0, y: 0 }
      },
      detectedLengthMeters: 0,
      pixelsPerUnit: 1
    },
    ocrLabels: [],
    rawOutput: `Awaiting blueprint canvas OCR scan for projectId: ${projectId}`
  };

  await saveAIVisionAnalysis(emptyAnalysis);
  return emptyAnalysis;
}

export const aiVisionAnalysisService = {
  getAIVisionAnalysis,
  saveAIVisionAnalysis,
  triggerMockAIVisionAnalysis
};
