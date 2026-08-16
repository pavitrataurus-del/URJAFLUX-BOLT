import { describe, it, expect, beforeEach } from "vitest";
import { UniversalOntologyEngine, ConceptType, IOntologyNode } from "../index";

describe("Universal Ontology Engine", () => {
  beforeEach(() => {
    UniversalOntologyEngine.getInstance().clear();
  });

  const validNode: IOntologyNode = {
    id: "room_kitchen",
    canonicalName: "Kitchen",
    type: ConceptType.ROOM,
    childrenIds: [],
    aliases: ["Cooking Area", "Rasoi"],
    labels: {
      en: "Kitchen",
      hi: "रसोई",
      sa: "महानस"
    },
    metadata: {},
    version: "1.0",
    compatibleNamespaces: ["*"]
  };

  it("should register a valid concept", () => {
    const engine = UniversalOntologyEngine.getInstance();
    engine.registerConcept(validNode);
    expect(engine.getConcept(validNode.id)).toBeDefined();
  });

  it("should prevent duplicate concepts", () => {
    const engine = UniversalOntologyEngine.getInstance();
    engine.registerConcept(validNode);
    expect(() => engine.registerConcept(validNode)).toThrow("already exists");
  });

  it("should resolve aliases correctly", () => {
    const engine = UniversalOntologyEngine.getInstance();
    engine.registerConcept(validNode);
    expect(engine.resolveAlias("Rasoi")?.id).toBe("room_kitchen");
    expect(engine.resolveAlias("Cooking Area")?.id).toBe("room_kitchen");
    expect(engine.resolveAlias("kitchen")?.id).toBe("room_kitchen");
  });

  it("should detect circular inheritance", () => {
    const engine = UniversalOntologyEngine.getInstance();
    const nodeA: IOntologyNode = { ...validNode, id: "A", canonicalName: "A", parentId: "B", aliases: ["AliasA"] };
    const nodeB: IOntologyNode = { ...validNode, id: "B", canonicalName: "B", parentId: "A", aliases: ["AliasB"] };
    
    // Have to register B first without parent, then A with parent, then update B with parent
    const nodeB_init: IOntologyNode = { ...nodeB, parentId: undefined };
    engine.registerConcept(nodeB_init);
    engine.registerConcept(nodeA);
    
    expect(() => engine.updateConcept(nodeB)).toThrow("Circular inheritance detected");
  });

  it("should prevent duplicate aliases", () => {
    const engine = UniversalOntologyEngine.getInstance();
    engine.registerConcept(validNode);
    const node2: IOntologyNode = { ...validNode, id: "room_kitchen2", canonicalName: "Kitchen2", aliases: ["Rasoi"] };
    expect(() => engine.registerConcept(node2)).toThrow("conflicts with existing node");
  });

  it("should search concepts by multilingual labels", () => {
    const engine = UniversalOntologyEngine.getInstance();
    engine.registerConcept(validNode);
    expect(engine.searchConcept("रसोई").length).toBe(1);
    expect(engine.searchConcept("महानस").length).toBe(1);
  });
});
