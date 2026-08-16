// ============================================================================
// URJAFLUX AI OS - BLUEPRINT SEMANTIC UNDERSTANDING ENGINE (BSUE v1.0)
// Production Grade Canonical Architectural Semantic Intelligence Orchestrator
// Transforms mathematically verified blueprint model (BMUE v1) into
// canonical semantic representation of property (BSUE v1).
// ============================================================================

import { 
  IBlueprintSemanticModel, 
  IBsueFutureReservedHooks 
} from "./types/bsue.types";

import {
  IBlueprintSemanticModelV15
} from "./types/bsue_v1_5.types";

import { IBlueprintMathematicalModel } from "../bmue/types/bmue.types";

import { semanticFusionEngine } from "./engines/SemanticFusionEngine";
import { blueprintGrammarEngine } from "./engines/BlueprintGrammarEngine";
import { semanticRoomClassifier } from "./engines/SemanticRoomClassifier";
import { functionalSpaceEngine } from "./engines/FunctionalSpaceEngine";
import { architecturalSymbolEngine } from "./engines/ArchitecturalSymbolEngine";
import { roomRelationshipEngine } from "./engines/RoomRelationshipEngine";
import { spatialFunctionEngine } from "./engines/SpatialFunctionEngine";
import { semanticConsistencyEngine } from "./engines/SemanticConsistencyEngine";
import { semanticSelfCorrectionEngine } from "./engines/SemanticSelfCorrectionEngine";
import { blueprintKnowledgeReadinessEngine } from "./engines/BlueprintKnowledgeReadinessEngine";
import { semanticProofEngine } from "./engines/SemanticProofEngine";

// BSUE v1.5 Enterprise Hardening Engines
import { propertyTaxonomyEngine } from "./engines/PropertyTaxonomyEngine";
import { activityInferenceEngine } from "./engines/ActivityInferenceEngine";
import { humanFlowEngine } from "./engines/HumanFlowEngine";
import { usageProbabilityEngine } from "./engines/UsageProbabilityEngine";
import { consultantOverrideMemory } from "./engines/ConsultantOverrideMemory";
import { blueprintQualityAdvisor } from "./engines/BlueprintQualityAdvisor";
import { spatialBehaviorEngine } from "./engines/SpatialBehaviorEngine";
import { consistencyExplainabilityEngine } from "./engines/ConsistencyExplainabilityEngine";
import { semanticKnowledgeExportEngine } from "./engines/SemanticKnowledgeExportEngine";

export class BlueprintSemanticUnderstandingEngine {
  private static instance: BlueprintSemanticUnderstandingEngine;

  private constructor() {}

  public static getInstance(): BlueprintSemanticUnderstandingEngine {
    if (!BlueprintSemanticUnderstandingEngine.instance) {
      BlueprintSemanticUnderstandingEngine.instance = new BlueprintSemanticUnderstandingEngine();
    }
    return BlueprintSemanticUnderstandingEngine.instance;
  }

