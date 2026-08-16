// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 14: COGNITIVE SELF VALIDATION ENGINE
// Validates integrity of spatial cognition model across 7 cognitive checks:
// Disconnected Behaviors, Impossible Dependencies, Circular References,
// Broken Narratives, Invalid Hierarchies, Missing Context, Unknown Activities
// ============================================================================

import { 
  ICognitiveSelfValidationModel, 
  IValidationCognitionIssue, 
  ISpatialBehaviorModel, 
  IFunctionalDependencyModel, 
  ISpatialNarrativeModel, 
  ISpatialHierarchyModel, 
  ISpatialContextNormalized 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class CognitiveSelfValidationEngine {
  private static instance: CognitiveSelfValidationEngine;

  private constructor() {}

  public static getInstance(): CognitiveSelfValidationEngine {
    if (!CognitiveSelfValidationEngine.instance) {
      CognitiveSelfValidationEngine.instance = new CognitiveSelfValidationEngine();
    }
    return CognitiveSelfValidationEngine.instance;
  }

  public validateCognition(
    semanticModel: IBlueprintSemanticModel,
    behaviorModel: ISpatialBehaviorModel,
    dependencyModel: IFunctionalDependencyModel,
    narrativeModel: ISpatialNarrativeModel,
    hierarchyModel: ISpatialHierarchyModel,
    normalizedContext: ISpatialContextNormalized
  ): ICognitiveSelfValidationModel {
    const detectedIssues: IValidationCognitionIssue[] = [];

    let disconnectedBehaviorsCount = 0;
    let impossibleDependenciesCount = 0;
    let circularReferencesCount = 0;
    let brokenNarrativesCount = 0;
    let invalidHierarchiesCount = 0;
    let missingContextCount = 0;
    let unknownActivitiesCount = 0;

    // Check 1: Disconnected Behaviors (Rooms with behavior but 0 connectivity)
    behaviorModel.behaviorProfiles.forEach(beh => {
      const edges = semanticModel.relationshipGraph.edges.filter(e => e.sourceRoomId === beh.roomId || e.targetRoomId === beh.roomId);
      if (edges.length === 0 && semanticModel.semanticRooms.length > 1) {
        disconnectedBehaviorsCount++;
        detectedIssues.push({
          issueCode: 'DISCONNECTED_BEHAVIOR',
          message: `Behavior profile '${beh.primaryBehavior}' assigned to isolated room polygon (${beh.roomId}).`,
          severity: 'WARNING',
          affectedEntityIds: [beh.roomId]
        });
      }
    });

    // Check 2: Impossible Dependencies (Dependencies referencing non-existent rooms)
    const validRoomIds = new Set(semanticModel.semanticRooms.map(r => r.roomId));
    dependencyModel.dependencies.forEach(dep => {
      if (!validRoomIds.has(dep.sourceRoomId) || !validRoomIds.has(dep.targetRoomId)) {
        impossibleDependenciesCount++;
        detectedIssues.push({
          issueCode: 'IMPOSSIBLE_DEPENDENCY',
          message: `Dependency '${dep.dependencyId}' references missing room ID.`,
          severity: 'CRITICAL',
          affectedEntityIds: [dep.sourceRoomId, dep.targetRoomId]
        });
      }
    });

    // Check 3: Circular References in Dependencies (e.g. A -> B and B -> A)
    const depPairs = new Set<string>();
    dependencyModel.dependencies.forEach(dep => {
      const pairKey = `${dep.sourceRoomId}->${dep.targetRoomId}`;
      const revKey = `${dep.targetRoomId}->${dep.sourceRoomId}`;
      if (depPairs.has(revKey)) {
        circularReferencesCount++;
        detectedIssues.push({
          issueCode: 'CIRCULAR_DEPENDENCY_REFERENCE',
          message: `Circular dependency detected between ${dep.sourceRoomId} and ${dep.targetRoomId}.`,
          severity: 'WARNING',
          affectedEntityIds: [dep.sourceRoomId, dep.targetRoomId]
        });
      }
      depPairs.add(pairKey);
    });

    // Check 4: Broken Narratives (Narrative steps referencing invalid rooms)
    narrativeModel.narrativeSequence.forEach(s => {
      if (!validRoomIds.has(s.toRoomId)) {
        brokenNarrativesCount++;
        detectedIssues.push({
          issueCode: 'BROKEN_NARRATIVE_STEP',
          message: `Narrative step ${s.stepIndex} transitions to invalid room ${s.toRoomId}.`,
          severity: 'CRITICAL',
          affectedEntityIds: [s.toRoomId]
        });
      }
    });

    // Check 5: Invalid Hierarchies
    if (hierarchyModel.totalHierarchyDepth <= 0 || !hierarchyModel.propertyNode) {
      invalidHierarchiesCount++;
      detectedIssues.push({
        issueCode: 'INVALID_HIERARCHY_TREE',
        message: 'Spatial hierarchy tree lacks valid root or depth hierarchy.',
        severity: 'CRITICAL',
        affectedEntityIds: [hierarchyModel.propertyNode.entityId]
      });
    }

    // Check 6: Missing Context
    if (normalizedContext.normalizedRooms.length === 0) {
      missingContextCount++;
      detectedIssues.push({
        issueCode: 'MISSING_ROOM_CONTEXT',
        message: 'Normalized spatial context contains 0 rooms.',
        severity: 'CRITICAL',
        affectedEntityIds: []
      });
    }

    // Check 7: Unknown Activities
    normalizedContext.normalizedActivities.forEach(act => {
      if (!act.primary || act.primary === 'UNKNOWN') {
        unknownActivitiesCount++;
        detectedIssues.push({
          issueCode: 'UNKNOWN_ACTIVITY_INFERRED',
          message: `Unclassified activity in room ${act.roomId}.`,
          severity: 'INFO',
          affectedEntityIds: [act.roomId]
        });
      }
    });

    const isValid = detectedIssues.filter(i => i.severity === 'CRITICAL').length === 0;

    return {
      isValid,
      validationChecks: {
        disconnectedBehaviorsCount,
        impossibleDependenciesCount,
        circularReferencesCount,
        brokenNarrativesCount,
        invalidHierarchiesCount,
        missingContextCount,
        unknownActivitiesCount
      },
      detectedIssues
    };
  }
}

export const cognitiveSelfValidationEngine = CognitiveSelfValidationEngine.getInstance();
