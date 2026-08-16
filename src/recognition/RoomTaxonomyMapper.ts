/**
 * Re-exports from RoomTaxonomyService — the single source of truth for room taxonomy.
 * Prefer importing from RoomTaxonomyService directly in new code.
 */

import {
  roomTaxonomyService,
  type CanonicalRoomType,
  type RoomTaxonomyMappingResult,
  normalizeLabelForMatch,
} from "./RoomTaxonomyService";

export type { CanonicalRoomType, RoomTaxonomyMappingResult };
export { normalizeLabelForMatch };

export function mapDisplayLabelToCanonical(displayLabel: string): RoomTaxonomyMappingResult {
  return roomTaxonomyService.resolveFromDisplayName(displayLabel);
}

export function canonicalToRuleElementType(canonicalType: CanonicalRoomType): string {
  return roomTaxonomyService.canonicalToRuleElementType(canonicalType);
}

export function canonicalMatchesRuleElement(canonicalType: CanonicalRoomType, ruleElementType: string): boolean {
  return roomTaxonomyService.canonicalMatchesRuleElement(canonicalType, ruleElementType);
}

export function logTaxonomyMapping(result: RoomTaxonomyMappingResult): void {
  roomTaxonomyService.logMappingResult(result);
}
