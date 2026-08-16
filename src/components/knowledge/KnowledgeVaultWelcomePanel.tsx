import React from "react";
import {
  BookOpen,
  Upload,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  Cloud,
  Brain,
} from "lucide-react";
import type { VaultStats } from "../../services/knowledgeVaultService";

interface KnowledgeVaultWelcomePanelProps {
  stats: VaultStats | null;
  onNavigate: (tab: "UPLOAD_PIPELINE" | "DOCUMENTS" | "RULES_EXPLORER") => void;
}

const STEPS = [
  {
    icon: Upload,
    title: "1. Upload karein",
    text: "PDF, Word (.docx), ya text file upload karo — cloud par safe store hoti hai.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    icon: Sparkles,
    title: "2. Text nikalein (OCR)",
    text: "System pages padhta hai — Sanskrit, Hindi, English text extract hota hai.",
    color: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    icon: ShieldCheck,
    title: "3. Rules bante hain",
    text: "Har page se Vastu rules auto ban kar vault mein save hote hain.",
    color: "text-violet-600 bg-violet-50 border-violet-100",
  },
  {
    icon: Brain,
    title: "4. Analysis mein use",
    text: "Yeh rules aapke client reports aur Vastu analysis mein kaam aate hain.",
    color: "text-amber-700 bg-amber-50 border-amber-100",
  },
];

export const KnowledgeVaultWelcomePanel: React.FC<KnowledgeVaultWelcomePanelProps> = ({
  stats,
  onNavigate,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 overflow-hidden shadow-sm">
      {/* Hero */}
      <div className="px-6 pt-8 pb-6 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
              URJAFLUX AI OS · Knowledge Vault
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              Aapki digital granthalay — books se rules, rules se reports
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Yahan aap Vastu shastras aur treatise PDF, Word, ya text files upload karte ho. System unse readable text
              nikalta hai, rules banata hai, aur Firestore + cloud par permanent save karta hai.
              Baad mein yahi knowledge client analysis aur reports ke liye use hoti hai.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate("UPLOAD_PIPELINE")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Nayi book upload
            </button>
            <button
              type="button"
              onClick={() => onNavigate("DOCUMENTS")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-sm font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Meri books
            </button>
            <button
              type="button"
              onClick={() => onNavigate("RULES_EXPLORER")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              Saare rules
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-6 py-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-slate-400" />
          Platform kaise kaam karta hai
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`rounded-xl border p-4 space-y-2 ${step.color}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-semibold">{step.title}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{step.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live snapshot */}
      {stats && (
        <div className="px-6 pb-6">
          <div className="rounded-xl bg-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Aaj vault mein</p>
              <p className="text-sm mt-1">
                <span className="font-bold text-emerald-400">{stats.totalDocuments}</span> books ·{" "}
                <span className="font-bold text-emerald-400">{stats.approvedRules}</span> rules ·{" "}
                <span className="font-bold text-slate-300">
                  {((stats.storageUsageBytes || 0) / 1024 / 1024).toFixed(1)} MB
                </span>{" "}
                storage
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("UPLOAD_PIPELINE")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Upload pipeline kholo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
