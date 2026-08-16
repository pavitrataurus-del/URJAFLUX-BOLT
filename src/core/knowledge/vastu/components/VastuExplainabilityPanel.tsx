import React from "react";
import { BrainCircuit, ShieldAlert, FileText, CheckCircle, HelpCircle } from "lucide-react";

export default function VastuExplainabilityPanel({ twin, isAdmin }: any) {
  return (
    <div className="p-4 space-y-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <BrainCircuit className="w-4 h-4 text-purple-400" /> Vastu Explainability
      </div>

      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analysis Summary</h4>
        <p className="text-[10px] text-slate-300 leading-relaxed">
          The AI Reasoning Engine utilized 4 specialized experts (Spatial, Vastu, Compliance, Ontology) to evaluate the current layout. It referenced 12 canonical rules from the classical Vastu Shastra database to generate the current findings.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decision Trace</h4>
        
        <div className="pl-4 border-l-2 border-purple-500/30 space-y-4">
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-[#05080f]" />
            <div className="text-[10px] font-bold text-slate-200">1. Spatial Extraction</div>
            <div className="text-[9px] text-slate-500">Identified 8 rooms and calculated centroid.</div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-[#05080f]" />
            <div className="text-[10px] font-bold text-slate-200">2. Zone Mapping</div>
            <div className="text-[9px] text-slate-500">Overlayed 16-zone Vastu Chakra based on magnetic North.</div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-[#05080f]" />
            <div className="text-[10px] font-bold text-slate-200">3. Rule Evaluation</div>
            <div className="text-[9px] text-slate-500">Evaluated 12 active rules against the spatial graph.</div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
          <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Admin Evidence Metadata
          </h4>
          <div className="p-2 bg-slate-900 border border-rose-500/20 rounded text-[9px] font-mono text-slate-400 overflow-x-auto">
            {"{\n  \"promptHash\": \"9f86d081884c7d659a2f\",\n  \"confidenceMatrix\": [0.95, 0.88, 0.99],\n  \"sourceDocs\": [\"doc_492\", \"doc_118\"]\n}"}
          </div>
        </div>
      )}
    </div>
  );
}
