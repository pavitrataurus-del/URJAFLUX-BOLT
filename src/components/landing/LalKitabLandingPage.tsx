import React from "react";
import { ArrowRight, Compass, Sparkles, Star, ScrollText, Moon, Sun } from "lucide-react";

interface LalKitabLandingPageProps {
  onStartAnalysis: () => void;
  onViewReports: () => void;
}

export default function LalKitabLandingPage({ onStartAnalysis, onViewReports }: LalKitabLandingPageProps) {
  return (
    <div className="min-h-screen bg-[#1c140d] animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=2000"
            alt="Ancient Temple Ambience"
            className="w-full h-full object-cover scale-105 animate-[pulse_20s_infinite_alternate] mix-blend-overlay opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1708]/80 via-[#1c140d]/90 to-[#1c140d]" />
          
          {/* Subtle Planetary Graphics */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 border border-orange-500/10 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-rose-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-orange-200 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Classical Astrological Engine</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-xl">
              Lal Kitab <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Analysis Studio</span>
            </h1>
            <p className="text-lg md:text-xl text-orange-100/70 max-w-2xl leading-relaxed font-light drop-shadow">
              Navigate the karmic landscape. Identify planetary strengths and afflictions in the birth chart to prescribe accessible, everyday remedies based on ancient wisdom.
            </p>
          </div>

          {/* Consultant Portrait */}
          <div className="shrink-0 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
                alt="Pavitra Taurus"
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 sepia-[30%] transition-all duration-700"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1c140d]/90 to-transparent p-4">
                <p className="text-white font-bold tracking-wide">Pavitra Taurus</p>
                <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest">Lead Astrologer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 space-y-24 relative z-20 text-orange-100/70">
        
        {/* Purpose & Problems */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">The Purpose of Lal Kitab</h2>
            <p className="text-orange-100/70 text-lg leading-relaxed">
              Unlike traditional Parashari astrology, Lal Kitab offers quick, practical, and highly effective remedies without the need for expensive rituals. This engine automates the complex chart generation and rule-matching process.
            </p>
          </div>
          <div className="bg-[#2a1708]/50 backdrop-blur-md p-8 rounded-3xl border border-orange-900/50 shadow-2xl">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <Compass className="w-5 h-5 text-orange-400" /> Required Birth Details
            </h3>
            <ul className="space-y-4">
              {[
                "Exact Date of Birth",
                "Accurate Time of Birth (AM/PM)",
                "Place of Birth (City, Country)",
                "Current Location (for Gochar/Transit)"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5 border border-orange-500/30">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                  </div>
                  <span className="text-orange-100/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Supported Analysis */}

        {/* Required Inputs */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Required Inputs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-orange-400 mb-2">1. Date of Birth</h3>
              <p className="text-slate-300 text-sm">Exact Gregorian calendar date of birth.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-orange-400 mb-2">2. Exact Time of Birth</h3>
              <p className="text-slate-300 text-sm">Accurate birth time to determine the exact Ascendant and house cusps.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-orange-400 mb-2">3. Place of Birth</h3>
              <p className="text-slate-300 text-sm">City or coordinates to adjust for timezone and latitude/longitude.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Analysis Engines</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Star, title: "Planet Analysis", desc: "Detailed breakdown of all 9 planetary positions and their dignities." },
              { icon: ScrollText, title: "Dasha & Antardasha", desc: "Timeline of planetary periods affecting the client's current life stage." },
              { icon: Moon, title: "Gochar (Transits)", desc: "Current planetary movements over the natal chart for immediate predictions." },
              { icon: Sun, title: "Remedies", desc: "Customized, practical Lal Kitab remedies for afflicted planets." }
            ].map((Feature, i) => (
              <div key={i} className="bg-[#2a1708]/50 backdrop-blur p-6 rounded-2xl border border-orange-900/50 hover:bg-[#2a1708] transition-all duration-300 group">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <Feature.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white mb-2">{Feature.title}</h4>
                <p className="text-orange-100/50 text-sm">{Feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits & Workflow */}
        <div className="bg-gradient-to-br from-[#3b1c0a] to-[#1c140d] p-10 rounded-3xl border border-orange-900/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <h3 className="text-2xl font-bold text-white mb-8 relative z-10">Client Benefits</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {[
              { title: "Immediate Relief", desc: "Practical everyday remedies" },
              { title: "Karmic Insight", desc: "Understand ancestral debts" },
              { title: "Wealth Blockages", desc: "Clear financial stagnation" },
              { title: "Health & Harmony", desc: "Balance planetary afflictions" }
            ].map((w, i) => (
              <div key={i} className="space-y-3 relative group">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 border border-orange-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-lg">{w.title}</h4>
                <p className="text-orange-200/50 text-sm">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="py-20 flex flex-col items-center text-center space-y-8 border-t border-[#2a1708]">
          <h2 className="text-4xl font-bold text-white tracking-tight">Unlock Ancient Wisdom</h2>
          <p className="text-orange-100/60 text-lg max-w-xl">
            Generate a new Lal Kitab Kundli or review previous astrological consultations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onStartAnalysis}
              className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-3 group"
            >
              Start Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onViewReports}
              className="px-10 py-4 bg-[#2a1708] text-white border border-orange-900/50 hover:bg-[#3b1c0a] rounded-xl font-bold text-lg shadow-sm transition-all"
            >
              View Reports
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}