  /**
   * Main BSUE Pipeline Execution (v1.0 Canonical)
   * Converts IBlueprintMathematicalModel into canonical IBlueprintSemanticModel
   */
  public processSemanticUnderstanding(
    bmueModel: IBlueprintMathematicalModel
  ): IBlueprintSemanticModel {
    // ------------------------------------------------------------------------
    // STEP 1: Multi-Evidence Semantic Fusion
    // Fuse Geometry, OCR, Detected Objects, Connectivity, Windows & Doors
    // ------------------------------------------------------------------------
    const evidenceFusion = semanticFusionEngine.fuseEvidence(bmueModel);

    // ------------------------------------------------------------------------
    // STEP 2: Blueprint Grammar Engine
    // Terminology normalization across English, Hindi, Hinglish, Abbreviations
    // ------------------------------------------------------------------------
    const grammarMappings = blueprintGrammarEngine.getGrammarDictionary();

    // ------------------------------------------------------------------------
    // STEP 3: Multi-Evidence Semantic Room Classification
    // FOUNDER LOCKS: Geometry > OCR > Objects. Never classify on OCR alone.
    // ------------------------------------------------------------------------
    const semanticRooms = semanticRoomClassifier.classifyRooms(bmueModel, evidenceFusion);

    // ------------------------------------------------------------------------
    // STEP 4: Functional Space Analysis
    // Primary, Secondary, Mixed usage (Living+Dining, Kitchen+Utility)
    // ------------------------------------------------------------------------
    const functionalSpaces = functionalSpaceEngine.analyzeFunctionalSpaces(semanticRooms, bmueModel);

    // ------------------------------------------------------------------------
    // STEP 5: Architectural Symbol Recognition
    // WC, WB, D1, D2, W1, W2, UP, DN, COL, BEAM, SHAFT, ELEC, DB, STP, OHT
    // ------------------------------------------------------------------------
    const architecturalSymbols = architecturalSymbolEngine.extractSymbols(bmueModel);

    // ------------------------------------------------------------------------
    // STEP 6: Room Relationship Graph
    // Attached Toilets, Kitchen-Dining, Living-Dining circulation graph
    // ------------------------------------------------------------------------
    const relationshipGraph = roomRelationshipEngine.buildRelationshipGraph(semanticRooms, bmueModel);

    // ------------------------------------------------------------------------
    // STEP 7: Spatial Function & Privacy Zones
    // Public, Private, Service, Utility, Circulation, Open, Dead spaces
    // ------------------------------------------------------------------------
    const spatialFunctions = spatialFunctionEngine.assignSpatialFunctions(semanticRooms);

    // ------------------------------------------------------------------------
    // STEP 8: Semantic Consistency Engine
    // Rule validations (Kitchen without stove?, Bedroom without bed?, etc.)
    // ------------------------------------------------------------------------
    const inconsistencies = semanticConsistencyEngine.validateSemanticConsistency(semanticRooms, bmueModel);

    // ------------------------------------------------------------------------
    // STEP 9: Semantic Self-Correction & Ambiguity Registry
    // Manage conflicting evidence, ask for consultant review if needed
    // ------------------------------------------------------------------------
    const selfCorrectionReport = semanticSelfCorrectionEngine.processSelfCorrection(semanticRooms, inconsistencies);

    // ------------------------------------------------------------------------
    // STEP 10: Blueprint Knowledge Readiness Engine
    // Generate Knowledge Ready Rooms, Objects, Activities, Relationships & Context
    // ------------------------------------------------------------------------
    const knowledgeReadyContext = blueprintKnowledgeReadinessEngine.generateKnowledgeReadyContext(
      semanticRooms,
      functionalSpaces,
      relationshipGraph,
      bmueModel
    );

    // ------------------------------------------------------------------------
    // STEP 11: Semantic Proof Package
    // Verifiable proof package, confidence matrix & audit graphs
    // ------------------------------------------------------------------------
    const { confidenceProfiles, proofPackage } = semanticProofEngine.generateProofPackage(
      semanticRooms,
      relationshipGraph,
      evidenceFusion,
      knowledgeReadyContext
    );

    // Extract Semantic Objects from BMUE Containment Graph
    const semanticObjects = bmueModel.containmentGraph.containments.map(c => ({
      objectId: c.objectId,
      canonicalType: c.objectType,
      roomId: c.assignedRoomId,
      confidence: c.containmentConfidence
    }));

    // Build Unified Semantic Graph
    const semanticGraphNodes = semanticRooms.map(r => ({
      id: r.roomId,
      label: r.semanticLabel,
      category: r.canonicalType
    }));

    // Future Reserved Hooks (LLM review, BIM, IFC, DWG, Commercial / Hospital / Industrial taxonomy)
    const futureHooks: IBsueFutureReservedHooks = {
      llmSemanticReview: { status: 'STANDBY_READY' },
      bimSemanticMapping: bmueModel.futureHooks?.ifcBimMetadata,
      dwgSemanticLayers: bmueModel.futureHooks?.dwgDxfVectorLayers
    };

    return {
      propertyId: bmueModel.propertyId,
      propertyName: bmueModel.propertyName,
      version: '1.0.0-BSUE-SEMANTIC-CANONICAL',
      timestamp: new Date().toISOString(),

      semanticRooms,
      semanticObjects,
      functionalSpaces,
      architecturalSymbols,
      grammarMappings,
      relationshipGraph,
      semanticGraph: {
        nodes: semanticGraphNodes,
        edges: relationshipGraph.edges
      },
      evidenceFusion,
      confidenceProfiles,
      ambiguityRegistry: selfCorrectionReport.ambiguityRegistry,
      knowledgeReadyContext,
      semanticProofPackage: proofPackage,

      futureHooks
    };
  }

