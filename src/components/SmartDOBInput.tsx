import React from "react";
import { Sparkles, Calendar, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { useTranslation } from "../localization/hooks/useTranslation";

interface SmartDOBInputProps {
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
}

export const SmartDOBInput: React.FC<SmartDOBInputProps> = ({
  value,
  onChange,
  required = false,
}) => {
  const { language } = useTranslation();
  const isHindi = language === "hi";

  // Date jumper utils
  const adjustYear = (offset: number) => {
    if (!value) {
      const today = new Date();
      today.setFullYear(today.getFullYear() + offset);
      onChange(today.toISOString().split("T")[0]);
      return;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      d.setFullYear(d.getFullYear() + offset);
      onChange(d.toISOString().split("T")[0]);
    }
  };

  // Helper calculations
  const calculateLifePath = (dobString: string): number => {
    if (!dobString) return 0;
    const clean = dobString.replace(/[^0-9]/g, "");
    if (clean.length < 8) return 0;

    let sum = clean.split("").reduce((acc, char) => acc + parseInt(char, 10), 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split("").reduce((acc, char) => acc + parseInt(char, 10), 0);
    }
    return sum;
  };

  const getVedicRuler = (dobString: string) => {
    if (!dobString) return null;
    const d = new Date(dobString);
    if (isNaN(d.getTime())) return null;

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysHi = ["रविवार (Ravivar)", "सोमवार (Somvar)", "मंगलवार (Mangalvar)", "बुधवार (Budhvar)", "गुरुवार (Guruvar)", "शुक्रवार (Shukravar)", "शनिवार (Shanivar)"];
    
    const dayIndex = d.getDay();
    const dayName = isHindi ? daysHi[dayIndex] : days[dayIndex];

    const rulers: Record<string, { ruler: string; planet: string; color: string; descEn: string; descHi: string }> = {
      "Sunday": { ruler: "Surya", planet: "Sun ☀️", color: "text-amber-500 bg-amber-950/40 border-amber-900/40", descEn: "Brings leadership, authority, and vitality.", descHi: "नेतृत्व, अधिकार और जीवन ऊर्जा प्रदान करता है।" },
      "Monday": { ruler: "Chandra", planet: "Moon 🌙", color: "text-slate-700 bg-white/40 border-slate-700/40", descEn: "Brings emotional depth, intuition, and mental peace.", descHi: "भावनात्मक गहराई, अंतर्ज्ञान और मानसिक शांति लाता है।" },
      "Tuesday": { ruler: "Mangal", planet: "Mars 🔴", color: "text-rose-500 bg-rose-950/40 border-rose-800/40", descEn: "Brings courage, dynamic energy, and physical drive.", descHi: "साहस, गतिशील ऊर्जा और शारीरिक शक्ति प्रदान करता है।" },
      "Wednesday": { ruler: "Budha", planet: "Mercury ☿", color: "text-emerald-500 bg-emerald-950/40 border-emerald-800/40", descEn: "Brings sharp intellect, speech charm, and logical skills.", descHi: "तीक्ष्ण बुद्धि, वाकपटुता और तार्किक कौशल लाता है।" },
      "Thursday": { ruler: "Guru", planet: "Jupiter ♃", color: "text-yellow-500 bg-yellow-950/40 border-yellow-800/40", descEn: "Brings wisdom, spiritual inclination, and luck.", descHi: "ज्ञान, आध्यात्मिक झुकाव और सौभाग्य लाता है।" },
      "Friday": { ruler: "Shukra", planet: "Venus ♀", color: "text-pink-400 bg-pink-950/40 border-pink-800/40", descEn: "Brings beauty, creative talent, and aesthetic grace.", descHi: "सौंदर्य, रचनात्मक प्रतिभा और सुरुचिपूर्ण आकर्षण लाता है।" },
      "Saturday": { ruler: "Shani", planet: "Saturn ♄", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40", descEn: "Brings karmic discipline, endurance, and deep focus.", descHi: "कर्म चक्र अनुशासन, सहनशीलता और गहरा ध्यान लाता है।" }
    };

    const enDay = days[dayIndex];
    return { day: dayName, ...rulers[enDay] };
  };

  const getZodiac = (dobString: string) => {
    if (!dobString) return null;
    const d = new Date(dobString);
    if (isNaN(d.getTime())) return null;

    const day = d.getDate();
    const month = d.getMonth() + 1;

    let signEn = "";
    let signHi = "";
    let elementEn = "";
    let elementHi = "";
    let color = "";

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      signEn = "Aries"; signHi = "मेष (Mesh)"; elementEn = "Fire 🔥"; elementHi = "अग्नि तत्व 🔥"; color = "text-rose-400 border-rose-900/40 bg-rose-950/20";
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      signEn = "Taurus"; signHi = "वृषभ (Vrishabh)"; elementEn = "Earth ⛰️"; elementHi = "पृथ्वी तत्व ⛰️"; color = "text-emerald-400 border-emerald-900/40 bg-emerald-950/20";
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      signEn = "Gemini"; signHi = "मिथुन (Mithun)"; elementEn = "Air 💨"; elementHi = "वायु तत्व 💨"; color = "text-sky-400 border-sky-900/40 bg-sky-950/20";
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      signEn = "Cancer"; signHi = "कर्क (Kark)"; elementEn = "Water 💧"; elementHi = "जल तत्व 💧"; color = "text-blue-400 border-blue-900/40 bg-blue-950/20";
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      signEn = "Leo"; signHi = "सिंह (Sinh)"; elementEn = "Fire 🔥"; elementHi = "अग्नि तत्व 🔥"; color = "text-amber-500 border-amber-900/40 bg-amber-950/20";
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      signEn = "Virgo"; signHi = "कन्या (Kanya)"; elementEn = "Earth ⛰️"; elementHi = "पृथ्वी तत्व ⛰️"; color = "text-emerald-400 border-emerald-900/40 bg-emerald-950/20";
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      signEn = "Libra"; signHi = "तुला (Tula)"; elementEn = "Air 💨"; elementHi = "वायु तत्व 💨"; color = "text-sky-400 border-sky-900/40 bg-sky-950/20";
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      signEn = "Scorpio"; signHi = "वृश्चिक (Vrishchik)"; elementEn = "Water 💧"; elementHi = "जल तत्व 💧"; color = "text-blue-400 border-blue-900/40 bg-blue-950/20";
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      signEn = "Sagittarius"; signHi = "धनु (Dhanu)"; elementEn = "Fire 🔥"; elementHi = "अग्नि तत्व 🔥"; color = "text-rose-400 border-rose-900/40 bg-rose-950/20";
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      signEn = "Capricorn"; signHi = "मकर (Makar)"; elementEn = "Earth ⛰️"; elementHi = "पृथ्वी तत्व ⛰️"; color = "text-emerald-400 border-emerald-900/40 bg-emerald-950/20";
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      signEn = "Aquarius"; signHi = "कुंभ (Kumbh)"; elementEn = "Air 💨"; elementHi = "वायु तत्व 💨"; color = "text-sky-400 border-sky-900/40 bg-sky-950/20";
    } else {
      signEn = "Pisces"; signHi = "मीन (Meen)"; elementEn = "Water 💧"; elementHi = "जल तत्व 💧"; color = "text-blue-400 border-blue-900/40 bg-blue-950/20";
    }

    return {
      sign: isHindi ? signHi : signEn,
      element: isHindi ? elementHi : elementEn,
      color,
    };
  };

  const lifePath = calculateLifePath(value);
  const ruler = getVedicRuler(value);
  const zodiac = getZodiac(value);

  return (
    <div className="space-y-2 text-left" id="smart-dob-section">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          {isHindi ? "जन्म तिथि (Date of Birth) *" : "Date of Birth *"}
        </label>
        
        {/* Quick adjustments */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjustYear(-10)}
            className="text-[9px] font-mono bg-white hover:bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            title="Minus 10 Years"
          >
            -10Y
          </button>
          <button
            type="button"
            onClick={() => adjustYear(-1)}
            className="text-[9px] font-mono bg-white hover:bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            title="Minus 1 Year"
          >
            -1Y
          </button>
          <button
            type="button"
            onClick={() => adjustYear(1)}
            className="text-[9px] font-mono bg-white hover:bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            title="Plus 1 Year"
          >
            +1Y
          </button>
          <button
            type="button"
            onClick={() => adjustYear(10)}
            className="text-[9px] font-mono bg-white hover:bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            title="Plus 10 Years"
          >
            +10Y
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-850 rounded-lg focus:outline-none focus:border-emerald-500 font-mono tracking-wide shadow-inner focus:ring-1 focus:ring-indigo-500/20"
        />
        {value && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-900/30">
            <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" />
            {isHindi ? `मूलांक ${lifePath}` : `LP ${lifePath}`}
          </span>
        )}
      </div>

      {/* Live Astrological Insight Badge */}
      {value && ruler && zodiac && (
        <div className="p-3 bg-white/40 border border-slate-850 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2 animate-fade-in text-xs">
          {/* Day & Planet */}
          <div className="space-y-0.5 border-r border-slate-200/40 pr-2 last:border-r-0">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">
              {isHindi ? "वार स्वामी (Day Lord)" : "Vedic Day Lord"}
            </span>
            <div className="flex items-center gap-1">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-sans ${ruler.color}`}>
                {isHindi ? ruler.ruler : ruler.ruler} ({ruler.planet})
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-sans italic mt-1 leading-normal">
              {isHindi ? ruler.descHi : ruler.descEn}
            </p>
          </div>

          {/* Zodiac & Element */}
          <div className="space-y-0.5 border-r border-slate-200/40 pr-2 last:border-r-0">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">
              {isHindi ? "राशि व तत्व (Zodiac & Element)" : "Sunsign & Element"}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-200">{zodiac.sign}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${zodiac.color}`}>
                {zodiac.element}
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-sans italic mt-1 leading-normal">
              {isHindi ? "यह जन्म के मूलभूत प्राकृतिक तत्व का प्रतीक है।" : "Indicates the fundamental element of nature in birth chart."}
            </p>
          </div>

          {/* Numerology Matrix */}
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">
              {isHindi ? "अंक ज्योतिष प्रभाव (Vibrational Path)" : "Numerology Spark"}
            </span>
            <div className="text-[11px] text-slate-200">
              {isHindi ? "मूलांक (Life Path):" : "Life Path:"}{" "}
              <span className="text-amber-400 font-bold font-mono text-xs">{lifePath}</span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-sans italic mt-1 leading-normal">
              {lifePath === 11 || lifePath === 22 || lifePath === 33
                ? (isHindi ? "मास्टर नंबर ऊर्जा सक्रिय!" : "Master Number activation!")
                : (isHindi ? "जन्म अंकों का मुख्य कंपन मूल्य।" : "The primary vibration frequency of birth numbers.")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
