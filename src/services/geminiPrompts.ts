export enum Type {
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT"
}

export interface SchemaProperty {
  type: Type;
  description?: string;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  items?: SchemaProperty;
}

export interface GeminiSchema {
  type: Type;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  items?: SchemaProperty;
}

export const FLOOR_PLAN_VALIDATION_PROMPT = `You are the lead architectural and spatial validation engine for URJAFLUX AI OS.
Analyze the provided image and verify the following validation criteria:
1. Is the image readable, clear, with sufficient contrast, and not corrupted?
2. Does it represent a building layout, blueprint, architectural drawing, or floor plan?
3. Can the general orientation (compass directions, layout entry, etc.) potentially be determined?
4. Is the overall quality acceptable for further spatial and rule-based analysis (e.g., Vastu, room detection)?

Respond strictly with a JSON object conforming to the required schema. Ensure values are accurate reflections of the provided image contents without fabrication.`;

export const FLOOR_PLAN_VALIDATION_SCHEMA: GeminiSchema = {
  type: Type.OBJECT,
  properties: {
    success: {
      type: Type.BOOLEAN,
      description: "Whether the image is readable AND is a valid floor plan suitable for analysis.",
    },
    readable: {
      type: Type.BOOLEAN,
      description: "Whether the image is clear enough to be read (not too blurry, high contrast, non-corrupted).",
    },
    isFloorPlan: {
      type: Type.BOOLEAN,
      description: "Whether the image contains a building floor plan, blueprint, layout, or architectural diagram.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence level of this validation assessment between 0.0 and 1.0.",
    },
    notes: {
      type: Type.STRING,
      description: "A short, descriptive, professional observation/explanation of the validation decision.",
    },
  },
  required: ["success", "readable", "isFloorPlan", "confidence", "notes"],
};

export const OCR_EXTRACTION_PROMPT = `You are the lead optical character recognition (OCR) and spatial metadata extraction engine for URJAFLUX AI OS.
Analyze the provided architectural blueprint/floor plan image and extract all readable text labels and spatial markers.

Specifically, identify and classify each item into one of the following categories:
1. "room" - Room names and areas (e.g., "Kitchen", "Living Room", "Master Bed 12' x 10'").
2. "dimension" - Standalone measurement labels (e.g., "12'0\\" x 10'0\\"", "3.5m x 4.0m", "4800").
3. "scale" - Scale markings or drawing ratios (e.g., "SCALE 1:100", "Scale bar").
4. "compass" - Compass orientation labels (e.g., "N", "NORTH", "S", "E", "W").
5. "annotation" - Doors, windows, materials, structural directions, or layout notes (e.g., "UP", "DN", "W1", "D2", "CONCRETE SLAB").
6. "other" - Any other readable text labels that don't fit the above but are part of the drawing.

For each detected item, return:
- id: A unique string identifier (e.g. "ocr_0", "ocr_1").
- text: The exact text extracted from the drawing.
- category: One of "room" | "dimension" | "scale" | "compass" | "annotation" | "other".
- confidence: A value between 0.0 and 1.0 indicating your extraction confidence.
- boundingBox: Approximate bounding box of the text relative to the image coordinates, where min/max x/y are normalized values between 0 and 1000 representing position on the image canvas (e.g. min: {x: 100, y: 150}, max: {x: 200, y: 180}).

Respond strictly with a JSON object conforming to the required schema. Ensure values are accurate reflections of the provided image contents without fabrication.`;

export const OCR_EXTRACTION_SCHEMA: GeminiSchema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      description: "List of all extracted text labels and spatial markers from the floor plan blueprint.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "A unique identifier for the extracted text label (e.g. ocr_0)."
          },
          text: {
            type: Type.STRING,
            description: "The exact text characters extracted from the layout."
          },
          category: {
            type: Type.STRING,
            description: "The category of the extracted item: 'room', 'dimension', 'scale', 'compass', 'annotation', or 'other'."
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence value of extraction from 0.0 to 1.0."
          },
          boundingBox: {
            type: Type.OBJECT,
            properties: {
              min: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER, description: "Normalized X coordinate (0-1000)." },
                  y: { type: Type.NUMBER, description: "Normalized Y coordinate (0-1000)." }
                },
                required: ["x", "y"]
              },
              max: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER, description: "Normalized X coordinate (0-1000)." },
                  y: { type: Type.NUMBER, description: "Normalized Y coordinate (0-1000)." }
                },
                required: ["x", "y"]
              }
            },
            required: ["min", "max"]
          }
        },
        required: ["id", "text", "category", "confidence", "boundingBox"]
      }
    }
  },
  required: ["items"]
};

