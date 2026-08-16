// ============================================================================
// URJAFLUX AI OS - SPATIAL COGNITION LAYER (SCL v1.0)
// Master Layer Orchestrator & Cognition Pipeline
// Transforms IBlueprintSemanticModel (BSUE) -> ISpatialCognitionModel
// FOUNDER LOCKS:
// - NO Vastu / Lal Kitab / Numerology / Astrology analysis.
// - NO remedies. NO doshas. NO Vastu confidence scoring.
// - NO ranking. NO recommendations. NO reasoning.
// - SCL prepares cognition only for downstream Knowledge Stack (KQE/KIE).
// ============================================================================

import { 
  ISpatialCognitionModel, 
  IFutureReservedCognitionHooks 
} from "./types/scl.types";

import { spatialHierarchyEngine } from "./engines/SpatialHierarchyEngine";
import { sclSpatialBehaviorEngine } from "./engines/SclSpatialBehaviorEngine";
import { energyFlowEngine } from "./engines/EnergyFlowEngine";
import { humanInteractionEngine } from "./engines/HumanInteractionEngine";
import { functionalDependencyEngine } from "./engines/FunctionalDependencyEngine";
import { spaceImportanceEngine } from "./engines/SpaceImportanceEngine";
import { temporalCognitionEngine } from "./engines/TemporalCognitionEngine";
import { environmentalContextEngine } from "./engines/EnvironmentalContextEngine";
import { spatialNarrativeEngine } from "./engines/SpatialNarrativeEngine";
import { cognitionGraphEngine } from "./engines/CognitionGraphEngine";
import { spatialContextEngine } from "./engines/SpatialContextEngine";
import { knowledgeContextGenerator } from "./engines/KnowledgeContextGenerator";
import { cognitiveExplainabilityEngine } from "./engines/CognitiveExplainabilityEngine";
import { cognitiveSelfValidationEngine } from "./engines/CognitiveSelfValidationEngine";

// SCL v1.1 Enterprise Hardening Engines
import { spatialMemoryEngine } from "./engines/SpatialMemoryEngine";
import { spatialIdentityEngine } from "./engines/SpatialIdentityEngine";
import { spatialStateEngine } from "./engines/SpatialStateEngine";
import { multiFloorEngine } from "./engines/MultiFloorEngine";
import { spatialEventEngine } from "./engines/SpatialEventEngine";
import { changeDetectionEngine } from "./engines/ChangeDetectionEngine";
import { scenarioSnapshotEngine } from "./engines/ScenarioSnapshotEngine";
import { propertyTimelineEngine } from "./engines/PropertyTimelineEngine";
import { cognitiveVersionManager } from "./engines/CognitiveVersionManager";
import { downstreamImpactEngine } from "./engines/DownstreamImpactEngine";

import { IBlueprintSemanticModel } from "../bsue/types/bsue.types";

export class SpatialCognitionLayer {
  private static instance: SpatialCognitionLayer;

  private constructor() {}

  public static getInstance(): SpatialCognitionLayer {
    if (!SpatialCognitionLayer.instance) {
      SpatialCognitionLayer.instance = new SpatialCognitionLayer();
    }
    return SpatialCognitionLayer.instance;
  }