  /**
   * BSUE v1.5 Enterprise Cognition Pipeline Execution
   * Extends v1.0 canonical model with 9 Enterprise Hardening Engines
   */
  public processEnterpriseCognition(
    bmueModel: IBlueprintMathematicalModel
  ): IBlueprintSemanticModelV15 {
    // Execute Base BSUE v1.0 Pipeline
    const baseModel = this.processSemanticUnderstanding(bmueModel);

    // BSUE v1.5 Engine 1: Property Taxonomy Engine
    const taxonomy = propertyTaxonomyEngine.determineTaxonomy(baseModel.semanticRooms, bmueModel);

    // BSUE v1.5 Engine 2: Activity Inference Engine
    const activityInference = activityInferenceEngine.inferActivities(baseModel.semanticRooms, bmueModel);

    // BSUE v1.5 Engine 3: Human Flow Engine
    const humanFlow = humanFlowEngine.analyzeHumanFlow(baseModel.semanticRooms, baseModel.relationshipGraph, bmueModel);

    // BSUE v1.5 Engine 4: Usage Probability Engine
    const usageProbabilities = usageProbabilityEngine.computeUsageProbabilities(baseModel.semanticRooms, bmueModel);

    // BSUE v1.5 Engine 5: Consultant Override Memory
    const storeState = consultantOverrideMemory.getStoreState();

    // BSUE v1.5 Engine 6: Blueprint Quality Advisor
    const qualityAdvisorReport = blueprintQualityAdvisor.evaluateBlueprintQuality(bmueModel, baseModel.semanticRooms);

    // BSUE v1.5 Engine 7: Spatial Behavior Engine
    const spatialBehaviorMap = spatialBehaviorEngine.analyzeSpatialBehavior(baseModel.semanticRooms, bmueModel);

    // BSUE v1.5 Engine 8: Consistency Explainability Engine
    const explainabilityReport = consistencyExplainabilityEngine.generateExplainabilityReport(
      baseModel.semanticRooms,
      taxonomy,
      baseModel.relationshipGraph,
      baseModel.evidenceFusion,
      bmueModel
    );

    // BSUE v1.5 Engine 9: Semantic Knowledge Export Engine
    const semanticKnowledgeExport = semanticKnowledgeExportEngine.exportKnowledgePackage(
      baseModel.knowledgeReadyContext,
      taxonomy,
      activityInference,
      humanFlow,
      spatialBehaviorMap,
      bmueModel
    );

    return {
      ...baseModel,
      version15: '1.5.0-BSUE-ENTERPRISE-COGNITION',
      taxonomy,
      activityInference,
      humanFlow,
      usageProbabilities,
      consultantOverrideMemory: storeState,
      qualityAdvisorReport,
      spatialBehaviorMap,
      explainabilityReport,
      semanticKnowledgeExport
    };
  }
}

export const blueprintSemanticUnderstandingEngine = BlueprintSemanticUnderstandingEngine.getInstance();

