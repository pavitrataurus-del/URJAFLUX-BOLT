// src/components/numerology/ExecutionTimeline.tsx
import React from "react";
import { Workflow, CheckCircle, Clock, BookOpen, Cpu, Settings, FileText, Brain } from "lucide-react";

interface ExecutionTimelineProps {
  currentStep: number; // 1 to 5
}

export default function ExecutionTimeline({ currentStep = 4 }: ExecutionTimelineProps) {
  const steps = [
    {
      id: 1,
      label: "Knowledge Ingestion",
      desc: "Scriptures & Canons",
      icon: BookOpen,
      status: currentStep >= 1 ? "Complete" : "Pending"
    },
    {
      id: 2,
      label: "Rule Engine",
      desc: "Master Rules & Gematria",
      icon: Settings,
      status: currentStep >= 2 ? "Complete" : "Pending"
    },
    {
      id: 3,
      label: "Calculations",
      desc: "Alphanumeric Reductions",
      icon: Cpu,
      status: currentStep >= 3 ? "Complete" : "Pending"
    },
    {
      id: 4,
      label: "Interpretation",
      desc: "Wisdom Guidelines",
      icon: Brain,
      status: currentStep >= 4 ? "Complete" : "Pending"
    },
    {
      id: 5,
      label: "Report Compilation",
      desc: "Consultant Dossier ready",
      icon: FileText,
      status: currentStep >= 5 ? "Complete" : "Pending"
    }
  ];

  return (
    <div className="bg-white/40 border border-slate-200 rounded-xl p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-950 pb-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Workflow className="w-4 h-4 text-emerald-400" />
          Orchestration Pipeline Status
        </h4>
        <span className="text-[9px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded uppercase font-bold">
          System State: Active
        </span>
      </div>

      {/* Grid of steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                isActive
                  ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-300"
                  : isCompleted
                  ? "bg-slate-50/80 border-slate-200 text-slate-400"
                  : "bg-slate-50/20 border-slate-950 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded ${
                  isActive
                    ? "bg-emerald-600 text-slate-900"
                    : isCompleted
                    ? "bg-emerald-950/20 border border-emerald-900/30 text-emerald-400"
                    : "bg-white text-slate-400"
                }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-[10.5px] truncate ${isActive ? "text-emerald-300" : isCompleted ? "text-slate-200" : "text-slate-400"}`}>
                    {step.label}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate leading-snug">{step.desc}</p>
                </div>
              </div>

              <div>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isActive ? (
                  <Clock className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-700 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
