// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENGINE 4: USAGE PROBABILITY ENGINE
// Probabilistic room usage inference solver based on multi-evidence objects & spatial metrics
// Example: Bedroom without bed + computer -> Study (65%), Bedroom (35%)
// FOUNDER LOCK: Never force a decision.
// ============================================================================

import { 
  IRoomUsageProbability, 
  IUsageCandidate 
} from "../types/bsue_v1_5.types";

import { ISemanticRoom } from "../types/bsue.types";
import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class UsageProbabilityEngine {
  private static instance: UsageProbabilityEngine;

  private constructor() {}

  public static getInstance(): UsageProbabilityEngine {
    if (!UsageProbabilityEngine.instance) {
      UsageProbabilityEngine.instance = new UsageProbabilityEngine();
    }
    return UsageProbabilityEngine.instance;
  }

  public computeUsageProbabilities(
    semanticRooms: ISemanticRoom[],
    bmueModel: IBlueprintMathematicalModel
  ): IRoomUsageProbability[] {
    const usageProbabilities: IRoomUsageProbability[] = [];

    semanticRooms.forEach(room => {
      const containedObjs = bmueModel.containmentGraph.containments
        .filter(c => c.assignedRoomId === room.roomId)
        .map(c => c.objectType.toUpperCase());

      const ocrUpper = (room.semanticLabel || '').toUpperCase();

      const candidates: IUsageCandidate[] = [];
      const evidence: string[] = [];

      // Case A: Labeled Bedroom or contains bed/desk signals
      if (room.canonicalType.includes('BEDROOM') || ocrUpper.includes('BED') || ocrUpper.includes('BR')) {
        const hasBed = containedObjs.some(o => o.includes('BED'));
        const hasWorkDesk = containedObjs.some(o => o.includes('DESK') || o.includes('COMPUTER') || o.includes('LAPTOP') || o.includes('WORKSTATION'));

        if (!hasBed && hasWorkDesk) {
          // Founder Example: Bedroom without Bed, with Computer -> Study 65%, Bedroom 35%
          candidates.push({
            usageLabel: 'Study / Home Office',
            probability: 0.65,
            rationale: 'Room labeled or categorized as bedroom lacks bed fixture but contains workstation/computer desk.'
          });
          candidates.push({
            usageLabel: 'Bedroom',
            probability: 0.35,
            rationale: 'Architectural label suggests bedroom, but furniture configuration indicates current usage as Study.'
          });
          evidence.push('No bed detected; computer workstation present');
        } else if (hasBed && hasWorkDesk) {
          candidates.push({
            usageLabel: 'Primary Bedroom with Study Workstation',
            probability: 0.75,
            rationale: 'Contains both primary bed and dedicated study desk.'
          });
          candidates.push({
            usageLabel: 'Guest Bedroom',
            probability: 0.25,
            rationale: 'Secondary guest bedroom with dual work/sleep functionality.'
          });
          evidence.push('Bed and desk detected in single space');
        } else {
          candidates.push({
            usageLabel: room.canonicalType === 'MASTER_BEDROOM' ? 'Master Bedroom' : 'Bedroom',
            probability: 0.85,
            rationale: 'Geometric size and fixtures align with standard bedroom usage.'
          });
          candidates.push({
            usageLabel: 'Guest Bedroom',
            probability: 0.15,
            rationale: 'Potential conversion or secondary guest bedroom accommodation.'
          });
          evidence.push('Standard sleeping quarter geometry and layout');
        }
      }

      // Case B: Living Room / Communal Area
      else if (room.canonicalType === 'LIVING_ROOM') {
        if (room.areaSqMeters >= 22.0) {
          candidates.push({
            usageLabel: 'Living & Dining Combined Hall',
            probability: 0.70,
            rationale: 'Large area footprint (> 22m²) supports dual living lounge and dining furniture.'
          });
          candidates.push({
            usageLabel: 'Formal Living Room',
            probability: 0.30,
            rationale: 'Dedicated large-format family entertainment hall.'
          });
          evidence.push(`Spacious footprint (${room.areaSqMeters}m²) supports dual communal zones`);
        } else {
          candidates.push({
            usageLabel: 'Living Lounge',
            probability: 0.80,
            rationale: 'Standard living room seating and reception area.'
          });
          candidates.push({
            usageLabel: 'Family TV Room',
            probability: 0.20,
            rationale: 'Casual family lounge area.'
          });
          evidence.push('Central living hall spatial orientation');
        }
      }

      // Case C: Store Room / Small Spaces
      else if (room.canonicalType === 'STORE_ROOM' || room.canonicalType === 'UTILITY') {
        if (room.areaSqMeters <= 5.0) {
          candidates.push({
            usageLabel: 'Store Room',
            probability: 0.50,
            rationale: 'Compact footprint dedicated to household storage.'
          });
          candidates.push({
            usageLabel: 'Puja Niche / Devotional Corner',
            probability: 0.50,
            rationale: 'Compact enclosed space convertible for devotional prayer or quiet meditation.'
          });
          evidence.push('Compact enclosed room suitable for storage or devotional conversion');
        } else {
          candidates.push({
            usageLabel: 'Utility & Laundry Wash Area',
            probability: 0.75,
            rationale: 'Medium utility room footprint for laundry and appliances.'
          });
          candidates.push({
            usageLabel: 'General Store Room',
            probability: 0.25,
            rationale: 'Secondary storage pantry.'
          });
          evidence.push('Utility service accessibility');
        }
      }

      // Case D: Default / Fallback for other spaces
      else {
        candidates.push({
          usageLabel: room.semanticLabel,
          probability: Math.min(0.90, room.confidence),
          rationale: `Primary spatial categorization based on fused evidence confidence (${room.confidence}).`
        });
        candidates.push({
          usageLabel: 'Multi-purpose Flex Space',
          probability: Math.round((1.0 - Math.min(0.90, room.confidence)) * 100) / 100,
          rationale: 'Secondary flexible spatial usage candidate.'
        });
        evidence.push(`Fused evidence confidence ${room.confidence}`);
      }

      // Normalize probabilities to strictly sum to 1.0
      let totalProb = candidates.reduce((sum, c) => sum + c.probability, 0);
      if (totalProb > 0) {
        candidates.forEach(c => c.probability = Math.round((c.probability / totalProb) * 100) / 100);
      }

      // Sort by highest probability
      candidates.sort((a, b) => b.probability - a.probability);

      usageProbabilities.push({
        roomId: room.roomId,
        usageCandidates: candidates,
        topProbableUsage: candidates[0] ? candidates[0].usageLabel : room.semanticLabel,
        supportingEvidence: evidence,
        isDecisionForced: false // FOUNDER LOCK: Never force a decision
      });
    });

    return usageProbabilities;
  }
}

export const usageProbabilityEngine = UsageProbabilityEngine.getInstance();
