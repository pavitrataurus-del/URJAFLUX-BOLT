import {
  IVastuDocumentMetadata,
  IVastuEntity,
  IVastuRelationship,
  IVastuKnowledgeConflict,
  IVastuQualityScoreBreakdown,
  VastuDocumentCategory,
  ExpertReviewStatus
} from "./VastuKnowledgeTypes";
import { VastuOntologyCatalog } from "./VastuOntologyCatalog";
import { VastuConflictEngine } from "./VastuConflictEngine";
import { VastuDuplicateEngine } from "./VastuDuplicateEngine";
import { VastuQualityEngine } from "./VastuQualityEngine";

export class VastuMasterKnowledgeRegistry {
  private static instance: VastuMasterKnowledgeRegistry;

  private documents: Map<string, IVastuDocumentMetadata> = new Map();

  private constructor() {
    this.seedMasterLibrary();
  }

  public static getInstance(): VastuMasterKnowledgeRegistry {
    if (!VastuMasterKnowledgeRegistry.instance) {
      VastuMasterKnowledgeRegistry.instance = new VastuMasterKnowledgeRegistry();
    }
    return VastuMasterKnowledgeRegistry.instance;
  }

  private seedMasterLibrary(): void {
    const seedDocs: IVastuDocumentMetadata[] = [
      {
        id: "doc-v-001",
        title: "Mayamatam: Treatise of Housing, Architecture and Iconography",
        author: "Sage Maya / Bruno Dagens Edition",
        publisher: "Motilal Banarsidass",
        edition: "Critical Revised Edition",
        publicationYear: 1994,
        language: "Sanskrit / English",
        documentType: "Ancient Text",
        knowledgeDomain: "Mayamatam",
        category: "Traditional Texts",
        subject: "Classical Sthapatya Veda Architecture, Padavinyasa, and Room Orientations",
        keywords: ["Mayamatam", "Sthapatya Veda", "Padavinyasa", "Brahmasthan", "Devtas"],
        pageCount: 384,
        ocrConfidence: 0.98,
        uploadDate: "2026-07-20",
        uploadedBy: "Admin / Knowledge Engineer",
        approvalStatus: "Approved",
        version: "v1.0",
        qualityScore: 96
      },
      {
        id: "doc-v-002",
        title: "Samarangana Sutradhara of King Bhoja",
        author: "King Bhoja of Dhar",
        publisher: "Oriental Institute Baroda",
        edition: "Volume I & II Translation",
        publicationYear: 1966,
        language: "Sanskrit / Hindi",
        documentType: "Ancient Text",
        knowledgeDomain: "Samarangana Sutradhara",
        category: "Traditional Texts",
        subject: "Royal Palace Planning, Town Geometry, Fortifications, and Machine Sastra",
        keywords: ["Samarangana Sutradhara", "King Bhoja", "Town Planning", "Royal Vastu"],
        pageCount: 512,
        ocrConfidence: 0.94,
        uploadDate: "2026-07-21",
        uploadedBy: "Admin / Knowledge Engineer",
        approvalStatus: "Approved",
        version: "v1.2",
        qualityScore: 94
      },
      {
        id: "doc-v-003",
        title: "Brihat Samhita: Vastu Vidya & Astrology",
        author: "Varahamihira",
        publisher: "Chowkhamba Sanskrit Series",
        edition: "Standard Classical Edition",
        publicationYear: 1981,
        language: "Sanskrit / English",
        documentType: "Ancient Text",
        knowledgeDomain: "Vastu Shastra",
        category: "Traditional Texts",
        subject: "Directional Astronomy, Soil Testing, Timber Selection, and Vastu Purusha Mandala",
        keywords: ["Brihat Samhita", "Varahamihira", "Soil Testing", "Mandala", "Nakshatras"],
        pageCount: 290,
        ocrConfidence: 0.96,
        uploadDate: "2026-07-22",
        uploadedBy: "Admin / Knowledge Engineer",
        approvalStatus: "Approved",
        version: "v1.0",
        qualityScore: 95
      },
      {
        id: "doc-v-004",
        title: "Modern Commercial Vastu Architecture & Energy Balancing",
        author: "Dr. R. K. Bhattacharya",
        publisher: "Enterprise Spatial Press",
        edition: "2nd Industrial Edition",
        publicationYear: 2022,
        language: "English",
        documentType: "Research Paper",
        knowledgeDomain: "Vastu Shastra",
        category: "Commercial Vastu",
        subject: "High-Rise Office Layouts, Server Room Alignment, and Factory Fire Zones",
        keywords: ["Commercial Vastu", "Factories", "Server Rooms", "Office Layouts"],
        pageCount: 142,
        ocrConfidence: 0.99,
        uploadDate: "2026-07-24",
        uploadedBy: "Senior Vastu Consultant",
        approvalStatus: "Approved",
        version: "v2.0",
        qualityScore: 98
      },
      {
        id: "doc-v-005",
        title: "Residential High-Rise Apartment Vastu Guidelines",
        author: "Er. A. K. Jain",
        publisher: "Urban Planning Institute",
        edition: "Draft Guidelines",
        publicationYear: 2025,
        language: "English",
        documentType: "Notes",
        knowledgeDomain: "Vastu Shastra",
        category: "Apartment Vastu",
        subject: "Balcony Cutouts, Underground Parking, Water Tanks in Multi-Storey Flats",
        keywords: ["Apartments", "High-Rise", "Water Tanks", "Balconies"],
        pageCount: 68,
        ocrConfidence: 0.92,
        uploadDate: "2026-07-25",
        uploadedBy: "Junior Analyst",
        approvalStatus: "Pending",
        version: "v0.9",
        qualityScore: 78
      }
    ];

    seedDocs.forEach(d => this.documents.set(d.id, d));
  }

