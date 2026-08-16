// src/components/lalkitab/ReportPreviewPanel.tsx
import React, { useState, useEffect } from "react";
import { Client } from "../../types/app";
import { calculateLalKitab } from "./lalkitabEngine";
import { FileText, Printer, Globe, ShieldCheck, Heart, Sparkles, Award } from "lucide-react";

interface ReportPreviewPanelProps {
  client: Client;
}

const reportTranslations = {
  English: {
    title: "ENTERPRISE LAL KITAB ASTRO REPORT",
    subtitle: "PREPARED FOR URJAFLUX INDUSTRIAL CONSTITUTIONS",
    clientDetails: "Client Identity Coordinates",
    name: "Client Name",
    dob: "Date of Birth",
    tob: "Time of Birth",
    pob: "Place of Birth",
    gender: "Gender Profile",
    occupation: "Current Occupation",
    maritalStatus: "Marital Status",
    planets: "Planetary House placements & Frequencies",
    yogas: "Active Astrological Yogas & Raj Yogas",
    doshas: "Active Karmic Afflictions (Doshas)",
    gemstones: "Aura Crystal & Gemstone Recommendations",
    donations: "Charitable Purification (Donations)",
    lifestyle: "Lifestyle & Daily Conscious Practices",
    warning: "Astrological Warning Note"
  },
  Hindi: {
    title: "व्यावसायिक लाल किताब ज्योतिषीय विश्लेषण रिपोर्ट",
    subtitle: "ऊर्जाफ्लक्स औद्योगिक और कॉर्पोरेट समाधान हेतु तैयार",
    clientDetails: "क्लाइंट पहचान और जन्म विवरण",
    name: "क्लाइंट का नाम",
    dob: "जन्म तिथि",
    tob: "जन्म समय",
    pob: "जन्म स्थान",
    gender: "लिंग प्रोफाइल",
    occupation: "वर्तमान व्यवसाय",
    maritalStatus: "वैवाहिक स्थिति",
    planets: "ग्रहों की घर स्थिति और कंपन शक्ति",
    yogas: "सक्रिय राज योग और ज्योतिषीय योग",
    doshas: "सक्रिय कर्मिक दोष और बाधाएं",
    gemstones: "आभा-चक्र क्रिस्टल और रत्न धारण निर्देश",
    donations: "दान और कर्म शुद्धि योजना",
    lifestyle: "दैनिक जीवनशैली और जागरूक व्यवहार नियम",
    warning: "ज्योतिषीय चेतावनी नोट"
  }
};

