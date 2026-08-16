import React from "react";
import { Download, Printer, Eye, BrainCircuit, FileText } from "lucide-react";

export default function ReportPreview({ reportId, isAdmin }: { reportId: string | null, isAdmin: boolean }) {
  if (!reportId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-xs">Select a report from History or Generate a new one in the Builder to preview it here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden relative">
      <div className="h-10 border-b border-slate-800 bg-[#0a101d] flex items-center justify-between px-3 shrink-0">
        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" /> PREVIEW
        </div>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"><Printer className="w-4 h-4" /></button>
          <div className="h-4 w-px bg-slate-700 my-auto" />
          <button className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold hover:bg-emerald-500/30 transition-colors">
            <Download className="w-3 h-3" /> PDF
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold hover:bg-blue-500/30 transition-colors">
            <Download className="w-3 h-3" /> DOCX
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-950">
        {/* Mock A4 Paper */}
        <div className="bg-white w-full max-w-[21cm] min-h-[29.7cm] shadow-2xl rounded text-slate-800 p-8">
          {/* Header */}
          <div className="border-b-2 border-slate-200 pb-4 mb-6">
            <h1 className="text-2xl font-light text-slate-900 tracking-tight">Executive Summary</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Generated: 2026-07-25 • Urjaflux AI OS</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="font-bold text-blue-600 uppercase text-xs tracking-wider mb-2">Overall Status</h3>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded border border-slate-100">
                <div className="text-3xl font-light text-emerald-600">84%</div>
                <div className="text-slate-600">Overall Compliance Score based on automated spatial and rules engine analysis.</div>
              </div>
            </section>
            
            <section>
              <h3 className="font-bold text-blue-600 uppercase text-xs tracking-wider mb-2">Top Risks</h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>Heavy structural column detected in Center zone (Brahmasthan).</li>
                <li>Fire element excess detected in South-East zone.</li>
              </ul>
            </section>

            {isAdmin && (
              <section className="mt-8 pt-4 border-t border-dashed border-rose-200 bg-rose-50/50 p-4 rounded">
                <h3 className="font-bold text-rose-600 uppercase text-xs tracking-wider mb-2 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Explainability Report (Admin Only)
                </h3>
                <div className="text-xs text-slate-600 space-y-2 font-mono">
                  <p><strong>Decision Trace:</strong> MasterChakraEngine -&gt; RuleEvaluator -&gt; RecommendationEngine</p>
                  <p><strong>Confidence:</strong> 0.95</p>
                  <p><strong>Source Evidence:</strong> [doc_118, doc_492]</p>
                </div>
              </section>
            )}
            
            {!isAdmin && (
              <section className="mt-8 pt-4 border-t border-slate-200">
                <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-2">Explainability</h3>
                <p className="text-slate-600 text-xs">
                  This report was generated using standard canonical rules applied to the spatial digital twin. All findings have been verified for layout consistency.
                </p>
              </section>
            )}
          </div>
          
          <div className="mt-8 p-3 bg-blue-50 text-blue-800 text-xs border border-blue-100 rounded">
            Temporary Placeholder Preview. PDF/DOCX Export requires backend ReportExportService.
          </div>
        </div>
      </div>
    </div>
  );
}
