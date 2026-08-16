import { describe, expect, it } from "vitest";
import {
  resolveBlueprintAnchoredWorldPoint,
  resolveEntityWorldCenter,
} from "../blueprintAnchoredCoordinates";
import { EnterpriseCognitiveReasoningService } from "../../knowledge_ingestion/reasoning/EnterpriseCognitiveReasoningService";

describe("blueprintAnchoredCoordinates", () => {
  const blueprint = { x: 0, y: 0, width: 20, height: 10, rotation: 0 };

  it("maps image top-center to world north", () => {
    const pt = resolveBlueprintAnchoredWorldPoint(0.5, 0, blueprint);
    expect(pt.x).toBe(0);
    expect(pt.y).toBe(5);
  });

  it("maps image bottom-right to world south-east quadrant", () => {
    const pt = resolveBlueprintAnchoredWorldPoint(1, 1, blueprint);
    expect(pt.x).toBe(10);
    expect(pt.y).toBe(-5);
  });

  it("tracks blueprint translation when resolving anchored entities", () => {
    const anchored = { x: 0, y: 0, metadata: { blueprintNormU: 0.5, blueprintNormV: 0 } };
    const atOrigin = resolveEntityWorldCenter(anchored, blueprint);
    const shifted = resolveEntityWorldCenter(anchored, { ...blueprint, x: 5, y: 3 });
    expect(shifted.x - atOrigin.x).toBe(5);
    expect(shifted.y - atOrigin.y).toBe(3);
  });

  it("keeps direction stable when blueprint moves with anchored metadata", () => {
    const kitchen = { x: 0, y: 0, metadata: { blueprintNormU: 0.35, blueprintNormV: 0.15 } };
    const living = { x: 0, y: 0, metadata: { blueprintNormU: 0.75, blueprintNormV: 0.2 } };
    const chakra = { x: 0, y: 0 };

    const bp1 = { x: 0, y: 0, width: 20, height: 10 };
    const k1 = resolveEntityWorldCenter(kitchen, bp1);
    const l1 = resolveEntityWorldCenter(living, bp1);
    const syncK1 = EnterpriseCognitiveReasoningService.verifyChakraAngleVectorSync(k1, chakra, 0, 0);
    const syncL1 = EnterpriseCognitiveReasoningService.verifyChakraAngleVectorSync(l1, chakra, 0, 0);

    const bp2 = { x: 8, y: -4, width: 20, height: 10 };
    const k2 = resolveEntityWorldCenter(kitchen, bp2);
    const l2 = resolveEntityWorldCenter(living, bp2);
    const syncK2 = EnterpriseCognitiveReasoningService.verifyChakraAngleVectorSync(k2, { x: 8, y: -4 }, 0, 0);
    const syncL2 = EnterpriseCognitiveReasoningService.verifyChakraAngleVectorSync(l2, { x: 8, y: -4 }, 0, 0);

    expect(syncK2.subZone).toBe(syncK1.subZone);
    expect(syncL2.subZone).toBe(syncL1.subZone);
    expect(syncK2.degreeVector).toBe(syncK1.degreeVector);
    expect(syncL2.degreeVector).toBe(syncL1.degreeVector);
  });
});