export default function ReportPreviewPanel({ client }: ReportPreviewPanelProps) {
  // Determine language default
  const clientPreferredLang = client.preferredLanguage || "English";
  const defaultLang = (clientPreferredLang === "Hindi" || clientPreferredLang === "hindi") ? "Hindi" : "English";
  
  const [lang, setLang] = useState<"English" | "Hindi">(defaultLang);

  // Sync state if client preferred language shifts
  useEffect(() => {
    setLang(defaultLang);
  }, [clientPreferredLang, defaultLang]);

  const result = calculateLalKitab(client.dob || "", client.name, client.birthTime || "");

  if (!result) {
    return (
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center py-12 text-slate-400 font-mono text-xs">
        No client birth details available to compile the report. Initialize client DOB first.
      </div>
    );
  }

  const t = reportTranslations[lang];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6 shadow-xl max-w-full">
      {/* Configuration row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            LAL KITAB REPORT COMPILE CONSOLE
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            English and Hindi generation supported. Manual translation override is active.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Language selector */}
          <div className="flex bg-white p-1 border border-slate-850 rounded-lg">
            {["English", "Hindi"].map((opt) => (
              <button
                key={opt}
                onClick={() => setLang(opt as any)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  lang === opt
                    ? "bg-emerald-600 text-slate-900"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold hover:text-slate-900 transition-all cursor-pointer text-[10px]"
          >
            <Printer className="w-3.5 h-3.5" />
            PRINT REPORT
          </button>
        </div>
      </div>

      {/* Actual Printable Report Sheet */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 font-mono text-xs text-slate-700 shadow-inner select-text print:bg-white print:text-black print:p-0">
        
        {/* Report Brand Header */}
        <div className="text-center space-y-2 border-b-2 border-slate-200 pb-5">
          <h2 className="text-sm md:text-base font-bold text-emerald-400 tracking-widest uppercase">
            {t.title}
          </h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">
            {t.subtitle}
          </p>
          <div className="text-[9px] text-slate-600 flex justify-center gap-4">
            <span>Dossier: #{client.id.slice(0, 6).toUpperCase()}</span>
            <span>Ref: URJA-LAL-2026</span>
            <span>Compiled: 19 July 2026</span>
          </div>
        </div>

        {/* 1. Client Identity */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-200 pb-1 uppercase tracking-wider">
            1. {t.clientDetails}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">{t.name}</span>
              <span className="text-slate-700 font-bold">{client.name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">{t.dob}</span>
              <span className="text-slate-700">{client.dob}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">{t.tob}</span>
              <span className="text-slate-700">{client.birthTime || "12:00 PM"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">{t.pob}</span>
              <span className="text-slate-700 truncate block">{client.birthPlace || "New Delhi"}</span>
            </div>
          </div>
        </div>

        {/* 2. Planets Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-200 pb-1 uppercase tracking-wider">
            2. {t.planets}
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-white text-slate-400 text-[9px] uppercase border-b border-slate-850">
                  <th className="p-2 font-bold">Planet</th>
                  <th className="p-2 font-bold">House Position</th>
                  <th className="p-2 font-bold">Sign / Zodiac</th>
                  <th className="p-2 font-bold">Frequency Strength</th>
                  <th className="p-2 font-bold">Lal Kitab State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-700">
                {result.planets.map((p) => (
                  <tr key={p.name}>
                    <td className="p-2 font-bold">{p.name}</td>
                    <td className="p-2">House {p.house}</td>
                    <td className="p-2">Sign {p.sign}</td>
                    <td className="p-2">{p.strength}%</td>
                    <td className="p-2 font-bold text-emerald-400">{p.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Yogas and Doshas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-200 border-b border-slate-200 pb-1 uppercase tracking-wider">
              3. {t.yogas}
            </h3>
            <ul className="space-y-1.5">
              {result.yogas.filter(y => y.present).map((y) => (
                <li key={y.name} className="text-[11px] text-slate-700">
                  <strong className="text-emerald-400 uppercase">{y.name}:</strong> {y.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-200 border-b border-slate-200 pb-1 uppercase tracking-wider">
              4. {t.doshas}
            </h3>
            <ul className="space-y-1.5">
              {result.doshas.filter(d => d.present).map((d) => (
                <li key={d.name} className="text-[11px] text-slate-700">
                  <strong className="text-rose-400 uppercase">{d.name} ({d.severity}):</strong> {d.description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Gemstone and Donations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-4 bg-white/40 border border-slate-200 rounded-lg space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              {t.gemstones}
            </h4>
            <div className="space-y-1 text-[11px] text-slate-700">
              <p>• Recommended Stone: <strong className="text-emerald-400">{result.gemstone.name}</strong></p>
              <p>• Minimum Weight: {result.gemstone.weight}</p>
              <p>• Setting Metal: {result.gemstone.metal}</p>
              <p>• Finger placement: {result.gemstone.finger}</p>
            </div>
          </div>

          <div className="p-4 bg-white/40 border border-slate-200 rounded-lg space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              {t.donations}
            </h4>
            <div className="space-y-1 text-[11px] text-slate-700">
              <p>• Suggestion: <strong className="text-emerald-400">{result.donation.suggestedDonation}</strong></p>
              <p>• Recommended Day: {result.donation.day}</p>
              <p>• Items list: {result.donation.items}</p>
              <p>• Purification: {result.donation.purpose}</p>
            </div>
          </div>
        </div>

        {/* 5. Lifestyle Directives */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-200 pb-1 uppercase tracking-wider">
            5. {t.lifestyle}
          </h3>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700 leading-relaxed">
            {result.lifestyle.dailyPractices.map((p, idx) => (
              <li key={idx}>{p}</li>
            ))}
            {result.lifestyle.behavioralGuidance.map((p, idx) => (
              <li key={idx} className="text-rose-400 font-bold">{p}</li>
            ))}
          </ul>
        </div>

        {/* Sign-off seal */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-5 mt-4 text-[10px] text-slate-400">
          <div>
            <p className="font-bold uppercase">Urjaflux OS Consultation Signature Seal</p>
            <p className="text-[9px]">Lal Kitab Advanced Vedic Compiler Engine v1.0.4</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-400">APPROVED</p>
            <p className="text-[9px]">Status: SECURE TRANSMISSION</p>
          </div>
        </div>

      </div>
    </div>
  );
}
