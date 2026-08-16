import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Layers,
  Sparkles,
  Shield,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { IReportTemplate, ReportType, UserRole, LanguageCode } from '../../core/reports/ReportTypes';
import { ReportTemplateEngine } from '../../core/reports/ReportTemplateEngine';
import { ReportRegistry } from '../../core/reports/ReportRegistry';

interface ReportTemplateLibraryProps {
  userRole: UserRole;
  onReportCreated: (newReportId: string) => void;
}

export const ReportTemplateLibrary: React.FC<ReportTemplateLibraryProps> = ({
  userRole,
  onReportCreated
}) => {
  const templates = ReportTemplateEngine.getInstance().getAllTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<IReportTemplate>(templates[0]);
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('en');

  const handleInstantiate = (template: IReportTemplate) => {
    const registry = ReportRegistry.getInstance();
    const newReport = registry.createReport(
      template.recommendedReportType,
      targetLanguage,
      template.templateId,
      'PROP-001',
      'UF-PRJ-2026-081',
      'Lead Enterprise Architect',
      userRole
    );
    onReportCreated(newReport.id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Enterprise Report Template Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a reusable, pre-configured report structure to instantly generate verified enterprise reports from upstream domain telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Target Language:</label>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTargetLanguage('en')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                targetLanguage === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English (EN)
            </button>
            <button
              onClick={() => setTargetLanguage('hi')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                targetLanguage === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी (HI)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map(tpl => (
          <div
            key={tpl.templateId}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 group transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  {tpl.recommendedReportType.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {tpl.defaultSectionsKeys.length} Sections
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                {tpl.templateName}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {tpl.description}
              </p>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 block">Default Sections:</span>
                <div className="flex flex-wrap gap-1">
                  {tpl.defaultSectionsKeys.map(k => (
                    <span key={k} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {k.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleInstantiate(tpl)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Report from Template</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
