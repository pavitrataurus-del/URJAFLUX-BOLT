import { FLOOR_PLAN_VALIDATION_PROMPT, FLOOR_PLAN_VALIDATION_SCHEMA, OCR_EXTRACTION_PROMPT, OCR_EXTRACTION_SCHEMA } from "./geminiPrompts";

const GEMINI_MODEL = "gemini-3.6-flash";

export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export type GeminiPart = TextPart | InlineDataPart;
export type GeminiContents = string | GeminiPart | (string | GeminiPart)[];

export interface GeminiConfig {
  responseMimeType?: "application/json" | "text/plain";
  responseSchema?: any;
}

async function executeGenerateContent(
  contents: GeminiContents,
  config?: GeminiConfig
): Promise<string> {
  const response = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      contents,
      config,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

export async function testGeminiConnection(): Promise<string> {
  try {
    return await executeGenerateContent(
      "Hello, this is a connection test. Please respond with exactly 'Connection successful!'"
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini connection test failed: ${errorMessage}`);
  }
}

export interface FloorPlanValidationResult {
  success: boolean;
  readable: boolean;
  isFloorPlan: boolean;
  confidence: number;
  notes: string;
}

function isValidFloorPlanValidationResult(data: unknown): data is FloorPlanValidationResult {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.success === "boolean" &&
    typeof d.readable === "boolean" &&
    typeof d.isFloorPlan === "boolean" &&
    typeof d.confidence === "number" &&
    typeof d.notes === "string"
  );
}

export async function analyzeFloorPlan(projectId: string, imageBase64: string): Promise<FloorPlanValidationResult> {
  if (!projectId) throw new Error("Project ID is required");
  if (!imageBase64) throw new Error("Image data is required");

  let mimeType = "image/png";
  let base64Data = imageBase64;

  if (imageBase64.startsWith("data:")) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    } else {
      throw new Error("Invalid base64 image data URI format");
    }
  }

  const imagePart: InlineDataPart = {
    inlineData: { mimeType, data: base64Data },
  };
  const promptPart: TextPart = { text: FLOOR_PLAN_VALIDATION_PROMPT };

  const responseText = await executeGenerateContent([imagePart, promptPart], {
    responseMimeType: "application/json",
    responseSchema: FLOOR_PLAN_VALIDATION_SCHEMA,
  });

  try {
    const parsedData: unknown = JSON.parse(responseText);
    if (!isValidFloorPlanValidationResult(parsedData)) {
      throw new Error("Parsed response does not match FloorPlanValidationResult shape");
    }
    return parsedData;
  } catch (parseError) {
    const parseErrorMessage = parseError instanceof Error ? parseError.message : String(parseError);
    throw new Error(`Failed to parse Gemini Vision validation response: ${parseErrorMessage}`);
  }
}

export interface OCRExtractedItem {
  id: string;
  text: string;
  category: "room" | "dimension" | "scale" | "compass" | "annotation" | "other";
  confidence: number;
  boundingBox: {
    min: { x: number; y: number };
    max: { x: number; y: number };
  };
}

export interface OCRExtractionResult {
  projectId: string;
  extractedAt: string;
  items: OCRExtractedItem[];
}

interface RawOCRResponse {
  items?: unknown[];
}

function isValidOCRResponse(data: unknown): data is RawOCRResponse {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.items !== undefined && !Array.isArray(d.items)) return false;
  
  if (Array.isArray(d.items)) {
    return d.items.every((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const i = item as Record<string, unknown>;
      const hasRequired = typeof i.id === "string" && typeof i.text === "string" && typeof i.category === "string" && typeof i.confidence === "number";
      if (!hasRequired) return false;
      const validCategory = ["room", "dimension", "scale", "compass", "annotation", "other"].includes(i.category as string);
      if (!validCategory) return false;
      return true;
    });
  }
  return true;
}

export async function extractOCRMetadata(projectId: string, imageBase64: string): Promise<OCRExtractionResult> {
  if (!projectId) throw new Error("Project ID is required");
  if (!imageBase64) throw new Error("Image data is required");

  let mimeType = "image/png";
  let base64Data = imageBase64;

  if (imageBase64.startsWith("data:")) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    } else {
      throw new Error("Invalid base64 image data URI format");
    }
  }

  const imagePart: InlineDataPart = {
    inlineData: { mimeType, data: base64Data },
  };
  const promptPart: TextPart = { text: OCR_EXTRACTION_PROMPT };

  const responseText = await executeGenerateContent([imagePart, promptPart], {
    responseMimeType: "application/json",
    responseSchema: OCR_EXTRACTION_SCHEMA,
  });

  try {
    const parsedData: unknown = JSON.parse(responseText);
    if (!isValidOCRResponse(parsedData)) {
      throw new Error("Parsed response does not match expected OCR schema structure");
    }
    const items = (parsedData as RawOCRResponse).items as OCRExtractedItem[] || [];
    return {
      projectId,
      extractedAt: new Date().toISOString(),
      items,
    };
  } catch (parseError) {
    const parseErrorMessage = parseError instanceof Error ? parseError.message : String(parseError);
    throw new Error(`Failed to parse Gemini Vision OCR response: ${parseErrorMessage}`);
  }
}

export const geminiVisionService = {
  testGeminiConnection,
  analyzeFloorPlan,
  extractOCRMetadata,
};
