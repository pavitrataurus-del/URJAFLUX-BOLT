// src/components/numerology/CompatibilityPanel.tsx
import React, { useState } from "react";
import { Client } from "../../types/app";
import { calculateNumerology } from "./numerologyEngine";
import { Users, Heart, Star, CheckCircle, HelpCircle } from "lucide-react";

interface CompatibilityPanelProps {
  client: Client;
  clients: Client[];
}

export default function CompatibilityPanel({ client, clients }: CompatibilityPanelProps) {
  const [compareMode, setCompareMode] = useState<"dossier" | "manual">("dossier");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualDob, setManualDob] = useState("");
  const [relationshipType, setRelationshipType] = useState<"Partner" | "Child" | "Business Partner" | "Employee">("Partner");

  const clientResults = calculateNumerology(client.dob, client.name);

  // Derive target comparison data
  let targetName = "";
  let targetDob = "";
  let targetResults = null;

  if (compareMode === "dossier") {
    const targetClient = clients.find(c => c.id === selectedClientId);
    if (targetClient) {
      targetName = targetClient.name;
      targetDob = targetClient.dob || "";
      targetResults = calculateNumerology(targetDob, targetName);
    }
  } else {
    targetName = manualName;
    targetDob = manualDob;
    if (targetDob && targetName) {
      targetResults = calculateNumerology(targetDob, targetName);
    }
  }

  // Calculate compatibility score % based on mathematical overlap
  const getCompatibilityScoreAndReport = () => {
    if (!clientResults || !targetResults) return { score: 0, feedback: "Awaiting parameters..." };

    const lp1 = clientResults.lifePath.value;
    const lp2 = targetResults.lifePath.value;
    const dest1 = clientResults.destiny.value;
    const dest2 = targetResults.destiny.value;
    const su1 = clientResults.soulUrge.value;
    const su2 = targetResults.soulUrge.value;

    let matchCount = 0;
    let feedback = "";

    // LP relationship
    if (lp1 === lp2) {
      matchCount += 3;
    } else if (Math.abs(lp1 - lp2) === 2 || Math.abs(lp1 - lp2) === 4) {
      matchCount += 2; // Harmonious friends
    } else if ((lp1 === 1 && lp2 === 9) || (lp1 === 3 && lp2 === 7) || (lp1 === 5 && lp2 === 5)) {
      matchCount += 3; // Natural matches
    } else {
      matchCount += 1;
    }

    // Destiny relationship
    if (dest1 === dest2) matchCount += 2;
    if (su1 === su2) matchCount += 2;

    const maxPoints = 7;
    const score = Math.round((matchCount / maxPoints) * 100);

    // Context feedback
    if (relationshipType === "Partner") {
      if (score >= 80) {
        feedback = "Divine Match. Exceptional emotional resonance, deep spiritual attraction, and synchronized lifepath goals.";
      } else if (score >= 55) {
        feedback = "Complementary Alliance. Possess some frictional core numbers but hold ample warmth to develop long-term stability.";
      } else {
        feedback = "Karmic Growth Challenge. High lessons in patience. Requires adjustments to avoid purpose deviation.";
      }
    } else if (relationshipType === "Business Partner") {
      if (score >= 70) {
        feedback = "Highly Lucrative Team. Combined Destiny numbers trigger exceptional focus, strategic speed, and strong wealth attraction.";
      } else {
        feedback = "Requires Absolute Written Contracts. Strategic styles differ. One prefers systematic safety, while the other craves dynamic adventure.";
      }
    } else if (relationshipType === "Child") {
      feedback = "Beautiful Guidance. Guide your child's natural single-digit strengths with custom learning structures fitting their birthday archetype.";
    } else {
      // Employee
      if (score >= 65) {
        feedback = "Excellent Placement. Operates in deep harmony with organizational objectives, demonstrating high initiative and reliability.";
      } else {
        feedback = "Requires Directed Supervision. Fits specific specialized tasks. Not recommended for independent management.";
      }
    }

    return { score, feedback };
  };

  const { score, feedback } = getCompatibilityScoreAndReport();

  return (
    <div className="bg-white/40 border border-slate-200 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-950 pb-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            Alphanumeric Compatibility Matrix
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Analyze energetic resonance between primary client and prospective partners or employees.
          </p>
        </div>

        <select
          value={relationshipType}
          onChange={(e) => setRelationshipType(e.target.value as any)}
          className="bg-slate-50 border border-slate-850 text-slate-700 text-xs rounded px-3 py-1.5 focus:outline-none font-mono"
        >
          <option value="Partner">Spouse / Romantic Partner</option>
          <option value="Child">Child / Ward</option>
          <option value="Business Partner">Business Partner</option>
          <option value="Employee">Employee / Executive Hire</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parameters configuration */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded border border-slate-850 w-max">
            <button
              onClick={() => setCompareMode("dossier")}
              className={`px-3 py-1 rounded text-[10px] font-bold ${
                compareMode === "dossier" ? "bg-emerald-600 text-slate-900" : "text-slate-400"
              }`}
            >
              LINK CRM CLIENT
            </button>
            <button
              onClick={() => setCompareMode("manual")}
              className={`px-3 py-1 rounded text-[10px] font-bold ${
                compareMode === "manual" ? "bg-emerald-600 text-slate-900" : "text-slate-400"
              }`}
            >
              MANUAL SANDBOX
            </button>
          </div>

          {compareMode === "dossier" ? (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Comparison Dossier</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-850 text-slate-200 rounded px-3 py-2 focus:outline-none"
              >
                <option value="">-- Choose client --</option>
                {clients.filter(c => c.id !== client.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g., Jane Mary Doe"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-850 text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date of Birth</label>
                <input
                  type="date"
                  value={manualDob}
                  onChange={(e) => setManualDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-850 text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Primary client details quickcard */}
          <div className="p-3 bg-slate-50/40 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[9px] text-emerald-400 font-bold uppercase block">Comparing Primary Client</span>
            <p className="text-slate-200 font-bold">{client.name}</p>
            <p className="text-slate-400">Life Path: {clientResults?.lifePath.value || "Calculating..."} | Destiny: {clientResults?.destiny.value || "Calculating..."}</p>
          </div>
        </div>

        {/* Right Side: Analysis and Score output */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center p-5 bg-slate-50/60 border border-slate-200 rounded-xl gap-4 font-mono">
          {!targetResults ? (
            <div className="text-center space-y-1">
              <Users className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-400">Awaiting target details to commence analysis...</p>
            </div>
          ) : (
            <>
              {/* Radial score simulation */}
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#020617"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#4f46e5"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - score / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-slate-900">{score}%</span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">Harmony</span>
                </div>
              </div>

              {/* Side-by-side spec comparison table */}
              <div className="w-full text-xs space-y-2 border-t border-slate-200 pt-4">
                <div className="grid grid-cols-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-950">
                  <span>METRIC</span>
                  <span className="text-emerald-400">{client.name.split(" ")[0]}</span>
                  <span className="text-emerald-400">{targetName.split(" ")[0] || "Target"}</span>
                </div>

                <div className="grid grid-cols-3 py-1 border-b border-slate-950">
                  <span className="text-slate-400">Life Path:</span>
                  <span className="text-slate-200 font-bold">{clientResults?.lifePath.value}</span>
                  <span className="text-slate-200 font-bold">{targetResults.lifePath.value}</span>
                </div>

                <div className="grid grid-cols-3 py-1 border-b border-slate-950">
                  <span className="text-slate-400">Destiny:</span>
                  <span className="text-slate-200 font-bold">{clientResults?.destiny.value}</span>
                  <span className="text-slate-200 font-bold">{targetResults.destiny.value}</span>
                </div>

                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400">Soul Urge:</span>
                  <span className="text-slate-200 font-bold">{clientResults?.soulUrge.value}</span>
                  <span className="text-slate-200 font-bold">{targetResults.soulUrge.value}</span>
                </div>
              </div>

              {/* Report output box */}
              <div className="w-full p-3.5 bg-slate-50 border border-slate-200/60 rounded-lg text-xs leading-relaxed text-slate-700">
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-wider mb-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Consultant Analysis Verdict</span>
                </div>
                <p>{feedback}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
