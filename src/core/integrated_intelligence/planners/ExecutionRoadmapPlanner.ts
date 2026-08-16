// ============================================================================
// URJAFLUX AI OS - EXECUTION ROADMAP PLANNER (IIE)
// Constructs Phased Implementation Roadmaps & Sequential Action Plans
// ============================================================================

import { 
  IBestRemedyCandidate, 
  IRoadmapActionItem, 
  IRemedyCompatibilityMatrix 
} from "../types/iie.types";

export class ExecutionRoadmapPlanner {

  /**
   * Generates a phased execution roadmap from selected best remedies and compatibility analysis
   */
  public planRoadmap(
    selectedRemedies: IBestRemedyCandidate[],
    compatibilityMatrix: IRemedyCompatibilityMatrix
  ): IRoadmapActionItem[] {
    const items: IRoadmapActionItem[] = [];

    // Sort remedies by priority and execution phase
    const sorted = [...selectedRemedies].sort((a, b) => {
      const priorityOrder = {
        'CRITICAL_IMMEDIATE': 1,
        'HIGH_PRIORITY': 2,
        'MEDIUM_PRIORITY': 3,
        'LOW_PRIORITY': 4,
        'OPTIONAL_ENHANCEMENT': 5
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    let stepNumber = 1;

    sorted.forEach(rem => {
      const text = rem.primaryRemedyText.toLowerCase();

      let complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'PROFESSIONAL_REQUIRED' = 'SIMPLE';
      let costCat: 'ZERO_COST' | 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

      if (rem.structuralCategory === 'NON_STRUCTURAL') {
        complexity = 'SIMPLE';
        costCat = text.includes("reorganize") || text.includes("move") ? 'ZERO_COST' : 'LOW';
      } else if (rem.structuralCategory === 'SEMI_STRUCTURAL') {
        complexity = 'MODERATE';
        costCat = 'MEDIUM';
      } else {
        complexity = 'PROFESSIONAL_REQUIRED';
        costCat = 'HIGH';
      }

      // Check for prerequisite remedies in compatibility links
      const prerequisites = compatibilityMatrix.compatibilityLinks
        .filter(link => link.targetRemedyId === rem.remedyId && link.relationshipType === 'SEQUENTIAL_PREREQUISITE')
        .map(link => link.sourceRemedyId);

      items.push({
        actionId: `IIE-STEP-${stepNumber}`,
        stepNumber: stepNumber++,
        phase: rem.executionPhase,
        title: `Execute ${rem.targetDomain} Remedy in ${rem.targetZoneOrDirection}`,
        description: `Install/Apply: ${rem.primaryRemedyText} in zone ${rem.targetZoneOrDirection}. Objective: ${rem.selectionRationale}`,
        associatedRemedyIds: [rem.remedyId],
        structuralCategory: rem.structuralCategory,
        estimatedComplexity: complexity,
        estimatedCostCategory: costCat,
        prerequisiteActionIds: prerequisites,
        expectedObjective: `Balance energy in ${rem.targetZoneOrDirection} zone and rectify observed spatial imbalance.`
      });
    });

    return items;
  }
}
