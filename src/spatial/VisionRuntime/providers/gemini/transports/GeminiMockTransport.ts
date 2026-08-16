import { IGeminiTransport } from "../interfaces/IGeminiTransport";
import { GeminiRecognitionRequest, GeminiTransportResponse } from "../types";

/**
 * ============================================================================
 * GEMINI MOCK TRANSPORT
 * ============================================================================
 * Deterministic mock transport for offline unit testing and pipeline validation.
 */
export class GeminiMockTransport implements IGeminiTransport {
  private isCancelled = false;

  public async transmit(request: GeminiRecognitionRequest): Promise<GeminiTransportResponse> {
    this.isCancelled = false;
    const startTime = Date.now();

    // Simulated short async delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (this.isCancelled) {
      throw new Error("Mock transport operation cancelled.");
    }

    const mockSpatialJson = {
      northAngleDegrees: 0,
      scalePixelsPerMeter: 40,
      scaleTextDetected: "1:100",
      walls: [
        {
          id: "wall_ext_north",
          start: { x: 100, y: 100 },
          end: { x: 900, y: 100 },
          thicknessNormalized: 20,
          wallType: "EXTERIOR",
          confidence: 0.98
        },
        {
          id: "wall_ext_east",
          start: { x: 900, y: 100 },
          end: { x: 900, y: 900 },
          thicknessNormalized: 20,
          wallType: "EXTERIOR",
          confidence: 0.98
        },
        {
          id: "wall_ext_south",
          start: { x: 900, y: 900 },
          end: { x: 100, y: 900 },
          thicknessNormalized: 20,
          wallType: "EXTERIOR",
          confidence: 0.98
        },
        {
          id: "wall_ext_west",
          start: { x: 100, y: 900 },
          end: { x: 100, y: 100 },
          thicknessNormalized: 20,
          wallType: "EXTERIOR",
          confidence: 0.98
        },
        {
          id: "wall_int_vertical",
          start: { x: 500, y: 100 },
          end: { x: 500, y: 900 },
          thicknessNormalized: 15,
          wallType: "INTERIOR",
          confidence: 0.95
        },
        {
          id: "wall_int_horizontal",
          start: { x: 100, y: 500 },
          end: { x: 500, y: 500 },
          thicknessNormalized: 15,
          wallType: "INTERIOR",
          confidence: 0.95
        }
      ],
      rooms: [
        {
          id: "room_living",
          name: "LIVING_ROOM",
          polygonVertices: [
            { x: 100, y: 100 },
            { x: 500, y: 100 },
            { x: 500, y: 500 },
            { x: 100, y: 500 }
          ],
          boundaryWallIds: ["wall_ext_north", "wall_int_vertical", "wall_int_horizontal", "wall_ext_west"],
          confidence: 0.94
        },
        {
          id: "room_master",
          name: "MASTER_BEDROOM",
          polygonVertices: [
            { x: 500, y: 100 },
            { x: 900, y: 100 },
            { x: 900, y: 900 },
            { x: 500, y: 900 }
          ],
          boundaryWallIds: ["wall_ext_north", "wall_ext_east", "wall_ext_south", "wall_int_vertical"],
          confidence: 0.92
        },
        {
          id: "room_kitchen",
          name: "KITCHEN",
          polygonVertices: [
            { x: 100, y: 500 },
            { x: 500, y: 500 },
            { x: 500, y: 900 },
            { x: 100, y: 900 }
          ],
          boundaryWallIds: ["wall_int_horizontal", "wall_int_vertical", "wall_ext_south", "wall_ext_west"],
          confidence: 0.91
        }
      ],
      openings: [
        {
          id: "door_main",
          type: "DOOR",
          start: { x: 250, y: 100 },
          end: { x: 350, y: 100 },
          hostWallId: "wall_ext_north",
          confidence: 0.96
        },
        {
          id: "door_bedroom",
          type: "DOOR",
          start: { x: 500, y: 250 },
          end: { x: 500, y: 350 },
          hostWallId: "wall_int_vertical",
          confidence: 0.93
        },
        {
          id: "window_living",
          type: "WINDOW",
          start: { x: 100, y: 250 },
          end: { x: 100, y: 350 },
          hostWallId: "wall_ext_west",
          confidence: 0.95
        },
        {
          id: "window_bedroom",
          type: "WINDOW",
          start: { x: 900, y: 400 },
          end: { x: 900, y: 500 },
          hostWallId: "wall_ext_east",
          confidence: 0.94
        }
      ],
      annotations: [
        {
          id: "anno_north",
          text: "NORTH",
          location: { x: 500, y: 50 },
          category: "NORTH_INDICATOR",
          confidence: 0.98
        },
        {
          id: "anno_scale",
          text: "SCALE 1:100",
          location: { x: 500, y: 950 },
          category: "DIMENSION",
          confidence: 0.95
        }
      ],
      warnings: ["Mock transport active. Returning deterministic spatial CAD candidates."],
      overallConfidence: 0.95
    };

    return {
      rawJsonText: JSON.stringify(mockSpatialJson, null, 2),
      executionTimeMs: Date.now() - startTime,
      metadata: { transport: "GeminiMockTransport", blueprintId: request.blueprintId }
    };
  }

  public async cancel(): Promise<void> {
    this.isCancelled = true;
  }

  public async health(): Promise<{ status: "OK" | "DEGRADED" | "UNAVAILABLE"; message?: string }> {
    return { status: "OK", message: "Gemini Mock Transport ready." };
  }
}
