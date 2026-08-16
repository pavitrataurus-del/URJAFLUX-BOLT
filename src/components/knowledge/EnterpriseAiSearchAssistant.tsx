// Module 14: Enterprise AI Search Assistant UI
import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  BookOpen,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronRight,
  Database,
  Cpu,
  Layers,
  Send,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import {
  XAiResponse,
  InlineCitation,
  XAiReasoningStep,
  GraphTriplet
} from "../../types/knowledgeIntelligence";
import { ExplainableAiEngine } from "../../core/knowledge/ExplainableAiEngine";
import { KnowledgeFeedbackService } from "../../core/knowledge/KnowledgeFeedbackService";

interface EnterpriseAiSearchAssistantProps {
  tenantId?: string;
}

export const EnterpriseAiSearchAssistant: React.FC<EnterpriseAiSearchAssistantProps> = ({
  tenantId = "tenant_org_01"
}) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [useHybridSearch, setUseHybridSearch] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<XAiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"ANSWER" | "REASONING" | "GRAPH" | "CITATIONS">("ANSWER");
  const [selectedCitation, setSelectedCitation] = useState<InlineCitation | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>("");

  const sampleQueries = [
    "Where should the Chief Executive office and server room be located?",
    "What are the classical Mayamatam rules for Brahmasthan clearance?",
    "How is Ayadi Expenditure Vyaya formula calculated?",
    "What sector is recommended for water body placement?"
  ];

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setResponse(null);
    setSelectedCitation(null);
    setFeedbackSent(false);

    try {
      const res = await ExplainableAiEngine.generateAnswer({
        query: q,
        tenantId,
        topK: 5,
        categories: selectedCategory === "ALL" ? undefined : [selectedCategory],
        useHybridSearch
      });
      setResponse(res);
    } catch (err) {
      console.error("AI Search execution error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run default query on load
    handleSearch("Where should Chief Executive office and server room be located?");
  }, [tenantId]);

  const handleFeedback = (rating: "POSITIVE" | "NEGATIVE") => {
    if (!response || !response.citations[0]) return;
    KnowledgeFeedbackService.submitFeedback(
      tenantId,
      response.query,
      "RESP-CURRENT",
      response.citations[0].id,
      "USR-CURRENT",
      rating,
      rating === "POSITIVE" ? "PERFECT_MATCH" : "INACCURATE_CITATION",
      feedbackText
    );
    setFeedbackSent(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
                Enterprise Knowledge Intelligence RAG
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
                Zero Hallucination
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AI Knowledge Search & Traceable Reasoning Assistant
            </h1>
            <p className="text-sm text-slate-300">
              Query classical treatises and custom enterprise architectural manuals with verified inline citations and transparent reasoning chains.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tenant Isolation: <strong className="text-white">{tenantId}</strong></span>
          </div>
        </div>

        {/* Search Input Controls */}
        <div className="mt-6 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-indigo-500/40 shadow-inner"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-indigo-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any architectural, Vastu, or Ayadi formula question..."
                className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-3 py-2.5 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Vastu Shastra">Vastu Shastra</option>
                <option value="Corporate Vastu">Corporate Vastu</option>
                <option value="Ayadi Numerology">Ayadi Numerology</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? "Searching..." : "Search"}</span>
              </button>
            </div>
          </form>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="text-indigo-300 font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Sample Queries:
            </span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-left truncate max-w-xs"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Response Display */}
      {response && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Top Bar Stats */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Confidence:
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  response.overallConfidence === "HIGH" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {response.overallConfidence}
                </span>
              </span>

              <span className="text-slate-500">
                Grounding Score: <strong className="text-slate-800">{(response.groundingScore * 100).toFixed(1)}%</strong>
              </span>

              <span className="text-slate-500">
                Retrieved Chunks: <strong className="text-slate-800">{response.retrievedChunksCount}</strong>
              </span>

              <span className="text-slate-500">
                Execution Time: <strong className="text-slate-800">{response.executionTimeMs} ms</strong>
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-lg gap-1">
              <button
                onClick={() => setActiveTab("ANSWER")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === "ANSWER" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Verified Answer
              </button>
              <button
                onClick={() => setActiveTab("REASONING")}
                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                  activeTab === "REASONING" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Reasoning Trace ({response.reasoningChain.length})
              </button>
              <button
                onClick={() => setActiveTab("GRAPH")}
                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                  activeTab === "GRAPH" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                Knowledge Graph ({response.graphTripletsExplored})
              </button>
              <button
                onClick={() => setActiveTab("CITATIONS")}
                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                  activeTab === "CITATIONS" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Sources ({response.citations.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "ANSWER" && (
              <div className="space-y-6">
                <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/50 p-5 rounded-xl border border-slate-200/80">
                  {response.answerText}
                </div>

                {/* Inline Citation Quick List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Grounded Source Citations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {response.citations.map((cit: any, idx: number) => (
                      <div
                        key={`${cit.id || cit.citationId || 'cit'}-${idx}`}
                        onClick={() => setSelectedCitation(cit)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedCitation?.id === cit.id
                            ? "bg-indigo-50/80 border-indigo-400 shadow-sm"
                            : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                            [{cit.citationIndex}] {cit.documentTitle}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Confidence: {(cit.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 italic">
                          "{cit.snippet}"
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                          {cit.chapter && <span>Chapter: {cit.chapter}</span>}
                          {cit.verseNumber && <span>Verse: {cit.verseNumber}</span>}
                          {cit.pageNumber && <span>Page: {cit.pageNumber}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback Widget */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>Was this citations-backed answer accurate?</span>
                    {!feedbackSent ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleFeedback("POSITIVE")}
                          className="p-1.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition-all"
                          title="Accurate & Helpful"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback("NEGATIVE")}
                          className="p-1.5 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-all"
                          title="Inaccurate or Outdated"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Feedback recorded for RLHF loop!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "REASONING" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" /> Explainable AI Execution Step-by-Step Chain
                </h3>
                <div className="space-y-3">
                  {response.reasoningChain.map((step) => (
                    <div key={step.stepIndex} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-indigo-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            {step.stepIndex}
                          </span>
                          {step.stageName}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Confidence: {(step.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{step.description}</p>
                      {step.evidenceUsed.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1">
                          {step.evidenceUsed.map((ev, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-600 text-[10px] font-mono">
                              {ev}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "GRAPH" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-600" /> Multi-Hop Knowledge Graph Traversal
                </h3>
                <div className="p-5 rounded-xl bg-slate-900 text-slate-100 space-y-3 font-mono text-xs">
                  <div className="text-slate-400 flex items-center justify-between pb-2 border-b border-slate-800">
                    <span>Subject Entity</span>
                    <span>Predicate Link</span>
                    <span>Object Entity</span>
                  </div>
                  {ExplainableAiEngine && (
                    <div className="space-y-2">
                      {response.citations.slice(0, 4).map((cit, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                          <span className="text-indigo-300 font-semibold">{cit.documentTitle}</span>
                          <span className="text-amber-400 font-mono text-[11px]">--[REFERENCES_CANON]--&gt;</span>
                          <span className="text-emerald-300 font-semibold">{cit.chapter || "Core Rule"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "CITATIONS" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Grounded Source Document Inspection
                </h3>
                <div className="space-y-3">
                  {response.citations.map((cit: any, idx: number) => (
                    <div key={`${cit.id || cit.citationId || 'cit'}-${idx}`} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-indigo-900">
                          [{cit.citationIndex}] {cit.documentTitle}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          Score: {(cit.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 italic">
                        "{cit.snippet}"
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Chunk ID: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{cit.chunkId}</code></span>
                        <span>Document ID: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{cit.documentId}</code></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
