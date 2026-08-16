/**
 * Comprehensive architectural room / element dictionary for OCR entity classification.
 * Single source of display labels mapped to standardized Vastu taxonomy types.
 */

import type { CanonicalRoomType } from "./RoomTaxonomyService";

export type ArchitecturalEntityCategory = "ROOM" | "STRUCTURE";

export interface ArchitecturalDictionaryEntry {
  displayLabel: string;
  canonicalType: CanonicalRoomType | "WINDOW" | "DOOR";
  category: ArchitecturalEntityCategory;
  ruleElementType: string;
}

/** Canonical labels ordered with more specific multi-word entries first for prefix matching. */
export const ARCHITECTURAL_DICTIONARY: readonly ArchitecturalDictionaryEntry[] = [
  { displayLabel: "OPEN KITCHEN", canonicalType: "KITCHEN", category: "ROOM", ruleElementType: "kitchen" },
  { displayLabel: "DRY KITCHEN", canonicalType: "KITCHEN", category: "ROOM", ruleElementType: "kitchen" },
  { displayLabel: "WET KITCHEN", canonicalType: "KITCHEN", category: "ROOM", ruleElementType: "kitchen" },
  { displayLabel: "MODULAR KITCHEN", canonicalType: "KITCHEN", category: "ROOM", ruleElementType: "kitchen" },
  { displayLabel: "KITCHEN", canonicalType: "KITCHEN", category: "ROOM", ruleElementType: "kitchen" },
  { displayLabel: "MASTER BEDROOM", canonicalType: "BEDROOM", category: "ROOM", ruleElementType: "bedroom" },
  { displayLabel: "GUEST BEDROOM", canonicalType: "BEDROOM", category: "ROOM", ruleElementType: "bedroom" },
  { displayLabel: "PARENTS BEDROOM", canonicalType: "BEDROOM", category: "ROOM", ruleElementType: "bedroom" },
  { displayLabel: "KIDS BEDROOM", canonicalType: "BEDROOM", category: "ROOM", ruleElementType: "bedroom" },
  { displayLabel: "CHILDREN BEDROOM", canonicalType: "BEDROOM", category: "ROOM", ruleElementType: "bedroom" },
  { displayLabel: "BEDROOM", canonicalType: "BEDROOM", category: "ROOM", ruleElementType: "bedroom" },
  { displayLabel: "LIVING ROOM", canonicalType: "LIVING_ROOM", category: "ROOM", ruleElementType: "living" },
  { displayLabel: "DRAWING ROOM", canonicalType: "LIVING_ROOM", category: "ROOM", ruleElementType: "living" },
  { displayLabel: "FAMILY LOUNGE", canonicalType: "LIVING_ROOM", category: "ROOM", ruleElementType: "living" },
  { displayLabel: "LOUNGE", canonicalType: "LIVING_ROOM", category: "ROOM", ruleElementType: "living" },
  { displayLabel: "HALL", canonicalType: "LIVING_ROOM", category: "ROOM", ruleElementType: "living" },
  { displayLabel: "DINING HALL", canonicalType: "DINING", category: "ROOM", ruleElementType: "dining" },
  { displayLabel: "DINING TABLE", canonicalType: "DINING", category: "ROOM", ruleElementType: "dining" },
  { displayLabel: "DINING ROOM", canonicalType: "DINING", category: "ROOM", ruleElementType: "dining" },
  { displayLabel: "DINING", canonicalType: "DINING", category: "ROOM", ruleElementType: "dining" },
  { displayLabel: "CHANGING ROOM", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "WASHING AREA", canonicalType: "BALCONY", category: "ROOM", ruleElementType: "balcony" },
  { displayLabel: "LOBBY", canonicalType: "LIVING_ROOM", category: "ROOM", ruleElementType: "living" },
  { displayLabel: "POWDER ROOM", canonicalType: "TOILET", category: "ROOM", ruleElementType: "toilet" },
  { displayLabel: "WASHROOM", canonicalType: "TOILET", category: "ROOM", ruleElementType: "toilet" },
  { displayLabel: "BATHROOM", canonicalType: "TOILET", category: "ROOM", ruleElementType: "toilet" },
  { displayLabel: "TOILET", canonicalType: "TOILET", category: "ROOM", ruleElementType: "toilet" },
  { displayLabel: "WC", canonicalType: "TOILET", category: "ROOM", ruleElementType: "toilet" },
  { displayLabel: "HOME OFFICE", canonicalType: "STUDY", category: "ROOM", ruleElementType: "study" },
  { displayLabel: "STUDY", canonicalType: "STUDY", category: "ROOM", ruleElementType: "study" },
  { displayLabel: "OFFICE", canonicalType: "STUDY", category: "ROOM", ruleElementType: "study" },
  { displayLabel: "LIBRARY", canonicalType: "STUDY", category: "ROOM", ruleElementType: "study" },
  { displayLabel: "POOJA ROOM", canonicalType: "POOJA", category: "ROOM", ruleElementType: "pooja_room" },
  { displayLabel: "PUJA ROOM", canonicalType: "POOJA", category: "ROOM", ruleElementType: "pooja_room" },
  { displayLabel: "PRAYER ROOM", canonicalType: "POOJA", category: "ROOM", ruleElementType: "pooja_room" },
  { displayLabel: "TEMPLE", canonicalType: "POOJA", category: "ROOM", ruleElementType: "pooja_room" },
  { displayLabel: "MANDIR", canonicalType: "POOJA", category: "ROOM", ruleElementType: "pooja_room" },
  { displayLabel: "UTILITY STORE", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "UTILITY ROOM", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "UTILITY", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "PANTRY", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "STORAGE", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "STORE ROOM", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "STORE", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "GARAGE", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "CAR PARK", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "PARKING", canonicalType: "STORE", category: "ROOM", ruleElementType: "store" },
  { displayLabel: "BALCONY", canonicalType: "BALCONY", category: "ROOM", ruleElementType: "balcony" },
  { displayLabel: "VERANDAH", canonicalType: "BALCONY", category: "ROOM", ruleElementType: "balcony" },
  { displayLabel: "TERRACE", canonicalType: "BALCONY", category: "ROOM", ruleElementType: "balcony" },
  { displayLabel: "STAIRCASE", canonicalType: "STAIRCASE", category: "STRUCTURE", ruleElementType: "staircase" },
  { displayLabel: "STAIRS", canonicalType: "STAIRCASE", category: "STRUCTURE", ruleElementType: "staircase" },
  { displayLabel: "STAIR", canonicalType: "STAIRCASE", category: "STRUCTURE", ruleElementType: "staircase" },
  { displayLabel: "LIFT", canonicalType: "STAIRCASE", category: "STRUCTURE", ruleElementType: "staircase" },
  { displayLabel: "MAIN DOOR", canonicalType: "MAIN_ENTRANCE", category: "STRUCTURE", ruleElementType: "main_entrance" },
  { displayLabel: "MAIN ENTRANCE", canonicalType: "MAIN_ENTRANCE", category: "STRUCTURE", ruleElementType: "main_entrance" },
  { displayLabel: "ENTRANCE", canonicalType: "MAIN_ENTRANCE", category: "STRUCTURE", ruleElementType: "main_entrance" },
  { displayLabel: "ENTRY", canonicalType: "MAIN_ENTRANCE", category: "STRUCTURE", ruleElementType: "main_entrance" },
  { displayLabel: "DOOR", canonicalType: "DOOR", category: "STRUCTURE", ruleElementType: "door" },
  { displayLabel: "WINDOW", canonicalType: "WINDOW", category: "STRUCTURE", ruleElementType: "window" },
];
