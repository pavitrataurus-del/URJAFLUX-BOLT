// src/components/lalkitab/ExecutionTimeline.tsx
import React from "react";
import { BookOpen, ShieldCheck, Cpu, Brain, FileText } from "lucide-react";

interface ExecutionTimelineProps {
  currentStep: number; // 1 to 5
}

export default function ExecutionTimeline({ currentStep }: ExecutionTimelineProps) {
  const steps = [
    { id: 1, label: "Knowledge", sub: "Canon Loaded", icon: BookOpen },
    { id: 2, label: "Rules", sub: "Rules Evaluated", icon: ShieldCheck },
    { id: 3, label: "Calculations", sub: "Engine Resolved", icon: Cpu },
    { id: 4, label: "Interpretation", sub: "Wisdom Synthesized", icon: Brain },
    { id: 5, label: "Report", sub: "Report Compiled", icon: FileText }
  ];

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 shadow-lg">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          Lal Kitab Workflow Orchestrator Pipeline
        </span>
        <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
          Status: {currentStep === 5 ? "Compiled & Finalized" : "Running Analytical Pipeline"}
        </span>
      </div>

      {/* Horizontal Pipeline Step layout */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep >= step.id;
          const isActive = currentStep === step.id;

          return (
            <div 
              key={step.id}
              className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${
                isActive 
                  ? "bg-emerald-600/20 border-emerald-500 text-slate-900 shadow-md animate-pulse" 
                  : isDone 
                  ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" 
                  : "bg-white/20 border-slate-200 text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-md ${
                isActive 
                  ? "bg-emerald-600 text-slate-900" 
                  : isDone 
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30" 
                  : "bg-slate-50 text-slate-600 border border-slate-200"
              }`}>
                <Icon className="w-4 h-4 shrink-0" />
              </div>

              <div>
                <span className="font-bold block text-[11px] leading-tight uppercase">
                  {step.label}
                </span>
                <span className={`text-[9px] block ${
                  isActive ? "text-emerald-400" : isDone ? "text-emerald-500" : "text-slate-600"
                }`}>
                  {step.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
