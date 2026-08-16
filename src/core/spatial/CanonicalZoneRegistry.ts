/**
 * URJAFLUX AI OS — SPRINT 4A.6 (SSOT Consolidation)
 * Canonical Zone Registry
 * 
 * Defines the single authoritative 16-zone + Brahmasthan enumeration and metadata mapping.
 * Internal engines MUST compare using CanonicalZoneCode only.
 */

export enum CanonicalZoneCode {
  N = "N",
  NNE = "NNE",
  NE = "NE",
  ENE = "ENE",
  E = "E",
  ESE = "ESE",
  SE = "SE",
  SSE = "SSE",
  S = "S",
  SSW = "SSW",
  SW = "SW",
  WSW = "WSW",
  W = "W",
  WNW = "WNW",
  NW = "NW",
  NNW = "NNW",
  BRAHMASTHAN = "BRAHMASTHAN"
}

export interface ZoneMetadata {
  zoneCode: CanonicalZoneCode;
  englishName: string;
  sanskritName: string;
  element: "JAL" | "VAYU" | "AGNI" | "PRITHVI" | "AKASHA";
  startAngleDeg: number;
  endAngleDeg: number;
  centerAngleDeg: number;
  governingDevta: string;
}

export const CANONICAL_ZONE_METADATA: Record<CanonicalZoneCode, ZoneMetadata> = {
  [CanonicalZoneCode.N]: { zoneCode: CanonicalZoneCode.N, englishName: "North", sanskritName: "Kubera / Somya", element: "JAL", startAngleDeg: 348.75, endAngleDeg: 11.25, centerAngleDeg: 0, governingDevta: "Kuber / Soma" },
  [CanonicalZoneCode.NNE]: { zoneCode: CanonicalZoneCode.NNE, englishName: "North-North-East", sanskritName: "Dhanvantari", element: "JAL", startAngleDeg: 11.25, endAngleDeg: 33.75, centerAngleDeg: 22.5, governingDevta: "Dhanvantari" },
  [CanonicalZoneCode.NE]: { zoneCode: CanonicalZoneCode.NE, englishName: "North-East", sanskritName: "Ishanya", element: "JAL", startAngleDeg: 33.75, endAngleDeg: 56.25, centerAngleDeg: 45, governingDevta: "Isha" },
  [CanonicalZoneCode.ENE]: { zoneCode: CanonicalZoneCode.ENE, englishName: "East-North-East", sanskritName: "Parjanya", element: "JAL", startAngleDeg: 56.25, endAngleDeg: 78.75, centerAngleDeg: 67.5, governingDevta: "Parjanya" },
  [CanonicalZoneCode.E]: { zoneCode: CanonicalZoneCode.E, englishName: "East", sanskritName: "Aditya / Indra", element: "VAYU", startAngleDeg: 78.75, endAngleDeg: 101.25, centerAngleDeg: 90, governingDevta: "Aditya" },
  [CanonicalZoneCode.ESE]: { zoneCode: CanonicalZoneCode.ESE, englishName: "East-South-East", sanskritName: "Teja / Satya", element: "VAYU", startAngleDeg: 101.25, endAngleDeg: 123.75, centerAngleDeg: 112.5, governingDevta: "Satya" },
  [CanonicalZoneCode.SE]: { zoneCode: CanonicalZoneCode.SE, englishName: "South-East", sanskritName: "Agneya", element: "AGNI", startAngleDeg: 123.75, endAngleDeg: 146.25, centerAngleDeg: 135, governingDevta: "Agni" },
  [CanonicalZoneCode.SSE]: { zoneCode: CanonicalZoneCode.SSE, englishName: "South-South-East", sanskritName: "Pusha", element: "AGNI", startAngleDeg: 146.25, endAngleDeg: 168.75, centerAngleDeg: 157.5, governingDevta: "Pusha" },
  [CanonicalZoneCode.S]: { zoneCode: CanonicalZoneCode.S, englishName: "South", sanskritName: "Yama", element: "AGNI", startAngleDeg: 168.75, endAngleDeg: 191.25, centerAngleDeg: 180, governingDevta: "Yama" },
  [CanonicalZoneCode.SSW]: { zoneCode: CanonicalZoneCode.SSW, englishName: "South-South-West", sanskritName: "Gandharva", element: "PRITHVI", startAngleDeg: 191.25, endAngleDeg: 213.75, centerAngleDeg: 202.5, governingDevta: "Gandharva" },
  [CanonicalZoneCode.SW]: { zoneCode: CanonicalZoneCode.SW, englishName: "South-West", sanskritName: "Nairitya", element: "PRITHVI", startAngleDeg: 213.75, endAngleDeg: 236.25, centerAngleDeg: 225, governingDevta: "Nairiti" },
  [CanonicalZoneCode.WSW]: { zoneCode: CanonicalZoneCode.WSW, englishName: "West-South-West", sanskritName: "Sugriva", element: "PRITHVI", startAngleDeg: 236.25, endAngleDeg: 258.75, centerAngleDeg: 247.5, governingDevta: "Sugriva" },
  [CanonicalZoneCode.W]: { zoneCode: CanonicalZoneCode.W, englishName: "West", sanskritName: "Varuna", element: "AKASHA", startAngleDeg: 258.75, endAngleDeg: 281.25, centerAngleDeg: 270, governingDevta: "Varuna" },
  [CanonicalZoneCode.WNW]: { zoneCode: CanonicalZoneCode.WNW, englishName: "West-North-West", sanskritName: "Asura", element: "AKASHA", startAngleDeg: 281.25, endAngleDeg: 303.75, centerAngleDeg: 292.5, governingDevta: "Asura" },
  [CanonicalZoneCode.NW]: { zoneCode: CanonicalZoneCode.NW, englishName: "North-West", sanskritName: "Vayavya", element: "VAYU", startAngleDeg: 303.75, endAngleDeg: 326.25, centerAngleDeg: 315, governingDevta: "Vayu" },
  [CanonicalZoneCode.NNW]: { zoneCode: CanonicalZoneCode.NNW, englishName: "North-North-West", sanskritName: "Roga / Naga", element: "VAYU", startAngleDeg: 326.25, endAngleDeg: 348.75, centerAngleDeg: 337.5, governingDevta: "Naga" },
  [CanonicalZoneCode.BRAHMASTHAN]: { zoneCode: CanonicalZoneCode.BRAHMASTHAN, englishName: "Center (Brahmasthan)", sanskritName: "Brahma", element: "AKASHA", startAngleDeg: 0, endAngleDeg: 360, centerAngleDeg: 0, governingDevta: "Brahma" }
};

