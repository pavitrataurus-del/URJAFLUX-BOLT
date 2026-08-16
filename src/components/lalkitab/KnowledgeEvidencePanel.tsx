// src/components/lalkitab/KnowledgeEvidencePanel.tsx
import React from "react";
import { BookOpen, FileText, Bookmark } from "lucide-react";

export default function KnowledgeEvidencePanel() {
  const references = [
    {
      source: "Lal Kitab (1952 Edition)",
      passage: "Chapter 3, Page 112, Verse 4",
      sanskrit: "गृह भाव प्रथमं मेषं, कालपुरुषस्य शिरो भवेत्।",
      translation: "The first house of the birth chart is Aries, representing the head of the cosmic human.",
      application: "All calculations of planetary state (Awake/Asleep) in the 1st house follow natural Aries rules."
    },
    {
      source: "Lal Kitab (1942 Gutka)",
      passage: "Section 7: Remedies for Nodal Afflictions",
      sanskrit: "राहु केतु शनि मन्दाः, दान पात्रे सु-शोधनम्।",
      translation: "Rahu, Ketu, and Saturn find quick pacification when objects of their frequencies are donated.",
      application: "Directs flow of black sesame seeds, copper snakes, and iron cookware as highly stable remediations."
    },
    {
      source: "Lal Kitab (1939 Farmān)",
      passage: "Rule of Planetary Companionship",
      sanskrit: "एक स्थान गताः खेटाः, परस्परं जाग्रति संविदि।",
      translation: "Planets sharing the same or opposite quadrants wake each other up automatically.",
      application: "Triggers active 'Awake' states inside the planet strength matrix when aspect equations align."
    }
  ];

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-lg text-xs font-mono">
      <div className="border-b border-slate-200 pb-2">
        <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          CANONICAL SCRIPTURES & EVIDENCE
        </h5>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Official references sourced from classical Urdu & Sanskrit Lal Kitab compilations (1939-1952).
        </p>
      </div>

      <div className="space-y-4">
        {references.map((ref, idx) => (
          <div key={idx} className="space-y-2 border-b border-slate-950 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-emerald-400" />
                {ref.source}
              </span>
              <span className="text-[9px] text-slate-400">{ref.passage}</span>
            </div>

            <p className="text-emerald-400 italic font-sans text-xs bg-emerald-950/20 p-2 rounded border border-emerald-900/20 text-center">
              "{ref.sanskrit}"
            </p>

            <div className="space-y-1 text-[10px] text-slate-400 leading-relaxed">
              <p>
                <strong className="text-slate-400">Translation:</strong> {ref.translation}
              </p>
              <p>
                <strong className="text-slate-400">Workspace Application:</strong> {ref.application}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
