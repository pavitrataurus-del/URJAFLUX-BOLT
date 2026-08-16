// ============================================================================
// URJAFLUX AI OS - SCL v1.1 ENGINE 21: SCENARIO SNAPSHOT ENGINE
// Purpose: Manages isolated, non-destructive scenario snapshots (Current,
// Consultant Proposal, Client Proposal, Future Expansion, etc.).
// ============================================================================

import {
  IScenarioSnapshotRegistryModel,
  IScenarioRecord,
  IScenarioComparison,
  SclScenarioType,
} from "../types/scl.types";
import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class ScenarioSnapshotEngine {
  private static instance: ScenarioSnapshotEngine;

  private constructor() {}

  public static getInstance(): ScenarioSnapshotEngine {
    if (!ScenarioSnapshotEngine.instance) {
      ScenarioSnapshotEngine.instance = new ScenarioSnapshotEngine();
    }
    return ScenarioSnapshotEngine.instance;
  }

  public registerScenarios(semanticModel: IBlueprintSemanticModel): IScenarioSnapshotRegistryModel {
    const propertyId = semanticModel.propertyId || 'PROP_1';
    const timestamp = semanticModel.timestamp || new Date().toISOString();
    const roomCount = semanticModel.semanticRooms?.length || 0;

    const scenarioTypes: SclScenarioType[] = [
      'CURRENT_PROPERTY',
      'SCENARIO_A',
      'CONSULTANT_PROPOSAL',
      'CLIENT_PROPOSAL',
      'FUTURE_EXPANSION',
    ];

    const scenarioRegistry: IScenarioRecord[] = scenarioTypes.map((scenarioType, idx) => ({
      scenarioId: `SCEN_${propertyId}_${scenarioType}`,
      scenarioType,
      name: scenarioType.replace(/_/g, ' '),
      description: `Isolated scenario snapshot for ${scenarioType}`,
      isIsolated: true,
      createdAt: timestamp,
      roomCount: scenarioType === 'FUTURE_EXPANSION' ? roomCount + 2 : roomCount,
    }));

    const scenarioGraphNodes = scenarioRegistry.map((s) => ({
      id: s.scenarioId,
      type: s.scenarioType,
    }));

    const scenarioGraphEdges = [
      {
        source: `SCEN_${propertyId}_CURRENT_PROPERTY`,
        target: `SCEN_${propertyId}_SCENARIO_A`,
        relationship: 'BRANCHED_TO',
      },
      {
        source: `SCEN_${propertyId}_CURRENT_PROPERTY`,
        target: `SCEN_${propertyId}_CONSULTANT_PROPOSAL`,
        relationship: 'BRANCHED_TO',
      },
      {
        source: `SCEN_${propertyId}_CONSULTANT_PROPOSAL`,
        target: `SCEN_${propertyId}_CLIENT_PROPOSAL`,
        relationship: 'REVISED_BY',
      },
      {
        source: `SCEN_${propertyId}_CURRENT_PROPERTY`,
        target: `SCEN_${propertyId}_FUTURE_EXPANSION`,
        relationship: 'PROJECTED_TO',
      },
    ];

    const scenarioComparisons: IScenarioComparison[] = [
      {
        scenarioAId: `SCEN_${propertyId}_CURRENT_PROPERTY`,
        scenarioBId: `SCEN_${propertyId}_CONSULTANT_PROPOSAL`,
        roomCountDelta: 0,
        areaDeltaSqM: 0,
        keyDifferences: ['Door re-alignments', 'Zoning optimization', 'Internal circulation improvement'],
      },
      {
        scenarioAId: `SCEN_${propertyId}_CURRENT_PROPERTY`,
        scenarioBId: `SCEN_${propertyId}_FUTURE_EXPANSION`,
        roomCountDelta: 2,
        areaDeltaSqM: 45.0,
        keyDifferences: ['Upper floor extension', 'Terrace garden addition'],
      },
    ];

    return {
      scenarioRegistry,
      scenarioGraph: {
        nodes: scenarioGraphNodes,
        edges: scenarioGraphEdges,
      },
      scenarioComparisons,
    };
  }
}

export const scenarioSnapshotEngine = ScenarioSnapshotEngine.getInstance();
