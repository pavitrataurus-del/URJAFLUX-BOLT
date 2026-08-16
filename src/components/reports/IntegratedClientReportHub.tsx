import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Lock,
  User,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Download,
} from "lucide-react";
import type { ReportAccessTier } from "../../core/commercial/reportAccessPolicy";
import { FREE_TIER_LIMITS } from "../../core/commercial/reportAccessPolicy";
import { generateIntegratedClientReport } from "../../core/commercial/integratedClientReportService";
import type { IReportObjectModel } from "../../core/reports/rpe/types/rpe.types";

export const IntegratedClientReportHub: React.FC = () => {
  const [clientName, setClientName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accessTier, setAccessTier] = useState<ReportAccessTier>("CONSULTANT");
  const [rom, setRom] = useState<IReportObjectModel | null>(null);
  const [meta, setMeta] = useState<{ score?: number; doshasShown?: number; remediesShown?: number; upsell?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!clientName.trim()) {
      setError("Client name is required.");
      return;
    }
    setError(null);
    try {
      const result = generateIntegratedClientReport({
        clientName: clientName.trim(),
        dateOfBirth: dateOfBirth || undefined,
        birthTime: birthTime || undefined,
        birthPlace: birthPlace || undefined,
        consultantCompanyName: companyName || undefined,
        accessTier,
      });
      setRom(result.rom);
      setMeta({
        score: result.moduleInsights.integratedScore,
        doshasShown: result.accessMetadata.doshasShown,
        remediesShown: result.accessMetadata.remediesShown,
        upsell: result.accessMetadata.upsellMessage,
      });
    } catch (e: any) {
      setError(e?.message || "Report generation failed.");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border border-indigo-800/40 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold font-mono text-emerald-300">Integrated Client Report Hub</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl">
          Vastu + Lal Kitab + Numerology in one report. Consultant generates and delivers to their client.
          Free tier: score + {FREE_TIER_LIMITS.maxDoshasShown} doshas + {FREE_TIER_LIMITS.maxRemediesShown} remedy (Vastu only).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold font-mono text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            Client Profile
          </h3>

          <label className="block text-xs font-mono text-slate-600">
            Client Name *
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Client full name"
            />
          </label>

          <label className="block text-xs font-mono text-slate-600">
            <Calendar className="w-3 h-3 inline mr-1" />
            Date of Birth
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-mono text-slate-600">
            <Clock className="w-3 h-3 inline mr-1" />
            Birth Time (optional)
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-mono text-slate-600">
            <MapPin className="w-3 h-3 inline mr-1" />
            Birth Place (optional)
            <input
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="City, State"
            />
          </label>

          <label className="block text-xs font-mono text-slate-600">
            <Building2 className="w-3 h-3 inline mr-1" />
            Consultant / Company (white-label)
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Your consultancy name"
            />
          </label>

          <label className="block text-xs font-mono text-slate-600">
            Report Access Tier
            <select
              value={accessTier}
              onChange={(e) => setAccessTier(e.target.value as ReportAccessTier)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="FREE">Free Visitor Preview</option>
              <option value="PAID_ONE_TIME">Paid One-Time Client</option>
              <option value="CONSULTANT">Consultant Delivery</option>
              <option value="FOUNDER">Founder</option>
            </select>
          </label>

          {error && <p className="text-xs text-red-600 font-mono">{error}</p>}

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Integrated Report
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {meta && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">INTEGRATED SCORE</div>
                <div className="text-2xl font-bold text-emerald-400">{meta.score}/100</div>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">DOSHAS SHOWN</div>
                <div className="text-2xl font-bold text-amber-400">{meta.doshasShown}</div>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">REMEDIES SHOWN</div>
                <div className="text-2xl font-bold text-blue-400">{meta.remediesShown}</div>
              </div>
            </div>
          )}

          {meta?.upsell && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs font-mono text-amber-900 flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              {meta.upsell}
            </div>
          )}

          {!rom && (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs">
              Enter client details and generate to preview integrated report sections.
            </div>
          )}

          {rom && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold font-mono text-slate-900">{rom.title}</h3>
                  <p className="text-xs text-slate-500 font-mono">{rom.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  {rom.reportTypeId}
                </div>
              </div>

              {rom.sections.map((section) => (
                <div
                  key={section.sectionId}
                  className={`border rounded-xl p-4 space-y-2 ${
                    section.isLocked ? "border-amber-200 bg-amber-50/50" : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold font-mono text-slate-800">{section.title}</h4>
                    {section.isLocked && (
                      <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        LOCKED
                      </span>
                    )}
                  </div>
                  {section.components.map((comp) =>
                    comp.blocks.map((block, bi) => (
                      <div key={`${comp.componentId}-${bi}`} className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
                        {block.elements?.map((el: any) => el.textContent || el.content || "").join("\n")}
                      </div>
                    ))
                  )}
                </div>
              ))}

              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50"
                onClick={() => window.print()}
              >
                <Download className="w-3.5 h-3.5" />
                Print / Save as PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
