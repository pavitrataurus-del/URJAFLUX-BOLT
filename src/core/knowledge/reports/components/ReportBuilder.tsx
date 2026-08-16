import React, { useState } from "react";
import { Settings, Play, CheckSquare, Square } from "lucide-react";

export default function ReportBuilder({ projectId, onPreview }: { projectId: string, onPreview: (id: string) => void }) {
  const [reportType, setReportType] = useState("Executive Summary");
  const [sections, setSections] = useState(["Cover Page", "Project Information", "Building Summary", "Analysis Overview", "Recommendations"]);
  const [generating, setGenerating] = useState(false);

  const toggleSection = (s: string) => {
    setSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const allSections = [
    "Cover Page", "Project Information", "Building Summary", "Digital Twin Summary", 
    "Analysis Overview", "Compliance Summary", "Detected Issues", "Recommendations",
    "Explainability", "Human Review", "Appendix"
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onPreview("mock-report-123");
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" /> Report Builder
        </h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-slate-700 text-slate-400 hover:bg-slate-800 rounded text-xs font-bold transition-colors">
            SAVE DRAFT
          </button>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <><span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> GENERATING...</>
            ) : (
              <><Play className="w-3 h-3" /> GENERATE & PREVIEW</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Report Type</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#0a101d] border border-slate-800 text-sm text-slate-200 rounded p-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="Executive Summary">Executive Summary</option>
              <option value="Detailed Analysis">Detailed Analysis</option>
              <option value="Compliance Report">Compliance Report</option>
              <option value="Explainability Report">Explainability Report</option>
              <option value="Client Report">Client Report</option>
              <option value="Audit Report">Audit Report</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Analysis Scope</label>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Project</span>
                <span className="text-xs text-slate-200">{projectId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Building</span>
                <span className="text-xs text-blue-400 cursor-pointer hover:underline">Select Building</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Floor</span>
                <span className="text-xs text-blue-400 cursor-pointer hover:underline">All Floors</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Included Sections</span>
            <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => setSections(allSections)}>Select All</span>
          </label>
          <div className="p-1 bg-slate-900 border border-slate-800 rounded flex-1 overflow-y-auto">
            {allSections.map(s => (
              <div 
                key={s} 
                onClick={() => toggleSection(s)}
                className="flex items-center gap-3 p-2 hover:bg-slate-800/50 cursor-pointer border-b border-slate-800/50 last:border-0 transition-colors"
              >
                {sections.includes(s) ? (
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600" />
                )}
                <span className={`text-xs ${sections.includes(s) ? 'text-slate-200' : 'text-slate-500'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
