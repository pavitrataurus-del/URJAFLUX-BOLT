// ============================================================================
// URJAFLUX AI OS - COMPATIBILITY ANALYZER (IIE)
// Analyzes Remedy Compatibility, Prerequisites, Synergy, and Exclusions
// ============================================================================

import { 
  IBestRemedyCandidate, 
  IRemedyCompatibilityMatrix, 
  IRemedyCompatibilityLink 
} from "../types/iie.types";

export class CompatibilityAnalyzer {

  /**
   * Builds the Remedy Compatibility Matrix for a set of selected remedies
   */
  public analyzeCompatibility(
    selectedRemedies: IBestRemedyCandidate[]
  ): IRemedyCompatibilityMatrix {
    const links: IRemedyCompatibilityLink[] = [];
    const mutuallyExclusivePairs: Array<{ remedyA: string; remedyB: string; reason: string }> = [];
    const synergisticClusters: Array<{ clusterName: string; remedyIds: string[]; expectedSynergy: string }> = [];

    for (let i = 0; i < selectedRemedies.length; i++) {
      for (let j = i + 1; j < selectedRemedies.length; j++) {
        const remA = selectedRemedies[i];
        const remB = selectedRemedies[j];

        const textA = remA.primaryRemedyText.toLowerCase();
        const textB = remB.primaryRemedyText.toLowerCase();

        // Check for mutual exclusivity (e.g., opposing metal strips in same direction or conflicting colors)
        if (remA.targetZoneOrDirection === remB.targetZoneOrDirection && remA.targetZoneOrDirection !== 'GENERAL_ZONE') {
          if ((textA.includes("copper") && textB.includes("brass")) ||
              (textA.includes("red") && textB.includes("blue"))) {
            mutuallyExclusivePairs.push({
              remedyA: remA.remedyId,
              remedyB: remB.remedyId,
              reason: `Conflicting materials/elements (${remA.primaryRemedyText} vs ${remB.primaryRemedyText}) in zone ${remA.targetZoneOrDirection}`
            });

            links.push({
              sourceRemedyId: remA.remedyId,
              targetRemedyId: remB.remedyId,
              relationshipType: 'MUTUALLY_EXCLUSIVE',
              explanation: `Mutually exclusive remedy options for ${remA.targetZoneOrDirection}`
            });
            continue;
          }
        }

        // Check for sequential prerequisites (e.g. cleaning/space clearance before installing copper strip)
        if (textA.includes("clearance") || textA.includes("clean") || textA.includes("space")) {
          links.push({
            sourceRemedyId: remA.remedyId,
            targetRemedyId: remB.remedyId,
            relationshipType: 'SEQUENTIAL_PREREQUISITE',
            explanation: `${remA.primaryRemedyText} is a prerequisite before executing ${remB.primaryRemedyText}`
          });
          continue;
        }

        // Check for cross-domain synergy (e.g. Vastu Copper Strip + LalKitab remedy)
        if (remA.targetDomain !== remB.targetDomain) {
          links.push({
            sourceRemedyId: remA.remedyId,
            targetRemedyId: remB.remedyId,
            relationshipType: 'CROSS_DOMAIN_ENHANCEMENT',
            explanation: `Cross-domain synergy between ${remA.targetDomain} (${remA.primaryRemedyText}) and ${remB.targetDomain} (${remB.primaryRemedyText})`
          });
          continue;
        }

        // Default compatible synergy
        links.push({
          sourceRemedyId: remA.remedyId,
          targetRemedyId: remB.remedyId,
          relationshipType: 'COMPATIBLE_SYNERGY',
          explanation: `Compatible parallel remedies across distinct spatial zones`
        });
      }
    }

    // Build Synergistic Clusters (e.g. Elemental Balancers cluster)
    const elementalRemedies = selectedRemedies
      .filter(r => r.primaryRemedyText.toLowerCase().includes("strip") || r.primaryRemedyText.toLowerCase().includes("metal"))
      .map(r => r.remedyId);

    if (elementalRemedies.length > 0) {
      synergisticClusters.push({
        clusterName: 'Elemental Boundary Balancers',
        remedyIds: elementalRemedies,
        expectedSynergy: 'Harmonizes spatial boundary cutoffs without structural alteration'
      });
    }

    return {
      compatibilityLinks: links,
      mutuallyExclusivePairs,
      synergisticClusters
    };
  }
}
