import { WallEntity } from "./types";
import { BlueprintData } from "../../components/CadBlueprintWorkspace";

/**
 * ============================================================================
 * DOWNSTREAM PIPELINE EXTENSION HOOKS (PASSIVE INTERFACES ONLY)
 * ============================================================================
 * These interfaces define contracts for future pipeline stages.
 * NO execution or AI recognition logic is performed in this sprint.
 */

// Stage 3: Polygon Detection Contract
export interface IPolygonBuilderStage {
  readonly stageName: "STAGE_3_POLYGON_DETECTION";
  buildPolygonsFromWalls(walls: readonly WallEntity[]): Promise<{ polygonIds: string[] }>;
}

// Stage 4: Room Detection Contract
export interface IRoomBuilderStage {
  readonly stageName: "STAGE_4_ROOM_DETECTION";
  detectRoomsFromPolygons(polygonIds: string[]): Promise<{ roomIds: string[] }>;
}

// Stage 5: Opening Detection Contract (Doors & Windows)
export interface IOpeningDetectorStage {
  readonly stageName: "STAGE_5_OPENING_DETECTION";
  detectOpenings(blueprint: BlueprintData, walls: readonly WallEntity[]): Promise<{ openingIds: string[] }>;
}

// Stage 6: Semantic Classification Contract
export interface ISemanticClassificationStage {
  readonly stageName: "STAGE_6_SEMANTIC_CLASSIFICATION";
  classifySpatialElements(elementIds: string[]): Promise<{ classifications: Record<string, string> }>;
}