/** Display labels used across Vastu analysis pipeline and rule matching */
export const VASTU_ZONE_DISPLAY_LABELS: Record<CanonicalZoneCode, string> = {
  [CanonicalZoneCode.N]: "North (N)",
  [CanonicalZoneCode.NNE]: "North-North-East (NNE)",
  [CanonicalZoneCode.NE]: "North-East (NE / Ishanya)",
  [CanonicalZoneCode.ENE]: "East-North-East (ENE)",
  [CanonicalZoneCode.E]: "East (E)",
  [CanonicalZoneCode.ESE]: "East-South-East (ESE)",
  [CanonicalZoneCode.SE]: "South-East (SE / Agneya)",
  [CanonicalZoneCode.SSE]: "South-South-East (SSE)",
  [CanonicalZoneCode.S]: "South (S)",
  [CanonicalZoneCode.SSW]: "South-South-West (SSW)",
  [CanonicalZoneCode.SW]: "South-West (SW / Nirriti)",
  [CanonicalZoneCode.WSW]: "West-South-West (WSW)",
  [CanonicalZoneCode.W]: "West (W)",
  [CanonicalZoneCode.WNW]: "West-North-West (WNW)",
  [CanonicalZoneCode.NW]: "North-West (NW / Vayavya)",
  [CanonicalZoneCode.NNW]: "North-North-West (NNW)",
  [CanonicalZoneCode.BRAHMASTHAN]: "Brahmasthan",
};

export class CanonicalZoneRegistry {
  public static getMetadata(code: CanonicalZoneCode): ZoneMetadata {
    return CANONICAL_ZONE_METADATA[code];
  }

  public static toVastuDisplayLabel(code: CanonicalZoneCode): string {
    return VASTU_ZONE_DISPLAY_LABELS[code] || code;
  }

  /** Single source of truth: bearing degrees → pipeline Vastu zone label */
  public static displayLabelFromBearing(bearingDeg: number, isCenter = false): string {
    return this.toVastuDisplayLabel(this.fromBearing(bearingDeg, isCenter));
  }

  public static fromBearing(bearingDeg: number, isCenter = false): CanonicalZoneCode {
    if (isCenter) return CanonicalZoneCode.BRAHMASTHAN;
    const norm = ((bearingDeg % 360) + 360) % 360;
    for (const meta of Object.values(CANONICAL_ZONE_METADATA)) {
      if (meta.zoneCode === CanonicalZoneCode.BRAHMASTHAN) continue;
      if (meta.startAngleDeg > meta.endAngleDeg) {
        // Wraps around 0° (North)
        if (norm >= meta.startAngleDeg || norm < meta.endAngleDeg) {
          return meta.zoneCode;
        }
      } else {
        if (norm >= meta.startAngleDeg && norm < meta.endAngleDeg) {
          return meta.zoneCode;
        }
      }
    }
    return CanonicalZoneCode.N;
  }
}
