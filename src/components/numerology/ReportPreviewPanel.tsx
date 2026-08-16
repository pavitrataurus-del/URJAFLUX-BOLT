// src/components/numerology/ReportPreviewPanel.tsx
import React, { useState, useEffect } from "react";
import { Client } from "../../types/app";
import { calculateNumerology } from "./numerologyEngine";
import { FileText, Printer, Globe, Calendar, User, Compass } from "lucide-react";

interface ReportPreviewPanelProps {
  client: Client;
}

export default function ReportPreviewPanel({ client }: ReportPreviewPanelProps) {
  const defaultLanguage = (client.preferredLanguage || "").toLowerCase().includes("hind") ? "Hindi" : "English";
  const [language, setLanguage] = useState<"English" | "Hindi">(defaultLanguage);

  useEffect(() => {
    const isHindi = (client.preferredLanguage || "").toLowerCase().includes("hind");
    setLanguage(isHindi ? "Hindi" : "English");
  }, [client]);

  const result = calculateNumerology(client.dob, client.name);

  if (!result) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 bg-white/10 rounded-xl">
        <p className="text-xs font-mono text-slate-400">Awaiting calculations to generate report dossier...</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Translations object containing English and Hindi strings for the core report
  const content = {
    English: {
      title: "URJAFLUX ENTERPRISE NUMEROLOGY DOSSIER",
      subtitle: "Professional Consultant Report & Cosmic Coordinate Registry",
      metaClient: "CLIENT DOSSIER",
      metaDob: "DATE OF EPOCH",
      metaLp: "LIFE PATH NUMBER",
      metaDest: "DESTINY NUMBER",
      metaSu: "SOUL URGE NUMBER",
      secPrimary: "I. PRIMARY NATAL ALIGNMENTS",
      secLucky: "II. LUCKY ALIGNMENTS & REMEDIAL FACTORS",
      secDirective: "III. ENTERPRISE SIGNATURE & WORKSPACE DIRECTIVES",
      luckyColors: "LUCKY COLOURS",
      luckyDays: "LUCKY DAYS",
      luckyDir: "AUSPICIOUS DIRECTIONS",
      luckyGem: "GEMSTONE DIRECTIVE",
      valColors: "Gold, Yellow, White",
      valDays: "Sunday, Thursday",
      valDirections: "East, North-East",
      valGem: "Ruby / Yellow Sapphire",
      lpReading: `Your LPN is ${result.lifePath.value}. You are destined for sovereign leadership, original action, and establishing high personal boundaries. Combine this drive with strategic organization.`,
      destReading: `Your DEN is ${result.destiny.value}. Your legal birth identity vibration urges you to create, manifest, and express profound spiritual layouts.`,
      suReading: `Your SUN is ${result.soulUrge.value}. Your inner emotional frequency craves absolute freedom, beauty, and cooperation.`,
      directiveReading: "Construct your signatures with an upward flourish. Organize workspace desks with golden metal decorations to invoke prosperity. Prioritize signing contracts on your lucky days.",
      confSeal: "CONFIDENTIAL SEAL • URJAFLUX OPERATIONAL SYSTEM"
    },
    Hindi: {
      title: "ऊर्जाफ्लक्स एंटरप्राइज अंकशास्त्र रिपोर्ट",
      subtitle: "पेशेवर सलाहकार रिपोर्ट और ब्रह्मांडीय संरेखण",
      metaClient: "ग्राहक का नाम",
      metaDob: "जन्म तिथि",
      metaLp: "जीवन पथ संख्या (LPN)",
      metaDest: "भाग्य संख्या (DEN)",
      metaSu: "आत्मा की इच्छा संख्या (SUN)",
      secPrimary: "I. मुख्य जन्म कुंडली संरेखण",
      secLucky: "II. भाग्यशाली संरेखण और उपचारात्मक उपाय",
      secDirective: "III. व्यावसायिक हस्ताक्षर और कार्यक्षेत्र निर्देश",
      luckyColors: "भाग्यशाली रंग",
      luckyDays: "भाग्यशाली दिन",
      luckyDir: "शुभ दिशाएं",
      luckyGem: "रत्न निर्देश",
      valColors: "सुनहरा, पीला, सफेद",
      valDays: "रविवार, गुरुवार",
      valDirections: "पूर्व, उत्तर-पूर्व",
      valGem: "माणिक्य / पुखराज",
      lpReading: `आपकी जीवन पथ संख्या ${result.lifePath.value} है। आप स्वतंत्र नेतृत्व, नए कार्यों की शुरुआत और उच्च स्तर की व्यक्तिगत सीमाओं को स्थापित करने के लिए बने हैं।`,
      destReading: `आपकी भाग्य संख्या ${result.destiny.value} है। आपका कानूनी जन्म नाम आपको गहन रचनात्मक कार्यों को विकसित करने के लिए प्रेरित करता है।`,
      suReading: `आपकी आत्मा की इच्छा संख्या ${result.soulUrge.value} है। आपकी आंतरिक भावनात्मक आवश्यकताएं पूर्ण स्वतंत्रता और सहयोग चाहती हैं।`,
      directiveReading: "अपने व्यावसायिक हस्ताक्षरों को ऊपर की ओर बढ़ते हुए आकार में बनाएं। कार्यक्षेत्र पर धातु की सजावट रखें और शुभ दिनों में अनुबंधों पर हस्ताक्षर करें।",
      confSeal: "गोपनीय मुहर • ऊर्जाफ्लक्स ऑपरेशनल सिस्टम"
    }
  };

  const t = content[language];

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/40 p-4 border border-slate-200 rounded-xl font-mono text-xs">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            Report Engine Output Workspace
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Synchronized preferred language: <span className="text-emerald-400 font-bold">{client.preferredLanguage || "English"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-850 rounded">
            {(["English", "Hindi"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 text-[9.5px] font-bold rounded transition-all ${
                  language === lang
                    ? "bg-emerald-600 text-slate-900"
                    : "text-slate-400 hover:text-slate-900"
                }`}
              >
                {lang === "English" ? "ENGLISH" : "हिन्दी"}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white hover:bg-slate-850 text-emerald-400 border border-emerald-900/40 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-[11px]"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT REPORT</span>
          </button>
        </div>
      </div>

      {/* Printable Report Card */}
      <div className="bg-white text-slate-950 p-6 md:p-10 border border-slate-200 rounded-2xl shadow-xl space-y-8 max-w-4xl mx-auto font-sans print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-5 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 tracking-widest block uppercase font-mono">Urjaflux OS</span>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 uppercase font-mono">{t.title}</h1>
            <p className="text-xs text-slate-400 font-mono">{t.subtitle}</p>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400 shrink-0 border-l-2 md:border-l-0 md:border-r-2 border-emerald-600 pl-3 md:pl-0 md:pr-3">
            <p>DOC ID: LPN-{result.lifePath.value}-DEN-{result.destiny.value}</p>
            <p>DATE: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Client Metadata block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl font-mono text-xs text-slate-700">
          <div>
            <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-wider">{t.metaClient}</span>
            <p className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              {client.name.toUpperCase()}
            </p>
          </div>
          <div>
            <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-wider">{t.metaDob}</span>
            <p className="font-bold text-slate-900 mt-0.5">{client.dob}</p>
          </div>
          <div>
            <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-wider">{t.metaLp}</span>
            <p className="font-bold text-emerald-600 mt-0.5 text-sm">{result.lifePath.value}</p>
          </div>
          <div>
            <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-wider">{t.metaDest}</span>
            <p className="font-bold text-emerald-600 mt-0.5 text-sm">{result.destiny.value}</p>
          </div>
        </div>

        {/* Primary Alignments Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-1.5">
            {t.secPrimary}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
            <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-slate-50/40">
              <span className="text-[9px] text-emerald-600 font-bold block">{t.metaLp} ({result.lifePath.value})</span>
              <p className="text-slate-700 leading-relaxed font-sans">{t.lpReading}</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-slate-50/40">
              <span className="text-[9px] text-emerald-600 font-bold block">{t.metaDest} ({result.destiny.value})</span>
              <p className="text-slate-700 leading-relaxed font-sans">{t.destReading}</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-slate-50/40">
              <span className="text-[9px] text-emerald-600 font-bold block">{t.metaSu} ({result.soulUrge.value})</span>
              <p className="text-slate-700 leading-relaxed font-sans">{t.suReading}</p>
            </div>
          </div>
        </div>

        {/* Lucky factors section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-1.5">
            {t.secLucky}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[8.5px] text-slate-400 uppercase font-bold">{t.luckyColors}</span>
              <p className="font-bold text-slate-900 mt-0.5">{t.valColors}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[8.5px] text-slate-400 uppercase font-bold">{t.luckyDays}</span>
              <p className="font-bold text-slate-900 mt-0.5">{t.valDays}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[8.5px] text-slate-400 uppercase font-bold">{t.luckyDir}</span>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                {t.valDirections}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[8.5px] text-slate-400 uppercase font-bold">{t.luckyGem}</span>
              <p className="font-bold text-slate-900 mt-0.5">{t.valGem}</p>
            </div>
          </div>
        </div>

        {/* Directives Section */}
        <div className="space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5">
            {t.secDirective}
          </h3>
          <p className="text-slate-700 leading-relaxed font-sans">{t.directiveReading}</p>
        </div>

        {/* Footer Seal */}
        <div className="border-t-2 border-slate-200 pt-5 text-center font-mono text-[9px] text-slate-400 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>{t.confSeal}</span>
          <span>© 2026 URJAFLUX OS • ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </div>
  );
}
