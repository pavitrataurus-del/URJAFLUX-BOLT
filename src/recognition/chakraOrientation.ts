/**
 * Vastu Chakra orientation — blueprint geometry has no inherent North/East/South/West.
 * Directions are assigned only after the user calibrates North and aligns the Chakra overlay.
 */

export const PENDING_CHAKRA_CALIBRATION_ZONE = "Pending Chakra Calibration";

export function isPendingChakraCalibrationZone(zone?: string | null): boolean {
  if (!zone || !zone.trim()) return true;
  return zone.trim() === PENDING_CHAKRA_CALIBRATION_ZONE;
}
