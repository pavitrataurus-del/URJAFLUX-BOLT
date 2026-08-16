// src/components/numerology/BusinessNameStudio.tsx
import React, { useState } from "react";
import { Client } from "../../types/app";
import { calculateNumerology, getLettersBreakdown, LUCKY_FACTORS } from "./numerologyEngine";
import { Briefcase, Calendar, Star, Compass, Plus, Sliders, Check, Sparkles } from "lucide-react";

interface BusinessNameStudioProps {
  client: Client;
}

interface BusinessNameProposal {
  id: string;
  name: string;
  launchDate: string;
  system: "Pythagorean" | "Chaldean";
}

export default function BusinessNameStudio({ client }: BusinessNameStudioProps) {
  const [proposals, setProposals] = useState<BusinessNameProposal[]>([
    { id: "1", name: "Urjaflux Solutions", launchDate: "2026-08-08", system: "Chaldean" },
    { id: "2", name: "Vedic Grid", launchDate: "2026-09-09", system: "Pythagorean" }
  ]);

  const [inputName, setInputName] = useState("");
  const [inputLaunchDate, setInputLaunchDate] = useState("");
  const [inputSystem, setInputSystem] = useState<"Pythagorean" | "Chaldean">("Chaldean");

  const clientResults = calculateNumerology(client.dob, client.name);

  const handleAddProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    setProposals([
      ...proposals,
      {
        id: Date.now().toString(),
        name: inputName,
        launchDate: inputLaunchDate || "2026-10-10",
        system: inputSystem
      }
    ]);
    setInputName("");
    setInputLaunchDate("");
  };

  const handleRemoveProposal = (id: string) => {
    setProposals(proposals.filter(p => p.id !== id));
  };

  // Evaluate a proposed business name and score/rank it
  const evaluateProposal = (prop: BusinessNameProposal) => {
    const breakdown = getLettersBreakdown(prop.name, prop.system);
    const brandVal = breakdown.reduced;

    // Launch date calculations
    let launchVal = 5; // default
    if (prop.launchDate) {
      const dateParts = prop.launchDate.split("-");
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[2], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[0], 10);
        const total = day + month + year;
        launchVal = total % 9 || 9;
      }
    }

    // Alignment with Client
    let clientLP = clientResults?.lifePath.value || 1;
    let rank = "B";
    let rankingScore = 60;
    let alignmentText = "Neutral correlation with client.";

    const diff = Math.abs(brandVal - clientLP);
    if (brandVal === clientLP) {
      rankingScore = 95;
      rank = "A+";
      alignmentText = "Absolute Divine Mirror! Fits client's exact lifepath.";
    } else if (diff === 2 || diff === 4 || diff === 6) {
      rankingScore = 85;
      rank = "A";
      alignmentText = "Highly compatible harmony, boosting financial flow.";
    } else if (brandVal === 1 || brandVal === 5 || brandVal === 9) {
      rankingScore = 75;
      rank = "B+";
      alignmentText = "Solid growth vibration suitable for modern enterprise.";
    } else if (brandVal === 8) {
      rankingScore = 50;
      rank = "C";
      alignmentText = "Requires intense work & extreme organization under Shani.";
    }

    const factors = LUCKY_FACTORS[brandVal] || LUCKY_FACTORS[1];

    return {
      brandVal,
      launchVal,
      rankingScore,
      rank,
      alignmentText,
      factors
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white/40 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Vedic Brand & Business Name Studio
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Evaluate branding vibrations, select high-resonance launch timelines, and score prospective company names.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Add name proposal */}
        <form onSubmit={handleAddProposal} className="lg:col-span-4 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-4 font-mono text-xs">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-950 pb-2">
            Submit Proposed Brand
          </h4>

          <div className="space-y-1">
            <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Business Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Zenith Altech"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-850 text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Target Launch Date</label>
            <input
              type="date"
              value={inputLaunchDate}
              onChange={(e) => setInputLaunchDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-850 text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Gematria standard</label>
            <select
              value={inputSystem}
              onChange={(e) => setInputSystem(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-850 text-slate-200 rounded px-3 py-2 focus:outline-none"
            >
              <option value="Chaldean">Chaldean (Recommended for Business)</option>
              <option value="Pythagorean">Pythagorean (Standard Western)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded font-bold cursor-pointer text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>ADD TO EVALUATOR</span>
          </button>
        </form>

        {/* Right column: Side by side proposals evaluation list */}
        <div className="lg:col-span-8 space-y-4">
          {proposals.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 bg-white/10 rounded-xl">
              <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-mono text-slate-400">No brand proposals registered in the sandbox yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {proposals.map((prop) => {
                const evalData = evaluateProposal(prop);
                return (
                  <div key={prop.id} className="p-5 bg-slate-50/60 border border-slate-200 rounded-xl relative flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{prop.name}</h5>
                          <span className="text-[8px] bg-white border border-slate-850 px-1.5 py-0.2 rounded text-slate-400 uppercase tracking-widest mt-0.5 inline-block">
                            {prop.system}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-emerald-400">{evalData.rank}</span>
                          <span className="text-[8.5px] text-slate-400 block uppercase font-medium">Rank</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-200 pt-3 text-[10.5px]">
                        <p className="flex justify-between">
                          <span className="text-slate-400 uppercase">Brand Vibration:</span>
                          <span className="text-emerald-400 font-bold">{evalData.brandVal}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400 uppercase">Launch Alignment:</span>
                          <span className="text-emerald-400 font-bold">{evalData.launchVal}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400 uppercase">Lucky Color:</span>
                          <span className="text-slate-700 font-bold">{evalData.factors.colors[0]}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400 uppercase">Lucky Day:</span>
                          <span className="text-slate-700 font-bold">{evalData.factors.days[0]}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400 uppercase">Lucky Direction:</span>
                          <span className="text-slate-700">{evalData.factors.directions[0]}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400 uppercase">Launch Date:</span>
                          <span className="text-slate-400">{prop.launchDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-850 rounded text-[9.5px] text-emerald-300 flex items-start gap-1.5 leading-relaxed">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{evalData.alignmentText}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveProposal(prop.id)}
                      className="text-[9.5px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer text-left font-bold"
                    >
                      REMOVE BRAND
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
