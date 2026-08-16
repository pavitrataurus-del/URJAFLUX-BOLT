import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, Activity, Zap, Compass } from 'lucide-react';
import { generateAstroVastuReport } from '../../services/aiAstroVastuService';

interface UrjaFluxReportModalProps {
  onClose: () => void;
  clientId: string;
  propertyId: string;
}

export default function UrjaFluxReportModal({ onClose, clientId, propertyId }: UrjaFluxReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Dummy data for testing as requested
      const mockRequest = {
        clientProfile: {
          mulank: 4,
          bhagyank: 8,
          loshuGridMissingNumbers: [3, 5, 7]
        },
        astroData: {
          lalKitabKundliPlacements: "Sun in 10th House, Jupiter in 4th",
          activeDasha: "Rahu Mahadasha"
        },
        spatialBlueprint: {
          degreesOffset: 12.5,
          roomLayoutPerZone: {
            "NE": "Kitchen (Fire)",
            "SW": "Master Bedroom",
            "Center": "Heavy staircase"
          },
          detectedGeopathicStressPoints: []
        }
      };

      const result = await generateAstroVastuReport(mockRequest);
      setReport(result);
    } catch (err: any) {
      console.error("AI Audit failed:", err);
      setError(err.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">UrjaFlux AI Engine</h2>
              <p className="text-xs text-slate-400">Astro-Vastu Spatial Diagnostics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          {!report && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready for Analysis</h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                Initialize the UrjaFlux Engine to cross-reference numerology, Lal Kitab placements, and spatial data to generate a highly precise Vastu remedy report.
              </p>
              <button 
                onClick={runAudit}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/50 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Execute End-to-End Audit
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Activity className="w-12 h-12 text-emerald-400 animate-pulse mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">Synthesizing Data...</h3>
              <p className="text-xs text-slate-400 font-mono">Running Panchatattva & Astro-Vastu cross-correlation</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Engine Failure</h4>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {report && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Overall Energy Score</span>
                  <div className="text-4xl font-black text-emerald-400 mt-2">
                    {report.audit_summary?.overall_energy_score || 0}<span className="text-lg text-slate-500">/100</span>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 md:col-span-2">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Primary Conflicts</span>
                  <ul className="space-y-2">
                    {report.audit_summary?.primary_conflicts?.map((conflict: string, i: number) => (
                      <li key={i} className="text-sm text-amber-400 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{conflict}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Zone Analysis */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" /> Spatial Zone Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.zone_analysis?.map((zone: any, i: number) => (
                    <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white text-lg">{zone.zone}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                          zone.status.includes('Balanced') ? 'bg-emerald-500/20 text-emerald-400' :
                          zone.status.includes('Severe') ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>{zone.status}</span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1 mb-3">
                        <p><strong className="text-slate-300">Element:</strong> {zone.element}</p>
                        <p><strong className="text-slate-300">Activity:</strong> {zone.activity_present}</p>
                        <p><strong className="text-slate-300">Astro Sync:</strong> {zone.astro_correlation}</p>
                      </div>
                      <div className="text-xs bg-slate-900/50 p-2 rounded text-slate-300 border border-slate-700/50">
                        <span className="text-indigo-400 font-bold block mb-1">Impact:</span>
                        {zone.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remedies */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Prescribed Remedies
                </h3>
                <div className="space-y-3">
                  {report.remedies?.map((remedy: any, i: number) => (
                    <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col md:flex-row gap-4">
                      <div className="shrink-0 w-24">
                        <span className={`text-[10px] px-2 py-1 rounded font-black uppercase w-full block text-center mb-1 ${
                          remedy.urgency === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          remedy.urgency === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>{remedy.urgency}</span>
                        <div className="text-center text-xs font-bold text-slate-400 bg-slate-900 py-1 rounded border border-slate-700">
                          {remedy.zone}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-indigo-400 font-bold px-1.5 py-0.5 bg-indigo-500/10 rounded">{remedy.category}</span>
                          <h4 className="font-bold text-white text-sm">{remedy.remedy_title}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mb-2 leading-relaxed">{remedy.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Materials:</span>
                          {remedy.materials_needed?.map((m: string, j: number) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded border border-slate-600">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeaways */}
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3">Client Takeaways</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-2">Key Strengths</h4>
                    <ul className="space-y-1">
                      {report.client_report_takeaway?.key_strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-2">Immediate Actions</h4>
                    <ul className="space-y-1">
                      {report.client_report_takeaway?.immediate_actions?.map((s: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
