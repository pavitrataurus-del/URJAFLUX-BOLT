// ============================================================================
// URJAFLUX AI OS - SCL v1.1 ENGINE 17: SPATIAL STATE ENGINE
// Purpose: Tracks property lifecycle state transitions and historical milestones.
// ============================================================================

import {
  ISpatialPropertyStateModel,
  IStateTransitionRecord,
  PropertyLifecycleState,
} from "../types/scl.types";
import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class SpatialStateEngine {
  private static instance: SpatialStateEngine;

  private constructor() {}

  public static getInstance(): SpatialStateEngine {
    if (!SpatialStateEngine.instance) {
      SpatialStateEngine.instance = new SpatialStateEngine();
    }
    return SpatialStateEngine.instance;
  }

  public processPropertyState(semanticModel: IBlueprintSemanticModel): ISpatialPropertyStateModel {
    const propertyId = semanticModel.propertyId || 'PROP_1';
    const timestamp = semanticModel.timestamp || new Date().toISOString();

    const currentState: PropertyLifecycleState = 'EXISTING';
    const previousState: PropertyLifecycleState = 'APPROVED_BLUEPRINT';

    const stateTimeline: Array<{ state: PropertyLifecycleState; timestamp: string }> = [
      { state: 'BLUEPRINT_DRAFT', timestamp },
      { state: 'APPROVED_BLUEPRINT', timestamp },
      { state: 'UNDER_CONSTRUCTION', timestamp },
      { state: 'COMPLETED', timestamp },
      { state: 'EXISTING', timestamp },
    ];

    const stateTransitionHistory: IStateTransitionRecord[] = [
      {
        transitionId: `TRANS_${propertyId}_1`,
        fromState: 'BLUEPRINT_DRAFT',
        toState: 'APPROVED_BLUEPRINT',
        timestamp,
        triggeredBy: 'ARCHITECT_APPROVAL',
        remarks: 'Initial blueprint finalized and approved.',
      },
      {
        transitionId: `TRANS_${propertyId}_2`,
        fromState: 'APPROVED_BLUEPRINT',
        toState: 'UNDER_CONSTRUCTION',
        timestamp,
        triggeredBy: 'CONSTRUCTION_PERMIT',
        remarks: 'Physical construction started on site.',
      },
      {
        transitionId: `TRANS_${propertyId}_3`,
        fromState: 'UNDER_CONSTRUCTION',
        toState: 'COMPLETED',
        timestamp,
        triggeredBy: 'OCCUPANCY_CERTIFICATE',
        remarks: 'Property constructed and occupancy verified.',
      },
      {
        transitionId: `TRANS_${propertyId}_4`,
        fromState: 'COMPLETED',
        toState: 'EXISTING',
        timestamp,
        triggeredBy: 'SCL_STATE_ENGINE',
        remarks: 'Property currently in active use.',
      },
    ];

    return {
      currentState,
      previousState,
      stateTimeline,
      stateTransitionHistory,
    };
  }
}

export const spatialStateEngine = SpatialStateEngine.getInstance();
