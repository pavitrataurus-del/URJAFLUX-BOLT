import { GeminiPromptTemplateKey } from "../types";

/**
 * ============================================================================
 * GEMINI PROMPT TEMPLATES
 * ============================================================================
 * Central repository of reusable spatial recognition prompt templates.
 *
 * ARCHITECTURAL RULE:
 * PromptBuilder must contain ZERO hardcoded prompt text. All template strings
 * reside exclusively in this file.
 */

export const GEMINI_PROMPT_TEMPLATES: Record<GeminiPromptTemplateKey, string> = {
  BLUEPRINT_FULL: `You are an expert CAD & Architectural Vision System.
Analyze the provided floor plan image (dimensions: {{IMAGE_WIDTH}}x{{IMAGE_HEIGHT}}, rotation: {{ROTATION}}deg).

COORDINATE SYSTEM MANDATE:
- Standard normalized coordinate system: 0 to 1000 integer range for both X and Y axes.
- Top-Left = (0,0), Bottom-Right = (1000,1000).
- Do NOT use float 0.0-1.0. All coordinates MUST be integers between 0 and 1000.

TASK:
Detect architectural building elements and return ONLY valid JSON matching this schema.
ROOM NAME RULE: For each room, the "name" field must be the exact text label printed on the blueprint.
Do not invent, assume, or normalize room types (e.g. do not add Pooja Room unless that text is visible).
If a space has no readable label, do not include it in the rooms array.
{
  "northAngleDegrees": 0,
  "scalePixelsPerMeter": 40,
  "scaleTextDetected": "1:100",
  "walls": [
    {
      "id": "wall_1",
      "start": { "x": 100, "y": 100 },
      "end": { "x": 900, "y": 100 },
      "thicknessNormalized": 20,
      "wallType": "EXTERIOR",
      "confidence": 0.95
    }
  ],
  "rooms": [
    {
      "id": "room_1",
      "name": "LIVING_ROOM",
      "polygonVertices": [
        { "x": 100, "y": 100 },
        { "x": 900, "y": 100 },
        { "x": 900, "y": 500 },
        { "x": 100, "y": 500 }
      ],
      "confidence": 0.90
    }
  ],
  "openings": [
    {
      "id": "door_1",
      "type": "DOOR",
      "start": { "x": 450, "y": 100 },
      "end": { "x": 550, "y": 100 },
      "confidence": 0.92
    }
  ],
  "annotations": [],
  "warnings": [],
  "overallConfidence": 0.93
}`,

  WALLS_ONLY: `You are an expert Architectural CAD Extraction Engine.
Analyze the provided floor plan ({{IMAGE_WIDTH}}x{{IMAGE_HEIGHT}}).
Extract ALL wall line segments into 0-1000 normalized integer coordinate space.

Return ONLY JSON:
{
  "walls": [
    {
      "id": "wall_1",
      "start": { "x": 100, "y": 100 },
      "end": { "x": 900, "y": 100 },
      "thicknessNormalized": 20,
      "wallType": "EXTERIOR",
      "confidence": 0.95
    }
  ]
}`,

  ROOMS_ONLY: `You are an expert Architectural Space Detection Engine.
Analyze the provided floor plan ({{IMAGE_WIDTH}}x{{IMAGE_HEIGHT}}).
Detect room boundaries only where a readable text label is visible on the blueprint.
Use the exact printed label as the room "name" — never substitute predefined room types.

Return ONLY JSON:
{
  "rooms": [
    {
      "id": "room_1",
      "name": "MASTER_BEDROOM",
      "polygonVertices": [
        { "x": 100, "y": 100 },
        { "x": 500, "y": 100 },
        { "x": 500, "y": 500 },
        { "x": 100, "y": 500 }
      ],
      "confidence": 0.90
    }
  ]
}`,

  OPENINGS_ONLY: `You are an expert Architectural Opening Detector.
Analyze the floor plan ({{IMAGE_WIDTH}}x{{IMAGE_HEIGHT}}).
Detect doors, windows, and archway openings in 0-1000 normalized integer space.

Return ONLY JSON:
{
  "openings": [
    {
      "id": "opening_1",
      "type": "DOOR",
      "start": { "x": 200, "y": 100 },
      "end": { "x": 300, "y": 100 },
      "confidence": 0.90
    }
  ]
}`,

  OCR_ONLY: `You are an expert Blueprint OCR Text Detector.
Extract room names, dimensions, labels, and orientation text in 0-1000 coordinate space.

Return ONLY JSON:
{
  "annotations": [
    {
      "id": "text_1",
      "text": "KITCHEN",
      "location": { "x": 300, "y": 300 },
      "category": "ROOM_NAME",
      "confidence": 0.95
    }
  ]
}`,

  NORTH_SCALE: `You are an expert Blueprint Orientation & Scale Calibrator.
Detect North Arrow angle in degrees (0-360) and scale text.

Return ONLY JSON:
{
  "northAngleDegrees": 0,
  "scalePixelsPerMeter": 40,
  "scaleTextDetected": "1:100",
  "confidence": 0.95
}`
};