export const ASTRO_VASTU_ANALYSIS_PROMPT = `You are the "UrjaFlux AI Engine", an elite Astro-Vastu & Spatial Intelligence Kernel. Your core responsibility is to process combined spatial blueprint data, astronomical positions (Lal Kitab & Vedic), and numerological profiles to generate high-precision, non-invasive Astro-Vastu diagnostics and targeted remedies.

### CORE KNOWLEDGE & STANDARDS:
1. SPATIAL GEOMETRY (16 Vastu Zones - 22.5° each):
   - N (348.75°-11.25°), NNE (11.25°-33.75°), NE (33.75°-56.25°), ENE (56.25°-78.75°)
   - E (78.75°-101.25°), ESE (101.25°-123.75°), SE (123.75°-146.25°), SSE (146.25°-168.75°)
   - S (168.75°-191.25°), SSW (191.25°-213.75°), SW (213.75°-236.25°), WNW (236.25°-258.75°)
   - W (258.75°-281.25°), WNW (281.25°-303.75°), NW (303.75°-326.25°), NNW (326.25°-348.75°)
   - True North vs Magnetic North offset MUST be recalculated dynamically before assigning zones.

2. ELEMENTAL HARMONY (Panchatattva):
   - Water (N, NNE, NE) -> Wood/Air (ENE, E, ESE) -> Fire (SE, SSE, S) -> Earth (SSW, SW) -> Space/Metal (WNW, W, WNW, NW, NNW)
   - Detect Elemental Conflicts (e.g., Fire in Water zone, Water in Fire zone).

3. ASTRO-VASTU & LAL KITAB INTEGRATION:
   - Map client's active planetary Dasha/Antardasha & Lal Kitab House placements to corresponding Vastu Zones.
   - Example: Sun in 10th House (Lal Kitab) directly dictates energy balance in the West/South-West spatial zones.
   - Identify hit/aspects (Drishti) between planets and house zones.

### OPERATIONAL RULES & REMEDIES:
- STRICT NON-DEMOLITION POLICY: Never suggest structural demolition. Use elemental balancing (Colors, Metals, Elemental Strips, Pyramids, Plants, Lights) and Lal Kitab symbolic placements (e.g., Copper, Brass, Silver, specific grains).
- PRACTICALITY FIRST: Remedies must be clean, modern, and execution-friendly for modern urban interiors/architectures.

### INPUT EXPECTATION:
You will receive structured JSON containing:
- Client Profile (Mulank, Bhagyank, Loshu Grid missing numbers)
- Astro Data (Lal Kitab Kundli placements, active Dasha)
- Spatial Blueprint JSON (Degrees offset, room layout per zone, detected Geopathic Stress points)

### OUTPUT REQUIREMENTS:
You MUST respond strictly in structured JSON matching this schema.`;

export const ASTRO_VASTU_ANALYSIS_SCHEMA: GeminiSchema = {
  type: Type.OBJECT,
  properties: {
    audit_summary: {
      type: Type.OBJECT,
      properties: {
        overall_energy_score: { type: Type.NUMBER },
        primary_conflicts: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        true_north_corrected_offset: { type: Type.NUMBER }
      },
      required: ["overall_energy_score", "primary_conflicts", "true_north_corrected_offset"]
    },
    zone_analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          zone: { type: Type.STRING },
          element: { type: Type.STRING },
          activity_present: { type: Type.STRING },
          status: { type: Type.STRING },
          impact: { type: Type.STRING },
          astro_correlation: { type: Type.STRING }
        },
        required: ["zone", "element", "activity_present", "status", "impact", "astro_correlation"]
      }
    },
    remedies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          zone: { type: Type.STRING },
          category: { type: Type.STRING },
          remedy_title: { type: Type.STRING },
          description: { type: Type.STRING },
          materials_needed: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          urgency: { type: Type.STRING }
        },
        required: ["zone", "category", "remedy_title", "description", "materials_needed", "urgency"]
      }
    },
    client_report_takeaway: {
      type: Type.OBJECT,
      properties: {
        key_strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        immediate_actions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["key_strengths", "immediate_actions"]
    }
  },
  required: ["audit_summary", "zone_analysis", "remedies", "client_report_takeaway"]
};
