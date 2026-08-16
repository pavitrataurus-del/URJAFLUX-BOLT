import React, { useState, useEffect } from "react";
import {
  BookOpen, UploadCloud, Search, AlertTriangle, CheckCircle, Clock,
  FileText, ShieldCheck, Database, Layers, GitCompare, Award,
  Sparkles, RefreshCw, Filter, ChevronRight, Eye, Tag, Cpu,
  BrainCircuit, Sliders, Lock, CheckSquare, XCircle, ArrowRight
} from "lucide-react";
import { VastuMasterKnowledgeRegistry } from "../../core/knowledge_sources/vastu/VastuMasterKnowledgeRegistry";
import { VastuOntologyCatalog } from "../../core/knowledge_sources/vastu/VastuOntologyCatalog";
import { VastuConflictEngine } from "../../core/knowledge_sources/vastu/VastuConflictEngine";
import { VastuDuplicateEngine } from "../../core/knowledge_sources/vastu/VastuDuplicateEngine";
import {
  IVastuDocumentMetadata,
  IVastuEntity,
  IVastuRelationship,
  IVastuKnowledgeConflict,
  VastuDocumentCategory,
  ExpertReviewStatus
} from "../../core/knowledge_sources/vastu/VastuKnowledgeTypes";

interface Props {
  userRole?: "ADMIN" | "END_USER";
}

