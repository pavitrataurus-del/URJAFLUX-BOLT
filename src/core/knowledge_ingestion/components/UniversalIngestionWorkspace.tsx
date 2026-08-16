import React, { useState, useEffect } from "react";
import { 
  Database, UploadCloud, Search, FileText, CheckCircle, AlertTriangle, 
  RefreshCw, Cpu, Layers, ShieldCheck, Filter, ChevronRight, Eye, 
  Trash2, GitMerge, FileCode, Award, ArrowUpRight, Check, X, Clock,
  FileCheck, HelpCircle, BookOpen, Sparkles, Sliders, Activity, UserCheck
} from "lucide-react";
import { universalIngestionEngine } from "../services/UniversalIngestionEngine";
import { 
  IIngestionPipelinePackage, 
  KnowledgeDomain, 
  DocumentFormat,
  IExtractedEntity,
  IExtractedRelationship,
  INormalizationCandidate,
  IDuplicateCandidate,
  IIngestionConflict,
  IExpertReviewAction
} from "../types/universalIngestion.types";

export function UniversalIngestionWorkspace({ userRole = "ADMIN" }: { userRole?: "ADMIN" | "END_USER" }) {
  const isAdmin = userRole === "ADMIN";
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [packages, setPackages] = useState<IIngestionPipelinePackage[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [uploadDomain, setUploadDomain] = useState<KnowledgeDomain>("Vastu");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewerName, setReviewerName] = useState<string>("Acharya SME Administrator");

  useEffect(() => {
    loadPackages();
  }, [userRole]);

  const loadPackages = () => {
    const list = universalIngestionEngine.getAllPackages(isAdmin ? "ADMIN" : "END_USER");
    setPackages(list);
    if (list.length > 0 && !selectedPkgId) {
      setSelectedPkgId(list[0].id);
    }
  };

  const selectedPkg = packages.find(p => p.id === selectedPkgId) || packages[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setStatusMsg("Executing Universal Ingestion Pipeline: OCR, Classification, Chunking, Extraction...");

    try {
      const newPkg = await universalIngestionEngine.ingestFile(files[0], uploadDomain, reviewerName);
      loadPackages();
      setSelectedPkgId(newPkg.id);
      setStatusMsg(`Successfully ingested ${files[0].name}. Extracted ${newPkg.entities.length} entities & ${newPkg.relationships.length} relationships.`);
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err: any) {
      setStatusMsg(`Ingestion Error: ${err.message || 'Failed to process file'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprovePackage = (id: string) => {
    universalIngestionEngine.approvePackage(id, reviewerName, reviewComment || "Approved after SME scriptural verification.");
    setReviewComment("");
    loadPackages();
  };

  const handleRejectPackage = (id: string) => {
    universalIngestionEngine.rejectPackage(id, reviewerName, reviewComment || "Rejected due to unverified claims.");
    setReviewComment("");
    loadPackages();
  };

  const handleApproveNorm = (pkgId: string, normId: string) => {
    universalIngestionEngine.approveNormalization(pkgId, normId, reviewerName);
    loadPackages();
  };

  const handleResolveConflict = (pkgId: string, cnfId: string) => {
    universalIngestionEngine.resolveConflict(pkgId, cnfId, "Resolved", reviewerName, "Reconciled via classical shastra precedence.");
    loadPackages();
  };

  const handleGraphSync = (pkgId: string) => {
    const count = universalIngestionEngine.syncPackageToKnowledgeGraph(pkgId);
    setStatusMsg(`Successfully synchronized ${count} entities to Knowledge Graph!`);
    loadPackages();
    setTimeout(() => setStatusMsg(""), 4000);
  };

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-slate-800 gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-wider text-slate-100 uppercase font-mono">Knowledge Pipeline</span>
            <span className="text-[9px] text-emerald-400 font-mono">DOMAIN-002A OS CORE</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1 px-2">Overview</p>
            <NavTab icon={Activity} label="Pipeline Analytics" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
            <NavTab icon={UploadCloud} label="Universal Import" active={activeTab === "import"} onClick={() => setActiveTab("import")} />
          </div>

          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1 px-2">Processing Engine</p>
            <NavTab icon={FileText} label="OCR & Script Reader" active={activeTab === "ocr"} onClick={() => setActiveTab("ocr")} />
            <NavTab icon={Sliders} label="Classification & Meta" active={activeTab === "classification"} onClick={() => setActiveTab("classification")} />
            <NavTab icon={Layers} label="Smart Chunking" active={activeTab === "chunking"} onClick={() => setActiveTab("chunking")} />
            <NavTab icon={Sparkles} label="Entities & Relations" active={activeTab === "extraction"} onClick={() => setActiveTab("extraction")} />
          </div>

          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1 px-2">Quality & Governance</p>
            <NavTab icon={GitMerge} label="Concept Normalization" active={activeTab === "normalization"} onClick={() => setActiveTab("normalization")} />
            <NavTab icon={HelpCircle} label="Conflict Queue" active={activeTab === "conflicts"} onClick={() => setActiveTab("conflicts")} />
            <NavTab icon={Award} label="Quality Scoring" active={activeTab === "quality"} onClick={() => setActiveTab("quality")} />
            {isAdmin && <NavTab icon={ShieldCheck} label="Expert Review Queue" active={activeTab === "review"} onClick={() => setActiveTab("review")} />}
          </div>

          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1 px-2">Graph & Audit</p>
            <NavTab icon={ArrowUpRight} label="Knowledge Graph Sync" active={activeTab === "graph"} onClick={() => setActiveTab("graph")} />
            <NavTab icon={Clock} label="Audit Trail & History" active={activeTab === "audit"} onClick={() => setActiveTab("audit")} />
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 bg-slate-900/50 space-y-1">
          <div className="flex items-center justify-between">
            <span>RBAC MODE:</span>
            <span className={`px-1.5 py-0.5 rounded font-bold ${isAdmin ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-blue-950 text-blue-400"}`}>
              {userRole}
            </span>
          </div>
          <div className="text-[9px] text-slate-500">
            {isAdmin ? "Full Inspection Active" : "Sanitized Approved View"}
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
        
        {/* TOP HEADER STATUS BAR */}
        <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Active Package:</span>
            <select
              value={selectedPkgId}
              onChange={e => setSelectedPkgId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono px-3 py-1.5 rounded focus:outline-none focus:border-emerald-500"
            >
              {packages.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.metadata.domain}] {p.metadata.title} ({p.metadata.approvalStatus})
                </option>
              ))}
            </select>
          </div>

          {statusMsg && (
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" />
              {statusMsg}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={loadPackages}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded transition-colors"
              title="Refresh Registry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {selectedPkg && (
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase ${
                selectedPkg.metadata.approvalStatus === "APPROVED" 
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : selectedPkg.metadata.approvalStatus === "REJECTED"
                  ? "bg-rose-950 text-rose-400 border border-rose-800"
                  : "bg-amber-950 text-amber-400 border border-amber-800"
              }`}>
                {selectedPkg.metadata.approvalStatus}
              </span>
            )}
          </div>
        </div>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "dashboard" && <PipelineDashboardView packages={packages} isAdmin={isAdmin} />}
          {activeTab === "import" && (
            <UniversalImportView 
              uploadDomain={uploadDomain} 
              setUploadDomain={setUploadDomain} 
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
              reviewerName={reviewerName}
              setReviewerName={setReviewerName}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === "ocr" && <OCRWorkspaceView pkg={selectedPkg} isAdmin={isAdmin} />}
          {activeTab === "classification" && <ClassificationView pkg={selectedPkg} isAdmin={isAdmin} />}
          {activeTab === "chunking" && <SmartChunkingView pkg={selectedPkg} />}
          {activeTab === "extraction" && <EntitiesAndRelationsView pkg={selectedPkg} isAdmin={isAdmin} />}
          {activeTab === "normalization" && <NormalizationView pkg={selectedPkg} onApprove={handleApproveNorm} isAdmin={isAdmin} />}
          {activeTab === "conflicts" && <ConflictQueueView pkg={selectedPkg} onResolve={handleResolveConflict} isAdmin={isAdmin} />}
          {activeTab === "quality" && <QualityEngineView pkg={selectedPkg} />}
          {activeTab === "review" && (
            <ExpertReviewView 
              pkg={selectedPkg} 
              reviewerName={reviewerName}
              reviewComment={reviewComment}
              setReviewComment={setReviewComment}
              onApprove={handleApprovePackage}
              onReject={handleRejectPackage}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === "graph" && <GraphSyncView pkg={selectedPkg} onSync={handleGraphSync} isAdmin={isAdmin} />}
          {activeTab === "audit" && <AuditTrailView pkg={selectedPkg} isAdmin={isAdmin} />}
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-VIEWS
// ----------------------------------------------------------------------

function NavTab({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
        active 
          ? "bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500" 
          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function PipelineDashboardView({ packages, isAdmin }: { packages: IIngestionPipelinePackage[], isAdmin: boolean }) {
  const total = packages.length;
  const approved = packages.filter(p => p.metadata.approvalStatus === "APPROVED").length;
  const pending = packages.filter(p => p.metadata.approvalStatus === "PENDING").length;
  const avgQuality = Math.round(packages.reduce((acc, p) => acc + p.quality.overallQualityScore, 0) / (total || 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Universal Pipeline Intelligence Center</h2>
          <p className="text-xs text-slate-400">Canonical ingestion pipeline metrics across Vastu, Chakra, Lal Kitab & Astrological Shastras.</p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded">
          PIPELINE HEALTH: 100% ONLINE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <StatCard title="TOTAL INGESTED DOCUMENTS" value={total.toString()} sub="Cross-Domain Knowledge Base" icon={Database} />
        <StatCard title="APPROVED SHASTRA CANONS" value={approved.toString()} sub="In Knowledge Graph" icon={CheckCircle} color="text-emerald-400" />
        <StatCard title="PENDING EXPERT REVIEW" value={pending.toString()} sub="In Review Queue" icon={Clock} color="text-amber-400" />
        <StatCard title="AVERAGE QUALITY SCORE" value={`${avgQuality} / 100`} sub="Algorithmic Audit Score" icon={Award} color="text-blue-400" />
      </div>

      <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">Active Ingestion Pipeline Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-2.5">Document Title</th>
                <th className="p-2.5">Domain</th>
                <th className="p-2.5">Format</th>
                <th className="p-2.5">Entities</th>
                <th className="p-2.5">Quality</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {packages.map(p => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="p-2.5 font-semibold text-slate-100">{p.metadata.title}</td>
                  <td className="p-2.5"><span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">{p.metadata.domain}</span></td>
                  <td className="p-2.5 text-slate-400">{p.format}</td>
                  <td className="p-2.5 text-emerald-400">{p.entities.length}</td>
                  <td className="p-2.5 font-bold">{p.quality.overallQualityScore} ({p.quality.qualityGrade})</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase ${
                      p.metadata.approvalStatus === "APPROVED" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"
                    }`}>
                      {p.metadata.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color = "text-slate-100" }: { title: string, value: string, sub: string, icon: any, color?: string }) {
  return (
    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-[9px] uppercase font-bold tracking-wider">{title}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <p className="text-[10px] text-slate-500">{sub}</p>
    </div>
  );
}

function UniversalImportView({ uploadDomain, setUploadDomain, onFileUpload, isProcessing, reviewerName, setReviewerName, isAdmin }: any) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Universal Document Import Center</h2>
        <p className="text-xs text-slate-400">Upload PDF, Scanned PDF, DOCX, TXT, Markdown, HTML, EPUB, or Image files into the Universal Pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <label className="text-[10px] text-slate-400 font-bold uppercase block">TARGET KNOWLEDGE DOMAIN</label>
          <select
            value={uploadDomain}
            onChange={e => setUploadDomain(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
          >
            <option value="Vastu">Vastu Scripture Library</option>
            <option value="Chakra">Chakra Intelligence Library</option>
            <option value="LalKitab">Lal Kitab Astro-Remedies</option>
            <option value="Numerology">Numerology Name Engine</option>
            <option value="Astrology">Jyotish Kundli Shastra</option>
            <option value="ResearchPaper">Empirical Research Paper</option>
            <option value="Book">Classical Reference Book</option>
            <option value="Article">Expert Article</option>
          </select>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <label className="text-[10px] text-slate-400 font-bold uppercase block">IMPORTER / REVIEWER IDENTITY</label>
          <input
            type="text"
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="p-8 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center space-y-4 transition-colors">
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-full text-emerald-400">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-200 font-mono">Drag & Drop or Choose Knowledge Source File</p>
          <p className="text-xs text-slate-400">Supports PDF, Scanned PDF, DOCX, TXT, MD, HTML, EPUB, PNG, JPG</p>
        </div>

        <input
          type="file"
          id="universal-file-input"
          className="hidden"
          onChange={onFileUpload}
          disabled={isProcessing}
        />

        <label
          htmlFor="universal-file-input"
          className={`px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded-lg cursor-pointer transition-colors ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing ? "Processing Pipeline..." : "SELECT FILE TO INGEST"}
        </label>
      </div>
    </div>
  );
}

function OCRWorkspaceView({ pkg, isAdmin }: { pkg: IIngestionPipelinePackage, isAdmin: boolean }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;
  const ocr = pkg.ocrResult;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">OCR & Multi-Language Script Engine</h2>
          <p className="text-xs text-slate-400">Gemini-2.5-Pro Devanagari / Sanskrit / English OCR text extraction and page mapping.</p>
        </div>
        {isAdmin && ocr && (
          <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded font-bold">
            INTERNAL OCR CONFIDENCE: {Math.round(ocr.overallConfidence * 100)}%
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        <div className="lg:col-span-8 p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold">EXTRACTED TEXT BODY ({ocr?.language || "Sanskrit / English"})</span>
            <span className="text-[10px] text-emerald-400">{pkg.rawText.length} Characters</span>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded text-slate-300 text-xs whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
            {pkg.rawText}
          </pre>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block border-b border-slate-800 pb-1">Extracted Diagrams & Tables</span>
            <p className="text-[11px] text-slate-400">{ocr?.extractedImages.length || 0} Images Extracted, {ocr?.extractedTables.length || 0} Tables Structured.</p>
            {ocr?.extractedTables.map(t => (
              <div key={t.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] space-y-1">
                <span className="text-emerald-400 font-bold block">{t.title}</span>
                <span className="text-slate-500 text-[9px] block">Page {t.page} ({t.rows.length} rows)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassificationView({ pkg, isAdmin }: { pkg: IIngestionPipelinePackage, isAdmin: boolean }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;
  const meta = pkg.metadata;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Document Classification & Metadata Registry</h2>
        <p className="text-xs text-slate-400">14-field metadata catalog specifying document category, author, language, and ISBN provenance.</p>
      </div>

      <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div>
          <span className="text-slate-500 text-[10px]">TITLE</span>
          <p className="text-slate-100 font-bold">{meta.title}</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">DOMAIN</span>
          <p className="text-emerald-400 font-bold">{meta.domain}</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">AUTHOR</span>
          <p className="text-slate-200">{meta.author}</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">PUBLISHER / EDITION</span>
          <p className="text-slate-200">{meta.publisher} ({meta.edition})</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">YEAR & LANGUAGE</span>
          <p className="text-slate-200">{meta.publicationYear} | {meta.language}</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">ISBN / CATALOG ID</span>
          <p className="text-slate-200">{meta.isbn || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

function SmartChunkingView({ pkg }: { pkg: IIngestionPipelinePackage }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Smart Semantic Chunking Engine</h2>
        <p className="text-xs text-slate-400">Chunks boundaries strictly preserve rules, remedies, mantras, definitions, and tables without cutting mid-sentence.</p>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {pkg.chunks.map(chunk => (
          <div key={chunk.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold">[{chunk.chunkType}] Chunk #{chunk.chunkIndex}</span>
              <span className="text-[10px] text-slate-500">Page {chunk.startPage} ({chunk.content.length} chars)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">{chunk.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntitiesAndRelationsView({ pkg, isAdmin }: { pkg: IIngestionPipelinePackage, isAdmin: boolean }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Entity & Relationship Extraction Engine</h2>
        <p className="text-xs text-slate-400">Automated multi-entity (19 types) & relationship (13 types) extraction with candidate status tracking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            Extracted Entities ({pkg.entities.length})
          </h3>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {pkg.entities.map(e => (
              <div key={e.id} className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{e.canonicalName}</span>
                  <span className="text-[9px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded uppercase">{e.entityType}</span>
                </div>
                <p className="text-[11px] text-slate-400 italic">"{e.rawText}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            Extracted Relationships ({pkg.relationships.length})
          </h3>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {pkg.relationships.map(r => (
              <div key={r.id} className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">{r.sourceEntityName}</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">{r.relationshipType}</span>
                  <span className="text-slate-300 font-bold">{r.targetEntityName}</span>
                </div>
                <p className="text-[11px] text-slate-400">{r.evidenceText}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NormalizationView({ pkg, onApprove, isAdmin }: { pkg: IIngestionPipelinePackage, onApprove: any, isAdmin: boolean }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Concept Normalization Engine</h2>
        <p className="text-xs text-slate-400">Merges equivalent synonyms (e.g. Ishan / NE / Ishanya) into a single canonical entity. Admin approval required.</p>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {pkg.normalizations.map(norm => (
          <div key={norm.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">Raw Expression: "{norm.rawTerm}"</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-emerald-400 font-bold">Canonical Entity: "{norm.suggestedCanonicalTerm}"</span>
              </div>
              <p className="text-[10px] text-slate-500">Synonyms: {norm.synonyms.join(", ")} | Similarity: {Math.round(norm.similarityScore * 100)}%</p>
            </div>

            {isAdmin && norm.status === "Pending" ? (
              <button
                onClick={() => onApprove(pkg.id, norm.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded cursor-pointer"
              >
                Approve Normalization
              </button>
            ) : (
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded border border-emerald-800 font-bold">
                {norm.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConflictQueueView({ pkg, onResolve, isAdmin }: { pkg: IIngestionPipelinePackage, onResolve: any, isAdmin: boolean }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Conflict Detection & Resolution Queue</h2>
        <p className="text-xs text-slate-400">Contradictory claims between scriptures are preserved in full and routed to Acharya SME review.</p>
      </div>

      {pkg.conflicts.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-mono text-xs bg-slate-950 rounded-xl border border-slate-800">
          No unresolved scriptural conflicts detected for this package.
        </div>
      ) : (
        <div className="space-y-4 font-mono text-xs">
          {pkg.conflicts.map(cnf => (
            <div key={cnf.id} className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-rose-400 font-bold">[{cnf.conflictType}] {cnf.topic}</span>
                <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-bold">{cnf.reviewStatus}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] block">SOURCE A: {cnf.sourceA.title}</span>
                  <p className="text-slate-200 text-xs">"{cnf.sourceA.claim}"</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] block">SOURCE B: {cnf.sourceB.title}</span>
                  <p className="text-slate-200 text-xs">"{cnf.sourceB.claim}"</p>
                </div>
              </div>

              {isAdmin && cnf.reviewStatus === "Pending" && (
                <button
                  onClick={() => onResolve(pkg.id, cnf.id)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded cursor-pointer"
                >
                  Resolve Conflict (Reconcile Claims)
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QualityEngineView({ pkg }: { pkg: IIngestionPipelinePackage }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;
  const q = pkg.quality;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Knowledge Quality Engine</h2>
          <p className="text-xs text-slate-400">0–100 numerical score breakdown across 7 sub-metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">{q.overallQualityScore} / 100</span>
          <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded">GRADE {q.qualityGrade}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <QualityBar label="OCR Quality" score={q.ocrQualityScore} />
        <QualityBar label="Metadata Completeness" score={q.metadataCompletenessScore} />
        <QualityBar label="Ontology Completeness" score={q.ontologyCompletenessScore} />
        <QualityBar label="Relationship Completeness" score={q.relationshipCompletenessScore} />
        <QualityBar label="Evidence Completeness" score={q.evidenceCompletenessScore} />
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px]">DUPLICATE & CONFLICT DEDUCTIONS</span>
          <p className="text-rose-400 font-bold">-{q.duplicateDeduction + q.conflictDeduction} Points Deduction</p>
        </div>
      </div>
    </div>
  );
}

function QualityBar({ label, score }: { label: string, score: number }) {
  return (
    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-slate-300 font-bold">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ExpertReviewView({ pkg, reviewerName, reviewComment, setReviewComment, onApprove, onReject, isAdmin }: any) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;

  return (
    <div className="space-y-6 max-w-4xl font-mono text-xs">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Expert Review & Approval Workspace</h2>
        <p className="text-xs text-slate-400">SME Acharya sign-off workflow to approve knowledge packages into Knowledge Graph.</p>
      </div>

      <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase block">EXPERT COMMENT & SCRIPTURAL VERIFICATION NOTES</label>
          <textarea
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            placeholder="Add comments regarding scriptural alignment, verse citations, or remedy verification..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-3 rounded focus:outline-none focus:border-emerald-500 h-24"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onApprove(pkg.id)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded cursor-pointer transition-colors"
          >
            APPROVE & PUBLISH TO KNOWLEDGE GRAPH
          </button>
          <button
            onClick={() => onReject(pkg.id)}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold rounded cursor-pointer transition-colors"
          >
            REJECT PACKAGE
          </button>
        </div>
      </div>
    </div>
  );
}

function GraphSyncView({ pkg, onSync, isAdmin }: { pkg: IIngestionPipelinePackage, onSync: any, isAdmin: boolean }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Knowledge Graph Sync Manager</h2>
          <p className="text-xs text-slate-400">Only approved knowledge items may enter the Knowledge Graph.</p>
        </div>
        {isAdmin && pkg.metadata.approvalStatus === "APPROVED" && (
          <button
            onClick={() => onSync(pkg.id)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded cursor-pointer"
          >
            SYNC NOW TO GRAPH
          </button>
        )}
      </div>

      <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase">Candidate Graph Nodes ({pkg.graphSyncNodes.length})</h3>
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {pkg.graphSyncNodes.map(gn => (
            <div key={gn.id} className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 block">{gn.canonicalName}</span>
                <span className="text-[10px] text-slate-500">Provenance: {gn.provenanceRef} | Edges: {gn.bidirectionalEdgesCount}</span>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${gn.isSyncApproved ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                {gn.isSyncApproved ? "GRAPH SYNCED" : "PENDING SYNC"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditTrailView({ pkg, isAdmin }: { pkg: IIngestionPipelinePackage, isAdmin: boolean }) {
  if (!pkg) return <div className="text-xs text-slate-500 font-mono">No active package selected.</div>;

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Audit Trail & Version History</h2>
        <p className="text-xs text-slate-400">Immutable audit log tracking importer, reviewer, timestamps, and version history.</p>
      </div>

      <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
        <div className="space-y-2">
          {pkg.auditLogs.map(log => (
            <div key={log.id} className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="text-emerald-400 font-bold">{log.actionType}</span>
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-slate-200 text-xs font-semibold">{log.details}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1">
                <span>Importer: {log.importer} | Reviewer: {log.reviewer || "N/A"}</span>
                <span>Version: {log.version}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
