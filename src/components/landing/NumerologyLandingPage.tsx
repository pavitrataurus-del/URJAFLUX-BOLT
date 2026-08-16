import React from "react";
import { ArrowRight, Calculator, Sparkles, Hash, Activity, Heart, Briefcase } from "lucide-react";

interface NumerologyLandingPageProps {
  onStartAnalysis: () => void;
  onViewReports: () => void;
  onLearnMore?: () => void;
}

export default function NumerologyLandingPage({ onStartAnalysis, onViewReports, onLearnMore }: NumerologyLandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-900 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1537420327992-d6e192287183?auto=format&fit=crop&q=80&w=2000"
            alt="Cosmic Numerology"
            className="w-full h-full object-cover scale-105 animate-[pulse_20s_infinite_alternate] mix-blend-screen opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-slate-900/90 to-slate-900" />
          
          {/* Floating Numbers Decorative */}
          <div className="absolute top-1/4 left-1/4 text-6xl text-indigo-500/10 font-bold -rotate-12 blur-[1px]">7</div>
          <div className="absolute top-1/3 right-1/4 text-8xl text-purple-500/10 font-bold rotate-12 blur-[2px]">3</div>
          <div className="absolute bottom-1/4 left-1/3 text-9xl text-blue-500/5 font-bold rotate-45 blur-[3px]">9</div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-200 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Universal Frequencies</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-xl">
              Numerology <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Analysis Studio</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed font-light drop-shadow">
              Decode the vibrational impact of names, dates, and life cycles. Align personal frequencies with Universal abundance through advanced Chaldean and Pythagorean systems.
            </p>
          </div>

          {/* Consultant Portrait */}
          <div className="shrink-0 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
                alt="Pavitra Taurus"
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                <p className="text-white font-bold tracking-wide">Pavitra Taurus</p>
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest">Lead Numerologist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 space-y-24 relative z-20 text-slate-300">
        
        {/* Purpose & Problems */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">What is Numerology Studio?</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              A premium calculation engine for deep personality profiling and predictive life cycle analysis. It translates complex numeric vibrations into actionable, cinematic reports for high-end clientele.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <Hash className="w-5 h-5 text-indigo-400" /> Required Information
            </h3>
            <ul className="space-y-4">
              {[
                "Full Name (As per birth certificate)",
                "Current Name (If changed)",
                "Date of Birth",
                "Specific Questions or Goals"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Supported Analysis */}

        {/* Required Inputs */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Required Inputs</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-indigo-400 mb-2">1. Date of Birth</h3>
              <p className="text-slate-300 text-sm">Used to calculate Psychic, Destiny, and Personal Year numbers.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-indigo-400 mb-2">2. Full Legal Name</h3>
              <p className="text-slate-300 text-sm">Analyzed via Chaldean or Pythagorean grids for name vibration.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">What Will Be Analysed</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: "Life Path & Destiny", desc: "The core numbers defining life's ultimate purpose and direction." },
              { icon: Heart, title: "Soul & Personality", desc: "Inner desires versus outward perception by others." },
              { icon: Sparkles, title: "Pinnacles & Cycles", desc: "Predictive chapters of life and their inherent challenges." }
            ].map((Feature, i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-all duration-300 group">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Feature.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white mb-2">{Feature.title}</h4>
                <p className="text-slate-400 text-sm">{Feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits & Workflow */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800/80 p-10 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <h3 className="text-2xl font-bold text-white mb-8 relative z-10">Client Benefits</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {[
              { title: "Name Correction", desc: "Optimize vibrations for success" },
              { title: "Lucky Colors", desc: "Enhance personal aura" },
              { title: "Gemstones", desc: "Attract wealth and health" },
              { title: "Compatibility", desc: "Business and marriage alignment" }
            ].map((w, i) => (
              <div key={i} className="space-y-3 relative group">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-lg">{w.title}</h4>
                <p className="text-indigo-200/70 text-sm">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="py-20 flex flex-col items-center text-center space-y-8 border-t border-slate-800">
          <h2 className="text-4xl font-bold text-white tracking-tight">Decode the Universe</h2>
          <p className="text-slate-400 text-lg max-w-xl">
            Begin a new numerological analysis or review past cosmic insights for your clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onStartAnalysis}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-3 group"
            >
              Start Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onViewReports}
              className="px-10 py-4 bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 rounded-xl font-bold text-lg shadow-sm transition-all"
            >
              Previous Reports
            </button>
            {onLearnMore && (
              <button
                onClick={onLearnMore}
                className="px-6 py-4 text-indigo-400 hover:text-indigo-300 font-bold transition-all"
              >
                Learn More
              </button>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
