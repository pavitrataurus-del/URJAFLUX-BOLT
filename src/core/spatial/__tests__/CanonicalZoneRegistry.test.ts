/**
 * LOCKED BASELINE — Canonical zone SSOT regression guards.
 * Do not weaken these mappings; pipeline zone labels derive from CanonicalZoneRegistry.
 */
import { describe, expect, it } from "vitest";
import {
  CanonicalZoneCode,
  CanonicalZoneRegistry,
  VASTU_ZONE_DISPLAY_LABELS,
} from "../CanonicalZoneRegistry";

describe("CanonicalZoneRegistry (SSOT baseline)", () => {
  const bearingCases: Array<{ bearing: number; code: CanonicalZoneCode; labelContains: string }> = [
    { bearing: 0, code: CanonicalZoneCode.N, labelContains: "North (N)" },
    { bearing: 45, code: CanonicalZoneCode.NE, labelContains: "North-East" },
    { bearing: 90, code: CanonicalZoneCode.E, labelContains: "East (E)" },
    { bearing: 135, code: CanonicalZoneCode.SE, labelContains: "South-East" },
    { bearing: 180, code: CanonicalZoneCode.S, labelContains: "South (S)" },
    { bearing: 225, code: CanonicalZoneCode.SW, labelContains: "South-West" },
    { bearing: 270, code: CanonicalZoneCode.W, labelContains: "West (W)" },
    { bearing: 315, code: CanonicalZoneCode.NW, labelContains: "North-West" },
  ];

  it("maps standard bearings to canonical zone codes", () => {
    for (const { bearing, code } of bearingCases) {
      expect(CanonicalZoneRegistry.fromBearing(bearing)).toBe(code);
    }
  });

  it("maps bearings to stable Vastu display labels used in reports", () => {
    for (const { bearing, labelContains } of bearingCases) {
      const label = CanonicalZoneRegistry.displayLabelFromBearing(bearing);
      expect(label).toContain(labelContains);
    }
  });

  it("wraps north bearing across 0° boundary", () => {
    expect(CanonicalZoneRegistry.fromBearing(359)).toBe(CanonicalZoneCode.N);
    expect(CanonicalZoneRegistry.fromBearing(1)).toBe(CanonicalZoneCode.N);
  });

  it("returns Brahmasthan only when explicitly centered", () => {
    expect(CanonicalZoneRegistry.fromBearing(90, true)).toBe(CanonicalZoneCode.BRAHMASTHAN);
    expect(CanonicalZoneRegistry.fromBearing(90, false)).toBe(CanonicalZoneCode.E);
  });

  it("keeps display label table aligned with metadata codes", () => {
    for (const code of Object.values(CanonicalZoneCode)) {
      expect(VASTU_ZONE_DISPLAY_LABELS[code]).toBeTruthy();
      expect(CanonicalZoneRegistry.toVastuDisplayLabel(code)).toBe(
        VASTU_ZONE_DISPLAY_LABELS[code]
      );
    }
  });
});
