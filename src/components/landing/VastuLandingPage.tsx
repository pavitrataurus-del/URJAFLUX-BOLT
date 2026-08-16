import React from "react";
import { ArrowRight, Compass, Maximize, Ruler, Home, Box, Sparkles, Building, Briefcase } from "lucide-react";

interface VastuLandingPageProps {
  onStartProject: () => void;
  onViewProjects: () => void;
}

export default function VastuLandingPage({ onStartProject, onViewProjects }: VastuLandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-900 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
            alt="Luxury Architecture"
            className="w-full h-full object-cover scale-105 animate-[pulse_20s_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-50" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Premium Cinematic Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-xl">
              Architecture & <br className="hidden md:block" />
              <span className="text-emerald-400">Vastu Studio</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed font-light drop-shadow">
              A high-end spatial intelligence engine that bridges ancient Vastu Shastra principles with modern architectural precision. Elevate your design workflow with AI-driven spatial analysis.
            </p>
          </div>

          {/* Consultant Portrait */}
          <div className="shrink-0 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
                alt="Pavitra Taurus"
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                <p className="text-white font-bold tracking-wide">Pavitra Taurus</p>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Lead Consultant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 space-y-24 relative z-20">
        
        {/* Purpose & Problems */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">What is the Vastu Studio?</h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              An enterprise-grade analysis tool designed for professional Vastu consultants and architects. It eliminates the manual friction of analyzing complex floor plans, determining accurate orientations, and applying classical Vastu grids.
            </p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 shadow-xl shadow-2xl">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <Box className="w-5 h-5 text-emerald-500" /> What Problems It Solves
            </h3>
            <ul className="space-y-4">
              {[
                "Inaccurate manual compass alignments",
                "Complex grid division errors (16 zones / 45 deities)",
                "Time-consuming drafting and reporting",
                "Disconnect between modern architecture and ancient principles"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/200" />
                  </div>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Benefits & Workflow */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">Who should use it?</h2>
            <p className="text-slate-300 leading-relaxed">
              Built exclusively for premium consultants, visionary architects, and spatial energy researchers who demand precision, automation, and a cinematic presentation layer for their elite clientele.
            </p>
            <div className="pt-4 space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 shadow-sm flex items-center gap-4">
                <Briefcase className="w-8 h-8 text-emerald-500" />
                <div>
                  <h4 className="font-bold text-white">Premium Consultants</h4>
                  <p className="text-sm text-slate-400">Deliver high-end reports</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-900 to-teal-900 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-emerald-500/200/20 rounded-full blur-3xl"></div>
            <h3 className="text-2xl font-bold mb-8 relative z-10">The Vastu Workflow</h3>
            <div className="grid sm:grid-cols-4 gap-6 relative z-10">
              {[
                { step: "01", title: "Upload", desc: "CAD or Floor Plan" },
                { step: "02", title: "Define", desc: "Center & Orientation" },
                { step: "03", title: "Analyze", desc: "16 Zones & Deities" },
                { step: "04", title: "Report", desc: "Cinematic Dossier" }
              ].map((w, i) => (
                <div key={i} className="space-y-3 relative group">
                  <div className="text-emerald-400 font-mono text-lg font-bold">{w.step}</div>
                  <h4 className="font-bold text-white text-lg">{w.title}</h4>
                  <p className="text-emerald-100/70 text-sm">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supported Analysis */}

        {/* Required Inputs */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Required Inputs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">1. Floor Plan</h3>
              <p className="text-slate-300 text-sm">A PDF, PNG, or JPG of the architectural floor plan to scale.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">2. Compass Alignment</h3>
              <p className="text-slate-300 text-sm">Accurate magnetic North orientation and exact degree deviations.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">3. Property Dimensions</h3>
              <p className="text-slate-300 text-sm">Overall plot and built-up area to calculate accurate spatial grids.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Supported Analysis Engines</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Compass, title: "16 Zones", desc: "Maha Vastu zones and elemental balancing." },
              { icon: Maximize, title: "45 Deities", desc: "Energy field extraction and placement mapping." },
              { icon: Ruler, title: "Bar Chart", desc: "Strength and weakness of each zone." },
              { icon: Building, title: "Remedies", desc: "Metals, colors, and spatial adjustments." }
            ].map((Feature, i) => (
              <div key={i} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/200 group-hover:text-white transition-all">
                  <Feature.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white mb-2">{Feature.title}</h4>
                <p className="text-slate-400 text-sm">{Feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="py-20 flex flex-col items-center text-center space-y-8 border-t border-slate-700/50">
          <h2 className="text-4xl font-bold text-white tracking-tight">Ready to begin the analysis?</h2>
          <p className="text-slate-400 text-lg max-w-xl">
            Enter the studio to start mapping your first floor plan, or review your previous spatial research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onStartProject}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 group"
            >
              Start New Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onViewProjects}
              className="px-10 py-4 bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-900 rounded-xl font-bold text-lg shadow-sm transition-all"
            >
              View Existing Projects
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}
