/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 6
 *         UNIVERSAL CALCULATION ENGINE TYPES
 * ============================================================================
 * 
 * Clean, robust, type-safe interfaces and domain models for the Spring 6 
 * Universal Calculation Engine, completely decoupled from physical databases.
 */

export interface CalculationProject {
  id: string;
  name: string;
  code: string;
  status: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CalculationProperty {
  id: string;
  name: string;
  address: string;
  plotSize: string;
  energyRating?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface CalculationFloor {
  floorNumber: number;
  floorName: string;
  heightMeters?: number;
  areaMeters?: number;
}

export interface CalculationCompass {
  northAngle: number; // Degrees of deviation from true North
  confidence: number; // 0.0 to 1.0 confidence score
  magneticDeclination?: number;
}

export interface Coordinate2D {
  x: number;
  y: number;
}

export interface SpatialObject {
  id: string;
  name: string;
  type: string; // e.g. "kitchen", "bedroom", "water_tank"
  polygon?: Coordinate2D[];
  center?: Coordinate2D;
  areaMeters?: number;
  length?: number;
  width?: number;
}

export interface CalculationSpatialData {
  boundary?: Coordinate2D[];
  rooms: SpatialObject[];
  walls?: Array<{
    id: string;
    start: Coordinate2D;
    end: Coordinate2D;
    thicknessPx?: number;
  }>;
  doors?: Array<{
    id: string;
    center: Coordinate2D;
    widthPx?: number;
    angle?: number;
  }>;
  windows?: Array<{
    id: string;
    center: Coordinate2D;
    widthPx?: number;
    angle?: number;
  }>;
}

export interface KnowledgeReference {
  bookId: string;
  bookTitle: string;
  chapter?: string;
  verse?: string;
  citationText?: string;
}

export interface TriggeredRule {
  ruleId: string;
  pluginId: string;
  severity: "CATASTROPHIC" | "MAJOR" | "MODERATE" | "MINOR";
  matched: boolean;
  formulaIds?: string[];
}

export interface CalculationContext {
  project: CalculationProject;
  property: CalculationProperty;
  floor?: CalculationFloor;
  compass: CalculationCompass;
  spatialData: CalculationSpatialData;
  knowledgeReferences: KnowledgeReference[];
  triggeredRules: TriggeredRule[];
  pluginContext: Record<string, unknown>;
  variables: Record<string, number>; // stores calculated variables (supports chaining)
}

export type FormulaType =
  | "ARITHMETIC"
  | "PERCENTAGE"
  | "RATIO"
  | "DISTANCE"
  | "ANGLE"
  | "WEIGHTED_SCORE"
  | "CUSTOM";

export interface FormulaDefinition {
  id: string;
  type: FormulaType;
  expression: string; // e.g. "(width * length)" or "GoldenRatio"
  inputs: string[]; // names of keys from context or variables needed
  outputKey: string; // key where the result will be stored in variables
  config?: Record<string, unknown>; // e.g. weights for scoring, tolerances for angles
}

export interface CalculationModuleResult {
  moduleId: string;
  success: boolean;
  variables: Record<string, number>;
  logs: string[];
  error?: string;
}

export interface CalculationModule {
  moduleId: string;
  name: string;
  description: string;
  category: "SPATIAL_AREA" | "ROOM_DIMENSIONS" | "DIRECTIONAL_RATIOS" | "NUMEROLOGY" | "ASTRO_VARS" | "ENERGY_SCORES" | "CUSTOM";
  formulas: FormulaDefinition[];
  execute(context: CalculationContext): CalculationModuleResult;
}

export interface CalculationLog {
  id: string;
  timestamp: string;
  durationMs: number;
  inputs: {
    projectId: string;
    propertyId: string;
    moduleIds: string[];
  };
  outputs: {
    variables: Record<string, number>;
    success: boolean;
  };
  errors: string[];
  trace: string[];
}