  /**
   * Primary Entry Point: Process SCL Spatial Cognition Pipeline
   * Consumes BSUE Semantic Model and outputs ISpatialCognitionModel
   */
  public processSpatialCognition(semanticModel: IBlueprintSemanticModel): ISpatialCognitionModel {
    if (!semanticModel || !semanticModel.semanticRooms) {
      throw new Error("SCL Execution Failure: Invalid or missing IBlueprintSemanticModel input.");
    }

    const timestamp = new Date().toISOString();
    const propertyId = semanticModel.propertyId || 'PROP_1';
    const propertyName = semanticModel.propertyName || 'Property';

    // Engine 1: Spatial Hierarchy Engine
    const hierarchyModel = spatialHierarchyEngine.buildHierarchy(semanticModel);

    // Engine 2: Spatial Behavior Engine
    const behaviorModel = sclSpatialBehaviorEngine.analyzeBehaviors(semanticModel);

    // Engine 3: Energy Flow Engine
    const energyFlowModel = energyFlowEngine.analyzeEnergyFlow(semanticModel);

    // Engine 4: Human Interaction Engine
    const interactionModel = humanInteractionEngine.analyzeInteractions(semanticModel);

    // Engine 5: Functional Dependency Engine
    const dependencyModel = functionalDependencyEngine.analyzeDependencies(semanticModel);

    // Engine 6: Space Importance Engine
    const importanceModel = spaceImportanceEngine.calculateImportance(semanticModel);

    // Engine 7: Temporal Cognition Engine
    const temporalModel = temporalCognitionEngine.analyzeTemporalProfiles(semanticModel);

    // Engine 8: Environmental Context Engine
    const environmentalModel = environmentalContextEngine.analyzeEnvironmentalContext(semanticModel);

    // Engine 9: Spatial Narrative Engine
    const narrativeModel = spatialNarrativeEngine.generateNarrativeGraph(semanticModel);

    // Engine 10: Cognition Graph Engine
    const cognitionGraph = cognitionGraphEngine.constructCognitionGraph(
      semanticModel,
      behaviorModel,
      interactionModel,
      dependencyModel,
      energyFlowModel,
      narrativeModel
    );

    // Engine 11: Spatial Context Engine
    const spatialContext = spatialContextEngine.normalizeSpatialContext(
      semanticModel,
      behaviorModel,
      dependencyModel,
      hierarchyModel,
      narrativeModel
    );

    // Engine 12: Knowledge Context Generator
    const knowledgeContext = knowledgeContextGenerator.generateKnowledgeContext(
      semanticModel,
      spatialContext,
      behaviorModel,
      dependencyModel,
      narrativeModel,
      hierarchyModel
    );

    // Engine 13: Cognitive Explainability Engine
    const explainability = cognitiveExplainabilityEngine.explainCognition(
      semanticModel,
      behaviorModel,
      dependencyModel
    );

    // Engine 14: Cognitive Self Validation Engine
    const validation = cognitiveSelfValidationEngine.validateCognition(
      semanticModel,
      behaviorModel,
      dependencyModel,
      narrativeModel,
      hierarchyModel,
      spatialContext
    );

    // --- SCL v1.1 Enterprise Hardening Engines (15 - 24) ---
    // Engine 15: Spatial Memory Engine
    const spatialMemory = spatialMemoryEngine.processMemory(semanticModel);

    // Engine 16: Spatial Identity Engine
    const identityRegistry = spatialIdentityEngine.registerIdentities(semanticModel);

    // Engine 17: Spatial State Engine
    const propertyState = spatialStateEngine.processPropertyState(semanticModel);

    // Engine 18: Multi Floor Cognition Engine
    const floorModel = multiFloorEngine.processMultiFloor(semanticModel);

    // Engine 19: Spatial Event Engine
    const eventRegistry = spatialEventEngine.registerEvents(semanticModel);

    // Engine 20: Change Detection Engine
    const changeDetection = changeDetectionEngine.detectChanges(semanticModel);

    // Engine 21: Scenario Snapshot Engine
    const scenarioRegistry = scenarioSnapshotEngine.registerScenarios(semanticModel);

    // Engine 22: Property Timeline Engine
    const timeline = propertyTimelineEngine.processTimeline(semanticModel);

    // Engine 23: Cognitive Version Manager
    const versionManager = cognitiveVersionManager.manageVersions(semanticModel);

    // Engine 24: Downstream Impact Engine
    const impactAnalysis = downstreamImpactEngine.analyzeImpact(semanticModel);

    // Future Reserved Hooks (Digital Twin, BIM, IFC, 3D, AR, VR, IoT, Live Occupancy, Smart Building, Robotics Navigation)
    const futureHooks: IFutureReservedCognitionHooks = {
      digitalTwin: { enabled: false },
      bim: { enabled: false },
      ifc: { enabled: false },
      spatialCognition3D: { enabled: false },
      ar: { enabled: false },
      vr: { enabled: false },
      iotSensors: { enabled: false, activeSensorCount: 0 },
      liveOccupancy: { enabled: false, currentOccupantCount: 0 },
      smartBuilding: { enabled: false },
      roboticsNavigation: { enabled: false, gridResolutionMeters: 0.1 }
    };

    return {
      version: '1.1.0-SCL-ENTERPRISE-HARDENING',
      propertyId,
      propertyName,
      timestamp,
      hierarchyModel,
      behaviorModel,
      energyFlowModel,
      interactionModel,
      dependencyModel,
      importanceModel,
      temporalModel,
      environmentalModel,
      narrativeModel,
      cognitionGraph,
      spatialContext,
      knowledgeContext,
      explainability,
      validation,
      futureHooks,
      spatialMemory,
      identityRegistry,
      propertyState,
      floorModel,
      eventRegistry,
      changeDetection,
      scenarioRegistry,
      timeline,
      versionManager,
      impactAnalysis,
    };
  }
}

export const spatialCognitionLayer = SpatialCognitionLayer.getInstance();
