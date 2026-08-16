import React, { useState } from "react";
import { TruthGraphData, DependencyGraph } from "../VerificationTypes";
import { ShieldCheck, Database, FileText, UserCheck, Activity, Layers, GitBranch, Share2 } from "lucide-react";

interface TruthGraphViewerProps {
  truthGraph?: TruthGraphData;
  dependencyGraph?: DependencyGraph;
  title?: string;
}

export function TruthGraphViewer({ truthGraph, dependencyGraph, title = "Truth Node Knowledge Graph" }: TruthGraphViewerProps) {
  const [activeTab, setActiveTab] = useState<"TRUTH" | "DEPENDENCY">("TRUTH");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const tNodes = truthGraph?.nodes || [];
  const tEdges = truthGraph?.edges || [];
  const dNodes = dependencyGraph?.nodes || [];
  const dEdges = dependencyGraph?.edges || [];

  const getNodeColor = (type: string) => {
    switch (type) {
      case "TRUTH_NODE": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "EVIDENCE_NODE": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
      case "SOURCE_NODE": return "bg-amber-500/20 text-amber-400 border-amber-500/50";
      case "CONSENSUS_NODE": return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      case "CONFIDENCE_NODE": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "DEPENDENCY_NODE": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/50";
      case "VERSION_NODE": return "bg-slate-500/20 text-slate-300 border-slate-500/50";
      default: return "bg-slate-700 text-slate-200 border-slate-600";
    }
  };

  const getDepColor = (type: string) => {
    switch (type) {
      case "ROOM": return "bg-emerald-900/40 text-emerald-300 border-emerald-600";
      case "ELEMENT": return "bg-amber-900/40 text-amber-300 border-amber-600";
      case "DIRECTION": return "bg-blue-900/40 text-blue-300 border-blue-600";
      case "CHAKRA": return "bg-purple-900/40 text-purple-300 border-purple-600";
      case "REMEDY": return "bg-rose-900/40 text-rose-300 border-rose-600";
      default: return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">{title}</h3>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab("TRUTH")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "TRUTH" ? "bg-emerald-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Truth Graph Nodes ({tNodes.length})
          </button>
          <button
            onClick={() => setActiveTab("DEPENDENCY")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "DEPENDENCY" ? "bg-emerald-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dependency Chain ({dNodes.length})
          </button>
        </div>
      </div>

      {activeTab === "TRUTH" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Truth Graph topology links Canonical Knowledge with Primary Evidence, Source Authority, SME Consensus, Confidence Grades, and Version History.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tNodes.map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${getNodeColor(node.type)} ${
                  selectedNodeId === node.id ? "ring-2 ring-emerald-400 scale-[1.02]" : "hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-80">
                    {node.type.replace("_", " ")}
                  </span>
                  <Activity className="w-3.5 h-3.5 opacity-60" />
                </div>
                <div className="text-xs font-semibold leading-tight">{node.label}</div>
                {selectedNodeId === node.id && node.data && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] font-mono space-y-1 opacity-90">
                    {Object.entries(node.data).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400 capitalize">{k}:</span>
                        <span className="font-semibold text-slate-200">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Graph Relations ({tEdges.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {tEdges.map(edge => (
                <div key={edge.id} className="text-[10px] font-mono bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between gap-2">
                  <span className="truncate text-slate-300">{edge.source.split("-")[0]}</span>
                  <span className="text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-950/60 rounded border border-emerald-800/40 text-[9px]">
                    {edge.label}
                  </span>
                  <span className="truncate text-slate-300">{edge.target.split("-")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "DEPENDENCY" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-tier ontological dependency resolution mapping macro architectural spatial zones down to micro vibrational Yantras and Chakras.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {dNodes.map((node, i) => (
              <React.Fragment key={node.id}>
                <div className={`p-3 rounded-lg border font-mono text-xs ${getDepColor(node.type)}`}>
                  <div className="text-[9px] uppercase font-bold text-slate-400">{node.type} ({node.domain})</div>
                  <div className="font-semibold mt-0.5">{node.label}</div>
                </div>
                {i < dNodes.length - 1 && (
                  <span className="text-emerald-400 font-mono text-sm font-bold px-1">↓</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Dependency Relation Matrix
            </span>
            <div className="space-y-1.5 font-mono text-xs text-slate-300">
              {dEdges.map(edge => (
                <div key={edge.id} className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-200 font-semibold">{edge.source}</span>
                  <span className="text-emerald-400 text-[10px] font-bold">-[ {edge.relationship} ]-&gt;</span>
                  <span className="text-slate-200 font-semibold">{edge.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
