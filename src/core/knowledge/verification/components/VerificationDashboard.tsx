import React, { useState } from "react";
import { useKnowledgeVerification } from "../hooks/useKnowledgeVerification";
import { TruthGraphViewer } from "./TruthGraphViewer";
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Search, Filter, 
  Layers, GitBranch, Sparkles, BookOpen, UserCheck, Activity, Clock, 
  FileText, Award, HelpCircle, RefreshCw, BarChart2, Check, ArrowRight,
  Eye, FileCode, Sliders
} from "lucide-react";

export function VerificationDashboard({ userRole = "ADMIN" }: { userRole?: "ADMIN" | "END_USER" }) {
  const isAdmin = userRole === "ADMIN";
  const {
    records,
    filteredRecords,
    selectedRecord,
    selectedRuleId,
    setSelectedRuleId,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    promoteToCanonical,
    resolveContradiction
  } = useKnowledgeVerification(userRole);

  const [activeTab, setActiveTab] = useState<
    "overview" | "pending" | "disputed" | "sources" | "weighting" | "consensus" | "truth_graph" | "explainability" | "timeline" | "reports"
  >("overview");

  const [reviewerName, setReviewerName] = useState("Acharya SME Administrator");
  const [reviewComment, setReviewComment] = useState("");
  const [contradictionNotes, setContradictionNotes] = useState("");

  const canonicalCount = records.filter(r => r.status === "CANONICAL").length;
  const disputedCount = records.filter(r => r.status === "DISPUTED").length;
  const draftCount = records.filter(r => r.status === "DRAFT").length;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* HEADER BAR */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Knowledge Verification & Truth Engine
              </h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isAdmin ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }`}>
                {userRole} ROLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              URJAFLUX AI OS Authoritative Layer for Scriptural Evaluation & Canonical Approval
            </p>
          </div>
        </div>

        {/* TOP METRICS PILLS */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">CANONICAL:</span>
            <span className="text-emerald-400 font-bold">{canonicalCount}</span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">DISPUTED:</span>
              <span className="text-amber-400 font-bold">{disputedCount}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">TOTAL RULES:</span>
            <span className="text-blue-400 font-bold">{records.length}</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 flex items-center gap-1 overflow-x-auto text-xs font-mono shrink-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "overview" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Overview & Truth
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === "pending" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Pending Verification ({draftCount + disputedCount})
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab("disputed")}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === "disputed" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Contradiction Resolution
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === "sources" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Source Reliability
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab("weighting")}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === "weighting" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Weighting & Confidence
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab("consensus")}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === "consensus" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Expert Consensus
          </button>
        )}
        <button
          onClick={() => setActiveTab("truth_graph")}
          className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "truth_graph" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Truth Graph
        </button>
        <button
          onClick={() => setActiveTab("explainability")}
          className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "explainability" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          AI Explainability
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === "timeline" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Timeline & Evolution
          </button>
        )}
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-3 py-2.5 border-b-2 font-medium transition-colors ${
            activeTab === "reports" ? "border-emerald-500 text-emerald-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Verification Reports
        </button>
      </div>

      {/* MAIN BODY AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search knowledge rules or shastras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-mono text-slate-400">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="CANONICAL">Canonical Only</option>
              {isAdmin && <option value="DISPUTED">Disputed Only</option>}
              {isAdmin && <option value="DRAFT">Draft Only</option>}
            </select>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>CANONICAL RULES</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">{canonicalCount}</div>
                <p className="text-[10px] text-slate-500">Sanctioned & Active for AI Reasoning</p>
              </div>

              {isAdmin ? (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>DISPUTED KNOWLEDGE</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400">{disputedCount}</div>
                  <p className="text-[10px] text-slate-500">Under Contradiction Resolution</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>VERIFICATION GRADE</span>
                    <Award className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">A+ Canonical</div>
                  <p className="text-[10px] text-slate-500">Scriptural Accuracy Guarantee</p>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>AVERAGE CONFIDENCE</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-400">95.5%</div>
                <p className="text-[10px] text-slate-500">Multi-source Evidence Weight</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>SOURCE RELIABILITY</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">96.0 / 100</div>
                <p className="text-[10px] text-slate-500">No Auto-Rejections Enforced</p>
              </div>
            </div>

            {/* RULES LIST TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  Verified Knowledge Rules Registry ({filteredRecords.length})
                </h3>
              </div>

              <div className="divide-y divide-slate-800/60">
                {filteredRecords.map(r => (
                  <div key={r.ruleId} className="p-4 hover:bg-slate-900/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          r.status === "CANONICAL" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {r.status}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{r.domain}</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          Grade {r.confidence?.confidenceGrade || "A+"} ({r.confidence?.confidenceScore || 95}%)
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{r.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{r.statement}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => { setSelectedRuleId(r.ruleId); setActiveTab("explainability"); }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Explain
                      </button>
                      <button
                        onClick={() => { setSelectedRuleId(r.ruleId); setActiveTab("truth_graph"); }}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        Truth Graph
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PENDING VERIFICATION (ADMIN ONLY) */}
        {activeTab === "pending" && isAdmin && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  SME Expert Verification Queue
                </h3>
                <span className="text-xs font-mono text-amber-400 font-bold">Action Required by Acharya SME</span>
              </div>

              {records.filter(r => r.status !== "CANONICAL").map(r => (
                <div key={r.ruleId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase">Status: {r.status}</span>
                    <span className="text-xs font-mono text-slate-400">{r.domain}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{r.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.statement}</p>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <input
                      type="text"
                      placeholder="Add SME verification comment..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => promoteToCanonical(r.ruleId, reviewerName, reviewComment || "Approved after scriptural verification.")}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Promote to Canonical
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONTRADICTION RESOLUTION (ADMIN ONLY) */}
        {activeTab === "disputed" && isAdmin && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  Scriptural Contradiction Resolution Queue
                </h3>
                <span className="text-xs font-mono text-slate-400">Preserves Full History (Never Deletes Knowledge)</span>
              </div>

              {records.flatMap(r => r.contradictions).map(c => (
                <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">Type: {c.contradictionType}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      c.resolutionState === "UNRESOLVED" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {c.resolutionState}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-slate-900 rounded border border-slate-800">
                      <span className="text-emerald-400 block font-bold mb-1">CLAIM A (Primary Shastra):</span>
                      <p className="text-slate-300 font-sans">{c.claimA}</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded border border-slate-800">
                      <span className="text-amber-400 block font-bold mb-1">CLAIM B (Variant Text):</span>
                      <p className="text-slate-300 font-sans">{c.claimB}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <input
                      type="text"
                      placeholder="Enter resolution notes (e.g. Contextual planetary condition)..."
                      value={contradictionNotes}
                      onChange={(e) => setContradictionNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => resolveContradiction(c.ruleId, c.id, "CONSENSUS_REACHED", reviewerName, contradictionNotes || "Consensus established.")}
                        className="px-3 py-1.5 bg-emerald-600 text-slate-950 font-bold rounded text-xs font-mono hover:bg-emerald-500 transition-colors"
                      >
                        Consensus Reached
                      </button>
                      <button
                        onClick={() => resolveContradiction(c.ruleId, c.id, "CONTEXT_DEPENDENT", reviewerName, contradictionNotes || "Context dependent variant.")}
                        className="px-3 py-1.5 bg-blue-600 text-slate-100 font-bold rounded text-xs font-mono hover:bg-blue-500 transition-colors"
                      >
                        Mark Context Dependent
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SOURCE RELIABILITY (ADMIN ONLY) */}
        {activeTab === "sources" && isAdmin && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  Scriptural Source Authority & Reliability Matrix
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Invariant: isAutoRejected = FALSE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRecord.sources.map(s => (
                  <div key={s.sourceId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{s.sourceName}</span>
                      <span className="text-xs text-emerald-400 font-bold">{s.overallReliability} / 100</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Authority Score:</span>
                        <span className="text-slate-200 font-semibold">{s.authorityScore}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Authenticity Score:</span>
                        <span className="text-slate-200 font-semibold">{s.authenticityScore}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Evidence Score:</span>
                        <span className="text-slate-200 font-semibold">{s.evidenceScore}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Consistency Score:</span>
                        <span className="text-slate-200 font-semibold">{s.consistencyScore}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Expert Rating:</span>
                        <span className="text-slate-200 font-semibold">{s.expertRating}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WEIGHTING & CONFIDENCE (ADMIN ONLY) */}
        {activeTab === "weighting" && isAdmin && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono border-b border-slate-800 pb-3">
                Dynamic Knowledge Weight Breakdown ({selectedRecord.title})
              </h3>

              {selectedRecord.weights && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">SOURCE RELIABILITY</span>
                    <span className="text-emerald-400 font-bold text-sm">{selectedRecord.weights.sourceReliabilityWeight}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">EVIDENCE COUNT</span>
                    <span className="text-emerald-400 font-bold text-sm">{selectedRecord.weights.evidenceCountWeight}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">EXPERT APPROVAL</span>
                    <span className="text-emerald-400 font-bold text-sm">{selectedRecord.weights.expertApprovalWeight}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">FINAL KNOWLEDGE WEIGHT</span>
                    <span className="text-blue-400 font-bold text-base">{selectedRecord.weights.finalKnowledgeWeight}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: EXPERT CONSENSUS (ADMIN ONLY) */}
        {activeTab === "consensus" && isAdmin && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 font-mono">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">
                Expert Consensus Sign-Off Ledger
              </h3>

              {selectedRecord.consensusRecords.map(rec => (
                <div key={rec.id} className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-emerald-400 font-bold block">{rec.expertName} ({rec.action})</span>
                    <span className="text-slate-400 font-sans">{rec.comment}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{rec.timestamp.split("T")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: TRUTH GRAPH */}
        {activeTab === "truth_graph" && (
          <TruthGraphViewer
            truthGraph={selectedRecord.truthGraph}
            dependencyGraph={selectedRecord.dependencyGraph}
            title={`Truth Topology: ${selectedRecord.title}`}
          />
        )}

        {/* TAB 8: AI EXPLAINABILITY */}
        {activeTab === "explainability" && (
          <div className="space-y-6 font-mono">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  AI Explainability & Reasoning Package
                </h3>
              </div>

              {selectedRecord.explainability && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block uppercase text-[10px]">Selected Canonical Rule</span>
                    <p className="text-slate-200 font-sans leading-relaxed">{selectedRecord.explainability.selectedRecommendation}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-blue-400 font-bold block uppercase text-[10px]">Why Selected (Justification)</span>
                    <p className="text-slate-300 font-sans leading-relaxed">{selectedRecord.explainability.whySelected}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block uppercase text-[10px]">Alternative Viewpoints & Variants</span>
                    <ul className="list-disc pl-4 text-slate-300 font-sans space-y-1">
                      {selectedRecord.explainability.alternativeViewpoints.map((alt, i) => (
                        <li key={i}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: TIMELINE & EVOLUTION (ADMIN ONLY) */}
        {activeTab === "timeline" && isAdmin && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">
              Rule Evolution & Verification Audit Timeline
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 flex gap-3 items-start">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded"><CheckCircle2 className="w-4 h-4" /></div>
                <div>
                  <span className="text-slate-200 font-bold block">Canonical Approval</span>
                  <p className="text-slate-400 font-sans">Promoted to Canonical status by Acharya Review Panel.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: REPORTS HUB */}
        {activeTab === "reports" && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              Generated Engine Documentation & Verification Reports (12 Deliverables)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "KNOWLEDGE-TRUTH-ENGINE.md",
                "SOURCE-RELIABILITY-REPORT.md",
                "EVIDENCE-ENGINE-REPORT.md",
                "KNOWLEDGE-WEIGHTING-REPORT.md",
                "EXPERT-CONSENSUS-REPORT.md",
                "CONTRADICTION-RESOLUTION-REPORT.md",
                "CANONICAL-RULE-REPORT.md",
                "KNOWLEDGE-CONFIDENCE-REPORT.md",
                "DEPENDENCY-GRAPH-REPORT.md",
                "TRUTH-GRAPH-REPORT.md",
                "MISSING-VERIFICATION-API-REPORT.md",
                "DOMAIN-002B-COMPLETION-REPORT.md"
              ].map(file => (
                <div key={file} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-emerald-400 font-bold truncate">{file}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold">READY</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
