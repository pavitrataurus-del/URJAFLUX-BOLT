import React, { useState } from "react";
import { 
  Palette, 
  Image as ImageIcon, 
  FileText, 
  LayoutGrid, 
  Globe, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Lock 
} from "lucide-react";
import { WhiteLabelConfig } from "../../types/customerLifecycle";
import { DEFAULT_WHITE_LABEL } from "../../services/customer_lifecycle/customerLifecycleService";

export const WhiteLabelAndBrandingPanel: React.FC = () => {
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig>(DEFAULT_WHITE_LABEL);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Palette className="w-4 h-4" />
            <span>MODULE 11 • ENTERPRISE WHITE LABEL ENGINE</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">Custom Brand & Organization Identity</h2>
          <p className="text-xs text-slate-400 mt-1">
            Customize platform themes, custom domain name, PDF watermarks, and enterprise login screens.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSaved ? "Brand Settings Saved!" : "Apply Custom Branding"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Left Form Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-1">Company Custom Logo Image URL</label>
            <input
              type="text"
              value={whiteLabel.companyLogoUrl}
              onChange={e => setWhiteLabel({ ...whiteLabel, companyLogoUrl: e.target.value })}
              placeholder="https://cdn.enterprise.com/assets/logo.png"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Primary Color</label>
              <input
                type="color"
                value={whiteLabel.primaryColor}
                onChange={e => setWhiteLabel({ ...whiteLabel, primaryColor: e.target.value })}
                className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl p-1 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Accent Color</label>
              <input
                type="color"
                value={whiteLabel.accentColor}
                onChange={e => setWhiteLabel({ ...whiteLabel, accentColor: e.target.value })}
                className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl p-1 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Background Color</label>
              <input
                type="color"
                value={whiteLabel.backgroundColor}
                onChange={e => setWhiteLabel({ ...whiteLabel, backgroundColor: e.target.value })}
                className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl p-1 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Platform Theme Preset</label>
            <select
              value={whiteLabel.themeMode}
              onChange={e => setWhiteLabel({ ...whiteLabel, themeMode: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="DARK_LUXURY">Dark Luxury Canvas (Default Emerald Slate)</option>
              <option value="LIGHT_ENTERPRISE">Light Enterprise Corporate</option>
              <option value="HIGH_CONTRAST">High Contrast Accessibility</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Custom Login Screen Heading</label>
            <input
              type="text"
              value={whiteLabel.customLoginHeading}
              onChange={e => setWhiteLabel({ ...whiteLabel, customLoginHeading: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Custom PDF Report Watermark Header</label>
            <input
              type="text"
              value={whiteLabel.customPdfWatermark}
              onChange={e => setWhiteLabel({ ...whiteLabel, customPdfWatermark: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Custom Enterprise CNAME Domain</label>
            <input
              type="text"
              value={whiteLabel.customDomainName}
              onChange={e => setWhiteLabel({ ...whiteLabel, customDomainName: e.target.value })}
              placeholder="app.mycompany.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Right Live Preview Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-3 mb-4">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Live Enterprise Gateway Preview</span>
            </div>

            {/* Mock Custom Gateway Screen */}
            <div
              className="p-6 rounded-xl border border-slate-800 space-y-4 text-center transition-all"
              style={{ backgroundColor: whiteLabel.backgroundColor }}
            >
              <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-white text-lg" style={{ backgroundColor: whiteLabel.primaryColor }}>
                {whiteLabel.companyLogoUrl ? <img src={whiteLabel.companyLogoUrl} alt="Logo" className="w-full h-full rounded-xl" /> : "UF"}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{whiteLabel.customLoginHeading}</h3>
                <p className="text-[11px] text-slate-400 mt-1">CNAME Domain: {whiteLabel.customDomainName}</p>
              </div>

              <div className="space-y-2 max-w-xs mx-auto pt-2">
                <input
                  disabled
                  type="text"
                  placeholder="corporate.admin@domain.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-400"
                />
                <button
                  disabled
                  className="w-full py-2 rounded-lg text-white font-bold text-xs"
                  style={{ backgroundColor: whiteLabel.primaryColor }}
                >
                  Single Sign-On (SSO) Login
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-bold block mb-0.5">PDF Watermark Preview:</span>
            <span>"{whiteLabel.customPdfWatermark}"</span>
          </div>
        </div>
      </div>
    </div>
  );
};
