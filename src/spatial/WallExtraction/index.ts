import { blueprintEngine } from "../BlueprintEngine/BlueprintEngine";
import { wallExtractionEngine } from "./WallExtractionEngine";

export * from "./types";
export * from "./WallValidator";
export * from "./WallExtractionEngine";
export * from "./WallRegistryAdapter";
export * from "./ExtensionHooks";

// Register Stage 2 hook into BlueprintEngine stage registry (passive registration)
blueprintEngine.registerStageHook(
  "STAGE_2_WALL_EXTRACTION",
  wallExtractionEngine.createPipelineStageHook()
);