  public getDocuments(userRole: "ADMIN" | "END_USER" = "ADMIN", categoryFilter?: string): IVastuDocumentMetadata[] {
    const list = Array.from(this.documents.values());
    
    // END_USER sees ONLY Approved documents
    let filtered = userRole === "END_USER"
      ? list.filter(d => d.approvalStatus === "Approved")
      : list;

    if (categoryFilter && categoryFilter !== "All") {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }

    return filtered;
  }

  public getAllDocuments(): IVastuDocumentMetadata[] {
    return Array.from(this.documents.values());
  }

  public getDocumentById(id: string, userRole: "ADMIN" | "END_USER" = "ADMIN"): IVastuDocumentMetadata | null {
    const doc = this.documents.get(id);
    if (!doc) return null;
    if (userRole === "END_USER" && doc.approvalStatus !== "Approved") return null;
    return doc;
  }

  public registerNewDocument(doc: Omit<IVastuDocumentMetadata, "id" | "uploadDate" | "approvalStatus" | "qualityScore">): IVastuDocumentMetadata {
    const id = `doc-v-${Date.now().toString().slice(-4)}`;
    const uploadDate = new Date().toISOString().split("T")[0];

    const draftDoc: IVastuDocumentMetadata = {
      ...doc,
      id,
      uploadDate,
      approvalStatus: "Pending",
      qualityScore: 80
    };

    // Calculate quality score
    const qualityBreakdown = VastuQualityEngine.getInstance().calculateQualityScore(draftDoc);
    draftDoc.qualityScore = qualityBreakdown.overallScore;

    this.documents.set(id, draftDoc);
    return draftDoc;
  }

  public updateApprovalStatus(id: string, status: ExpertReviewStatus): IVastuDocumentMetadata | null {
    const doc = this.documents.get(id);
    if (!doc) return null;

    const updated = { ...doc, approvalStatus: status };
    this.documents.set(id, updated);
    return updated;
  }

  public searchKnowledgeBase(query: string, userRole: "ADMIN" | "END_USER" = "ADMIN"): {
    documents: IVastuDocumentMetadata[];
    entities: IVastuEntity[];
    relationships: IVastuRelationship[];
  } {
    const q = query.toLowerCase().trim();
    const approvedDocs = this.getDocuments(userRole);

    const matchedDocs = approvedDocs.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.subject.toLowerCase().includes(q) ||
      d.keywords.some(k => k.toLowerCase().includes(q))
    );

    const catalog = VastuOntologyCatalog.getInstance();
    const allEntities = catalog.getAllEntities();
    const approvedEntities = userRole === "END_USER"
      ? allEntities.filter(e => e.approvalStatus === "Approved")
      : allEntities;

    const matchedEntities = approvedEntities.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.canonicalName.toLowerCase().includes(q) ||
      e.aliases.some(a => a.toLowerCase().includes(q)) ||
      e.description.toLowerCase().includes(q)
    );

    const allRels = catalog.getAllRelationships();
    const approvedRels = userRole === "END_USER"
      ? allRels.filter(r => r.approvalStatus === "Approved")
      : allRels;

    const matchedRels = approvedRels.filter(r =>
      r.description.toLowerCase().includes(q) ||
      r.relationshipType.toLowerCase().includes(q)
    );

    return {
      documents: matchedDocs,
      entities: matchedEntities,
      relationships: matchedRels
    };
  }

  public getQualityReportForDocument(docId: string): IVastuQualityScoreBreakdown | null {
    const doc = this.documents.get(docId);
    if (!doc) return null;

    return VastuQualityEngine.getInstance().calculateQualityScore(doc);
  }
}
