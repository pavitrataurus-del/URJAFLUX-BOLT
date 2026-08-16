import React, { useState } from "react";
import { 
  Brain, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Layers, 
  Compass,
  Search,
  Check
} from "lucide-react";
import { spatialAIPipeline } from "../../services/digitalTwin/spatialAIPipeline";
import { GroundedSpatialResponse } from "../../types/digitalTwin";

export const SpatialAiAssistantPanel: React.FC = () => {
  const [userQuery, setUserQuery] = useState<string>(
    "Evaluate Vastu compliance, ventilation rates, and energy load for the Ishan Executive Suite (Room 101)."
  );
  const [pipelineResult, setPipelineResult] = useState<GroundedSpatialResponse | null>(() => {
    return spatialAIPipeline.executePipeline({
      queryText: "Evaluate Vastu compliance for Ishan Executive Suite",
      targetTwinId: "TWIN-RM-101",
      contextScope: "ROOM"
    });
  });

  const handleRunQuery = () => {
    if (!userQuery.trim()) return;
    const res = spatialAIPipeline.executePipeline({
      queryText: userQuery,
      targetTwinId: "TWIN-RM-101",
      contextScope: "ALL"
    });
    setPipelineResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
          <Brain className="w-4 h-4" />
          <span>MODULE 10: GROUNDED SPATIAL AI ASSISTANT PIPELINE</span>
        </div>
        <h2 className="text-xl font-mono font-bold text-slate-100">8-Step Grounded Explainable AI Query Engine</h2>
        <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
          Queries undergo strict multi-stage verification: Knowledge Retrieval → Spatial Context → Twin Model Verification → Rule Evaluation → Grounded Citation Output.
        </p>
      </div>

      {/* Query Input Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          value={userQuery} 
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRunQuery()}
          placeholder="Ask any spatial, Vastu, energy or building code question..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
        />
        <button 
          onClick={handleRunQuery}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-purple-600/20"
        >
          <Send className="w-3.5 h-3.5" />
          <span>RUN PIPELINE</span>
        </button>
      </div>

      {/* 8-Step Pipeline Visual Progress Tracker */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl font-mono text-[10px]">
        <div className="text-slate-400 font-bold mb-3 uppercase tracking-wider">Pipeline Execution Pipeline Stages</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            "1. User Query",
            "2. Knowledge Get",
            "3. Spatial Context",
            "4. Twin Model",
            "5. Rule Evaluation",
            "6. Evidence Check",
            "7. Answer Synthesis",
            "8. Recommendations"
          ].map((stage, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-bold flex flex-col items-center justify-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grounded Response Output Cards */}
      {pipelineResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* Main Grounded Answer & Recommendations (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Synthesized Grounded Response</h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/30">
                  Confidence: {pipelineResult.confidenceScore * 100}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-sans text-xs text-slate-200 leading-relaxed">
                {pipelineResult.answerText}
              </div>

              <div className="text-slate-400 text-[10px] font-mono">
                {pipelineResult.spatialContextSummary}
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Actionable Recommendations</div>
                <div className="space-y-1.5 font-sans text-xs">
                  {pipelineResult.actionableRecommendations.map((rec, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2 text-slate-300">
                      <span className="text-purple-400 font-mono font-bold">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Knowledge Cites & Rule Evaluations */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Knowledge Citations</h3>
              </div>

              <div className="space-y-3">
                {pipelineResult.evidence.map((ev, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-purple-300 text-xs">{ev.sourceTitle}</div>
                    <div className="text-[10px] text-slate-400">{ev.clauseReference}</div>
                    <p className="text-[11px] font-sans text-slate-300 mt-1 bg-slate-900 p-2 rounded border border-slate-800">{ev.snippetText}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