export default function VastuKnowledgeLibraryWorkspace({ userRole = "ADMIN" }: Props) {
  const isAdmin = userRole === "ADMIN";
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "ocr" | "ontology" | "graph" | "conflicts" | "duplicates" | "versions">("library");

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<IVastuDocumentMetadata | null>(null);

  // Upload Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publicationYear, setPublicationYear] = useState("2024");
  const [language, setLanguage] = useState("Sanskrit / English");
  const [docType, setDocType] = useState<any>("Ancient Text");
  const [category, setCategory] = useState<VastuDocumentCategory>("Traditional Texts");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Data loaded from engines
  const registry = VastuMasterKnowledgeRegistry.getInstance();
  const catalog = VastuOntologyCatalog.getInstance();
  const conflictEngine = VastuConflictEngine.getInstance();
  const duplicateEngine = VastuDuplicateEngine.getInstance();

  const [documents, setDocuments] = useState<IVastuDocumentMetadata[]>(() => registry.getDocuments(userRole, categoryFilter));
  const [conflicts, setConflicts] = useState<IVastuKnowledgeConflict[]>(() => conflictEngine.getConflicts());

  useEffect(() => {
    setDocuments(registry.getDocuments(userRole, categoryFilter));
  }, [categoryFilter, userRole]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    const newDoc = registry.registerNewDocument({
      title,
      author,
      publisher,
      publicationYear: parseInt(publicationYear) || 2024,
      language,
      documentType: docType,
      knowledgeDomain: "Vastu Shastra",
      category,
      subject: subject || "General Vastu Principles & Guidelines",
      keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
      pageCount: 120,
      ocrConfidence: 0.95,
      uploadedBy: isAdmin ? "System Admin" : "End User",
      version: "v1.0"
    });

    setDocuments(registry.getDocuments(userRole, categoryFilter));
    setUploadSuccess(`Successfully ingested "${newDoc.title}". Pending Expert Review.`);
    setTitle("");
    setAuthor("");
    setSubject("");
    setKeywords("");
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  const handleConflictStatusUpdate = (id: string, status: ExpertReviewStatus) => {
    conflictEngine.updateConflictStatus(id, status, "Admin Expert", "Reviewed in Vastu Knowledge Workspace");
    setConflicts([...conflictEngine.getConflicts()]);
  };

  const categories: VastuDocumentCategory[] = [
    "Residential Vastu", "Commercial Vastu", "Industrial Vastu", "Apartment Vastu",
    "Temple Architecture", "Factories", "Hospitals", "Hotels", "Schools",
    "Offices", "Landscape", "Urban Planning", "Traditional Texts", "Research"
  ];

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* SIDE NAVIGATION */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide text-amber-300">Vastu Master Library</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${isAdmin ? "bg-purple-900/60 text-purple-300 border border-purple-700" : "bg-emerald-900/60 text-emerald-300 border border-emerald-700"}`}>
            {userRole}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          <button
            onClick={() => setActiveTab("library")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeTab === "library" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Document Catalog</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">{documents.length}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("upload")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${activeTab === "upload" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingestion Center</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("ocr")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${activeTab === "ocr" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>OCR & Classification</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("ontology")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${activeTab === "ontology" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>Ontology Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab("graph")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${activeTab === "graph" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Knowledge Graph</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("conflicts")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeTab === "conflicts" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-rose-400" />
                <span>Conflict Resolution</span>
              </div>
              <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">{conflicts.filter(c => c.reviewStatus === "Pending").length}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("duplicates")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${activeTab === "duplicates" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Duplicate Detector</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("versions")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${activeTab === "versions" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Version History</span>
          </button>
        </div>

        {/* SECURITY FOOTER */}
        <div className="p-3 border-t border-slate-800 text-[11px] bg-slate-950">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">RBAC Data Isolation</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            {isAdmin ? "Admin view enabled. Unapproved sources, OCR details & conflict chains accessible." : "End-User view enabled. Non-approved draft knowledge & internal conflicts strictly redacted."}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
        {/* TAB 1: DOCUMENT LIBRARY */}
        {activeTab === "library" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
            {/* SEARCH & CATEGORY BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Vastu scriptures, research papers, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-sm py-2 px-3 rounded-lg focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Vastu Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DOCUMENT GRID */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents
                .filter(d => !searchTerm || d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((doc) => {
                  const quality = registry.getQualityReportForDocument(doc.id);
                  return (
                    <div key={doc.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-lg">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {doc.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${doc.approvalStatus === "Approved" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-amber-950 text-amber-300 border border-amber-800"}`}>
                            {doc.approvalStatus}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-100 text-sm mb-1 line-clamp-2">{doc.title}</h3>
                        <p className="text-xs text-slate-400 mb-2">Author: <span className="text-slate-300">{doc.author}</span> ({doc.publicationYear || "Classic"})</p>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{doc.subject}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {doc.keywords.slice(0, 3).map((k) => (
                            <span key={k} className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                              #{k}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-amber-300">QS {quality?.overallScore || doc.qualityScore}/100</span>
                          <span className="text-[10px] font-mono text-slate-500">({quality?.qualityGrade || "A"})</span>
                        </div>
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 2: INGESTION CENTER (ADMIN ONLY) */}
        {activeTab === "upload" && isAdmin && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <UploadCloud className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-slate-100">Knowledge Ingestion & Ingest Pipeline</h2>
              </div>

              {uploadSuccess && (
                <div className="mb-4 bg-emerald-950 border border-emerald-800 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Document Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mayamatam Architecture Manual"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Author / Sage / Translator *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sage Maya / Dr. R. Sharma"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Publisher & Edition</label>
                    <input
                      type="text"
                      placeholder="e.g. Motilal Banarsidass (1st Edition)"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Publication Year</label>
                    <input
                      type="number"
                      placeholder="2024"
                      value={publicationYear}
                      onChange={(e) => setPublicationYear(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Document Classification Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VastuDocumentCategory)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Document Format / Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Printed Book">Printed Book</option>
                      <option value="Scanned Book">Scanned Book</option>
                      <option value="OCR PDF">OCR PDF</option>
                      <option value="Native PDF">Native PDF</option>
                      <option value="Image">Image</option>
                      <option value="Research Paper">Research Paper</option>
                      <option value="Ancient Text">Ancient Text</option>
                      <option value="Notes">Notes</option>
                      <option value="DOCX">DOCX</option>
                      <option value="TXT">TXT</option>
                      <option value="Markdown">Markdown</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a summary of room rules, zonal formulas, remedies, or mantras contained..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Mayamatam, Padavinyasa, Kitchen, South-East, Agni"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Ingest & Register Knowledge Source
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ONTOLOGY EXPLORER */}
        {activeTab === "ontology" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-100">Vastu Canonical Ontology Catalog</h2>
              </div>
              <span className="text-xs text-slate-400">Total Entities Registered: {catalog.getAllEntities().length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog.getAllEntities().map((entity) => (
                <div key={entity.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {entity.type}
                    </span>
                    <span className="text-[10px] text-slate-500">Conf: {Math.round(entity.confidence * 100)}%</span>
                  </div>

                  <h3 className="font-bold text-slate-200 text-sm mb-1">{entity.name}</h3>
                  <p className="text-xs text-slate-400 mb-2">{entity.description}</p>

                  <div className="text-[11px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300 space-y-1">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Attributes:</p>
                    {Object.entries(entity.attributes).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="font-mono text-amber-300">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: KNOWLEDGE GRAPH */}
        {activeTab === "graph" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-slate-100">Vastu Knowledge Graph Bidirectional Relationships</h2>
              </div>
              <span className="text-xs text-slate-400">Total Graph Edges: {catalog.getAllRelationships().length}</span>
            </div>

            <div className="space-y-3">
              {catalog.getAllRelationships().map((rel) => {
                const src = catalog.getEntityById(rel.sourceEntityId);
                const tgt = catalog.getEntityById(rel.targetEntityId);
                return (
                  <div key={rel.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs font-bold text-slate-200">
                        {src?.name || rel.sourceEntityId}
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950 border border-purple-800 px-2 py-0.5 rounded">
                          {rel.relationshipType}
                        </span>
                        <ArrowRight className="w-4 h-4 text-purple-400 mt-1" />
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs font-bold text-slate-200">
                        {tgt?.name || rel.targetEntityId}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 flex-1 max-w-md">{rel.description}</p>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                        Weight: {rel.weight}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CONFLICT RESOLUTION (ADMIN ONLY) */}
        {activeTab === "conflicts" && isAdmin && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-bold text-slate-100">Knowledge Conflict Center (Book A vs Book B)</h2>
              </div>
              <span className="text-xs text-rose-400 font-semibold">{conflicts.length} Discrepancies Flagged</span>
            </div>

            <div className="space-y-4">
              {conflicts.map((cnf) => (
                <div key={cnf.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <h3 className="font-bold text-slate-200 text-sm">{cnf.topicName}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded font-bold ${cnf.reviewStatus === "Approved" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"}`}>
                      Status: {cnf.reviewStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <p className="font-bold text-amber-300 mb-1">Source A: {cnf.sourceATitle}</p>
                      <p className="text-slate-300 italic">"{cnf.statementA}"</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <p className="font-bold text-cyan-300 mb-1">Source B: {cnf.sourceBTitle}</p>
                      <p className="text-slate-300 italic">"{cnf.statementB}"</p>
                    </div>
                  </div>

                  {cnf.expertNotes && (
                    <div className="text-xs bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-400">
                      <span className="font-semibold text-slate-300">Expert Note ({cnf.reviewedBy || "System"}):</span> {cnf.expertNotes}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Set Status:</span>
                    <button
                      onClick={() => handleConflictStatusUpdate(cnf.id, "Approved")}
                      className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 px-3 py-1 rounded transition-colors"
                    >
                      Approve Primary
                    </button>
                    <button
                      onClick={() => handleConflictStatusUpdate(cnf.id, "Reviewed")}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded transition-colors"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleConflictStatusUpdate(cnf.id, "Needs Revision")}
                      className="bg-rose-900/60 hover:bg-rose-800 text-rose-300 border border-rose-700 px-3 py-1 rounded transition-colors"
                    >
                      Request Revision
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 max-w-2xl w-full text-xs space-y-4 shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {selectedDoc.category}
                  </span>
                  <h2 className="text-base font-bold text-slate-100 mt-1">{selectedDoc.title}</h2>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-200 text-sm font-bold">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div><span className="text-slate-500">Author:</span> {selectedDoc.author}</div>
                <div><span className="text-slate-500">Publisher:</span> {selectedDoc.publisher || "N/A"}</div>
                <div><span className="text-slate-500">Document Type:</span> {selectedDoc.documentType}</div>
                <div><span className="text-slate-500">Language:</span> {selectedDoc.language}</div>
                <div><span className="text-slate-500">Page Count:</span> {selectedDoc.pageCount}</div>
                <div><span className="text-slate-500">OCR Confidence:</span> {Math.round(selectedDoc.ocrConfidence * 100)}%</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">Subject Coverage:</h4>
                <p className="text-slate-400 leading-relaxed">{selectedDoc.subject}</p>
              </div>

              {isAdmin && (
                <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-lg">
                  <h4 className="font-bold text-purple-300 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Audit Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-200">
                    <div>Version: {selectedDoc.version}</div>
                    <div>Upload Date: {selectedDoc.uploadDate}</div>
                    <div>Uploaded By: {selectedDoc.uploadedBy}</div>
                    <div>Approval Status: {selectedDoc.approvalStatus}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
