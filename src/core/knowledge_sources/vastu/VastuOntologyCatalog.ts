import { IVastuEntity, IVastuRelationship } from "./VastuKnowledgeTypes";

export class VastuOntologyCatalog {
  private static instance: VastuOntologyCatalog;

  private entities: Map<string, IVastuEntity> = new Map();
  private relationships: Map<string, IVastuRelationship> = new Map();

  private constructor() {
    this.seedCanonicalOntology();
  }

  public static getInstance(): VastuOntologyCatalog {
    if (!VastuOntologyCatalog.instance) {
      VastuOntologyCatalog.instance = new VastuOntologyCatalog();
    }
    return VastuOntologyCatalog.instance;
  }

  private seedCanonicalOntology(): void {
    // Seed Elements
    const elements: IVastuEntity[] = [
      { id: "ent-e-1", name: "Jal (Water)", type: "Element", canonicalName: "Water Element", aliases: ["Water", "Jal", "Aap"], description: "Governs North-East, clarity, intuition, and financial flow.", attributes: { direction: "North-East", color: "Blue/White" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.99, approvalStatus: "Approved" },
      { id: "ent-e-2", name: "Agni (Fire)", type: "Element", canonicalName: "Fire Element", aliases: ["Fire", "Agni", "Tejas"], description: "Governs South-East, energy, stamina, passion, and cash flow.", attributes: { direction: "South-East", color: "Red/Orange" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.99, approvalStatus: "Approved" },
      { id: "ent-e-3", name: "Prithvi (Earth)", type: "Element", canonicalName: "Earth Element", aliases: ["Earth", "Prithvi", "Bhoomi"], description: "Governs South-West, stability, relationships, skills, and weight.", attributes: { direction: "South-West", color: "Yellow/Clay" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.99, approvalStatus: "Approved" },
      { id: "ent-e-4", name: "Vayu (Air)", type: "Element", canonicalName: "Air Element", aliases: ["Air", "Vayu", "Pavan"], description: "Governs North-West, movement, social connections, and support.", attributes: { direction: "North-West", color: "Green/Light Blue" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.99, approvalStatus: "Approved" },
      { id: "ent-e-5", name: "Akash (Space)", type: "Element", canonicalName: "Space Element", aliases: ["Space", "Akash", "Ether"], description: "Governs Center (Brahmasthan), expansive growth and spiritual harmony.", attributes: { direction: "Center", color: "White/Clear" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.99, approvalStatus: "Approved" }
    ];

    // Seed Rooms
    const rooms: IVastuEntity[] = [
      { id: "ent-r-1", name: "Kitchen", type: "Room", canonicalName: "Kitchen Space", aliases: ["Rasoi", "Cooking Area"], description: "Place of fire for food preparation.", attributes: { idealZone: "South-East", secondaryZone: "North-West" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.98, approvalStatus: "Approved" },
      { id: "ent-r-2", name: "Master Bedroom", type: "Room", canonicalName: "Master Bedroom", aliases: ["Main Bedroom", "Owner Suite"], description: "Sanctuary for head of household.", attributes: { idealZone: "South-West" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.98, approvalStatus: "Approved" },
      { id: "ent-r-3", name: "Puja Room", type: "Room", canonicalName: "Prayer Room", aliases: ["Mandir", "Meditation Room"], description: "Sacred space for worship.", attributes: { idealZone: "North-East" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.98, approvalStatus: "Approved" },
      { id: "ent-r-4", name: "Toilet / Bathroom", type: "Room", canonicalName: "Toilet Facility", aliases: ["Washroom", "WC"], description: "Space for waste elimination.", attributes: { idealZone: "South-of-South-West", forbiddenZones: ["North-East", "Center"] }, sourceDocumentId: "canonical-vastu-01", confidence: 0.98, approvalStatus: "Approved" },
      { id: "ent-r-5", name: "Living Room", type: "Room", canonicalName: "Living Room", aliases: ["Hall", "Drawing Room"], description: "Space for gathering guests.", attributes: { idealZone: "North-East", secondaryZone: "North-West" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.98, approvalStatus: "Approved" }
    ];

    // Seed Deities (45 Energy Fields / Devtas excerpts)
    const deities: IVastuEntity[] = [
      { id: "ent-d-1", name: "Shikhi", type: "Deities", canonicalName: "Shikhi Devta", aliases: ["Shikhi", "Isana"], description: "Devta of North-East corner, governs wisdom and clarity.", attributes: { padavinyasaZone: "NE-1" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.97, approvalStatus: "Approved" },
      { id: "ent-d-2", name: "Parjanya", type: "Deities", canonicalName: "Parjanya Devta", aliases: ["Parjanya"], description: "Devta of rain and fertility in North-East zone.", attributes: { padavinyasaZone: "NE-2" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.97, approvalStatus: "Approved" },
      { id: "ent-d-3", name: "Agni Dev", type: "Deities", canonicalName: "Agni Devta", aliases: ["Agni"], description: "Devta governing South-East zone energy and digestion.", attributes: { padavinyasaZone: "SE-1" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.97, approvalStatus: "Approved" },
      { id: "ent-d-4", name: "Yama", type: "Deities", canonicalName: "Yama Devta", aliases: ["Yama"], description: "Devta governing South direction, discipline, and order.", attributes: { padavinyasaZone: "S-3" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.97, approvalStatus: "Approved" },
      { id: "ent-d-5", name: "Kubera / Soma", type: "Deities", canonicalName: "Kubera Soma Devta", aliases: ["Kuber", "Soma"], description: "Devta governing North direction and financial abundance.", attributes: { padavinyasaZone: "N-3" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.97, approvalStatus: "Approved" }
    ];

    // Seed Remedies & Yantras
    const remedies: IVastuEntity[] = [
      { id: "ent-rem-1", name: "Sri Yantra", type: "Yantra", canonicalName: "Sri Yantra", aliases: ["Mahameru Yantra"], description: "Sacred geometric Yantra to balance cosmic energy.", attributes: { bestDirection: "North-East" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.99, approvalStatus: "Approved" },
      { id: "ent-rem-2", name: "Vastu Dosh Nivaran Yantra", type: "Yantra", canonicalName: "Vastu Dosh Nivaran Yantra", aliases: ["Vastu Yantra"], description: "Neutralizes directional defects.", attributes: { placement: "Main Entrance / Center" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.99, approvalStatus: "Approved" },
      { id: "ent-rem-3", name: "Brass Metal Strip", type: "Remedy", canonicalName: "Brass Strip Elemental Remedy", aliases: ["Brass Strip"], description: "Cuts negative energy transmission across floor boundaries.", attributes: { elementToBalance: "Air/Space" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.95, approvalStatus: "Approved" },
      { id: "ent-rem-4", name: "Copper Helix & Pyramids", type: "Remedy", canonicalName: "Copper Helix Remedy", aliases: ["Copper Pyramid"], description: "Boosts South-East fire element and removes SE defects.", attributes: { elementToBalance: "Fire" }, sourceDocumentId: "canonical-vastu-01", confidence: 0.95, approvalStatus: "Approved" }
    ];

    [...elements, ...rooms, ...deities, ...remedies].forEach(e => this.entities.set(e.id, e));

    // Seed Canonical Relationships
    const rels: IVastuRelationship[] = [
      { id: "rel-1", sourceEntityId: "ent-r-1", targetEntityId: "ent-e-2", relationshipType: "LOCATED_IN", description: "Kitchen requires Fire Element zone (South-East).", weight: 1.0, sourceDocumentId: "canonical-vastu-01", approvalStatus: "Approved" },
      { id: "rel-2", sourceEntityId: "ent-r-3", targetEntityId: "ent-e-1", relationshipType: "LOCATED_IN", description: "Puja Room ideally located in Water Element zone (North-East).", weight: 1.0, sourceDocumentId: "canonical-vastu-01", approvalStatus: "Approved" },
      { id: "rel-3", sourceEntityId: "ent-rem-1", targetEntityId: "ent-e-1", relationshipType: "BALANCES", description: "Sri Yantra balances North-East water/space vibration.", weight: 0.95, sourceDocumentId: "canonical-vastu-01", approvalStatus: "Approved" },
      { id: "rel-4", sourceEntityId: "ent-rem-4", targetEntityId: "ent-e-2", relationshipType: "REMEDIES", description: "Copper Helix remedies Fire element defects in South-East.", weight: 0.95, sourceDocumentId: "canonical-vastu-01", approvalStatus: "Approved" },
      { id: "rel-5", sourceEntityId: "ent-d-5", targetEntityId: "ent-e-1", relationshipType: "GOVERNS", description: "Kubera governs North zone wealth and water flow.", weight: 0.98, sourceDocumentId: "canonical-vastu-01", approvalStatus: "Approved" }
    ];

    rels.forEach(r => this.relationships.set(r.id, r));
  }

  public getEntityById(id: string): IVastuEntity | undefined {
    return this.entities.get(id);
  }

  public getAllEntities(): IVastuEntity[] {
    return Array.from(this.entities.values());
  }

  public searchEntities(query: string, filterType?: string): IVastuEntity[] {
    const q = query.toLowerCase();
    return this.getAllEntities().filter(e => {
      const matchType = !filterType || filterType === "All" || e.type === filterType;
      const matchText = e.name.toLowerCase().includes(q) || e.canonicalName.toLowerCase().includes(q) || e.aliases.some(a => a.toLowerCase().includes(q)) || e.description.toLowerCase().includes(q);
      return matchType && matchText;
    });
  }

  public addEntity(entity: IVastuEntity): void {
    this.entities.set(entity.id, entity);
  }

  public getAllRelationships(): IVastuRelationship[] {
    return Array.from(this.relationships.values());
  }

  public addRelationship(rel: IVastuRelationship): void {
    this.relationships.set(rel.id, rel);
  }
}
