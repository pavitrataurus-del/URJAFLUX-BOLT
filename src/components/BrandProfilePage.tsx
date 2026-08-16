import React, { useState, useEffect } from "react";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  CreditCard, 
  FileText, 
  Paintbrush, 
  Check, 
  Sparkles, 
  RefreshCw,
  Image as ImageIcon,
  PenTool,
  ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";

export interface BrandProfile {
  companyName: string;
  consultantName: string;
  companyLogo: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  gst: string;
  signature: string;
  stamp: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  defaultReportHeader: string;
  defaultReportFooter: string;
  profileImage: string;
}

const DEFAULT_BRAND_PROFILE: BrandProfile = {
  companyName: "Cosmic Alignments Ltd.",
  consultantName: "Dr. Devendra Shastri",
  companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
  email: "devendra@cosmicalignments.com",
  phone: "+91 98765 43210",
  website: "www.cosmicalignments.com",
  address: "Sector 5, HSR Layout, Bengaluru, Karnataka - 560102",
  gst: "29AAAAA1111A1Z1",
  signature: "Devendra Shastri",
  stamp: "COSMIC ALIGNMENTS APPROVED SECTOR",
  brandPrimaryColor: "#059669",
  brandSecondaryColor: "#1d4ed8",
  defaultReportHeader: "COMPREHENSIVE SPATIAL RESONANCE AUDIT",
  defaultReportFooter: "Disclaimer: This assessment is based on metaphysical orientation principles and mathematical geopathic measurements. Internal core aligned." ,
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
};

export default function BrandProfilePage() {
  const [profile, setProfile] = useState<BrandProfile>(() => {
    const saved = localStorage.getItem("urjaflux_brand_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_BRAND_PROFILE;
      }
    }
    return DEFAULT_BRAND_PROFILE;
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("urjaflux_brand_profile", JSON.stringify(profile));
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("urjaflux_brand_profile", JSON.stringify(profile));
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your branding profile to default?")) {
      setProfile(DEFAULT_BRAND_PROFILE);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Brand Profile & White-Label Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure your company identity, custom colors, signature stamps, and default report parameters.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            RESET DEFAULTS
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>SAVED!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>SAVE CHANGES</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isSaved && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-mono font-bold"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>White-label brand profile successfully committed to the active tenant workspace. Future reports will dynamically inherit these templates.</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM CONTAINER - LEFT Side (7 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          
          {/* Section 1: Brand & Personal Identity */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              1. Business Identity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={profile.companyName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. AstroVastu Corp"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Consultant Name</label>
                <input
                  type="text"
                  name="consultantName"
                  value={profile.consultantName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. Dr. Jane Doe"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Company Logo URL</label>
                <input
                  type="text"
                  name="companyLogo"
                  value={profile.companyLogo}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="Logo URL"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Profile Image URL</label>
                <input
                  type="text"
                  name="profileImage"
                  value={profile.profileImage}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="Profile URL"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Vectors */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              2. Communication & Logistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Website Domain</label>
                <input
                  type="text"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. www.astrovastu.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">GST Registration (Optional)</label>
                <input
                  type="text"
                  name="gst"
                  value={profile.gst}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. 29AAAAA1111A1Z1"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Physical Address</label>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="Business address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Color Palettes & Corporate Theme */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Paintbrush className="w-4 h-4 text-emerald-600" />
              3. Visual Styling & Color Tokens
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Primary Color Theme</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="brandPrimaryColor"
                    value={profile.brandPrimaryColor}
                    onChange={handleChange}
                    className="w-10 h-8 rounded border border-slate-200 p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="brandPrimaryColor"
                    value={profile.brandPrimaryColor}
                    onChange={handleChange}
                    className="flex-1 bg-slate-50 text-slate-800 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Secondary Color Theme</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="brandSecondaryColor"
                    value={profile.brandSecondaryColor}
                    onChange={handleChange}
                    className="w-10 h-8 rounded border border-slate-200 p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="brandSecondaryColor"
                    value={profile.brandSecondaryColor}
                    onChange={handleChange}
                    className="flex-1 bg-slate-50 text-slate-800 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Authorized Signature & Certification */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-emerald-600" />
              4. Authentication, Signature & Stamp
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Digital Signature (Text/Name)</label>
                <input
                  type="text"
                  name="signature"
                  value={profile.signature}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. Devendra Shastri"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Corporate Stamp Text</label>
                <input
                  type="text"
                  name="stamp"
                  value={profile.stamp}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. COSMIC ALIGNMENTS APPROVED"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 5: Default Report Parameter Header / Footer */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              5. Default Report Branding Parameters
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Default Report Header Title</label>
                <input
                  type="text"
                  name="defaultReportHeader"
                  value={profile.defaultReportHeader}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. VEDIC ENERGY HARMONIZATION REPORT"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Default Report Footer / Disclaimer</label>
                <textarea
                  name="defaultReportFooter"
                  value={profile.defaultReportFooter}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="Disclaimer or footer note..."
                  required
                />
              </div>
            </div>
          </div>

        </form>

        {/* WHITE LABEL REPORT PREVIEW - RIGHT Side (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              LIVE REPORT TEMPLATE PREVIEW
            </h3>
            
            {/* Visualizer card imitating a physical PDF printout */}
            <div className="bg-white text-slate-900 p-5 rounded-xl shadow-xl min-h-[420px] flex flex-col justify-between text-[11px]">
              
              {/* Report Header Block */}
              <div className="border-b-2 pb-4" style={{ borderColor: profile.brandPrimaryColor }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {profile.companyLogo ? (
                      <img src={profile.companyLogo} alt="Logo" className="w-8 h-8 rounded border object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-slate-100 border flex items-center justify-center font-bold">
                        C
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs uppercase" style={{ color: profile.brandPrimaryColor }}>
                        {profile.companyName}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono tracking-tight">{profile.website || "www.business.com"}</p>
                    </div>
                  </div>
                  <div className="text-right text-[8px] font-mono text-slate-400">
                    <p>GST: {profile.gst || "N/A"}</p>
                    <p>TEL: {profile.phone}</p>
                  </div>
                </div>

                <div className="mt-4 p-2.5 rounded text-center text-[10px] font-bold tracking-wider font-mono uppercase" style={{ backgroundColor: `${profile.brandPrimaryColor}15`, color: profile.brandPrimaryColor }}>
                  {profile.defaultReportHeader}
                </div>
              </div>

              {/* Mock Content Body */}
              <div className="my-4 flex-1 space-y-3">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                  <span className="font-bold font-mono uppercase text-[8px] text-slate-500">PROJECT ENVELOPE</span>
                  <span className="font-bold text-slate-700">P-0000 Alpha Villa</span>
                </div>

                <div className="space-y-1.5 font-mono text-[9px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Vastu Energy Score:</span>
                    <span className="font-bold text-emerald-600">92 / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Geopathic Stress Index:</span>
                    <span className="font-bold text-indigo-600">Low (Stable)</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3">
                  <p className="text-[8px] font-mono uppercase font-bold text-slate-400 mb-1">CANONICAL SPACE INSIGHTS</p>
                  <p className="text-slate-500 italic text-[9px]">"Directions aligned successfully with zero magnetic drift. Cosmic channels are wide open at NE."</p>
                </div>
              </div>

              {/* Signatures & Stamps Footer Block */}
              <div className="border-t-2 pt-4 flex justify-between items-end" style={{ borderColor: profile.brandSecondaryColor }}>
                <div className="space-y-1 max-w-[60%]">
                  <p className="text-[8px] text-slate-400 font-mono uppercase">Authorized Assessor</p>
                  <p className="font-serif italic text-xs text-slate-700 underline" style={{ textDecorationColor: profile.brandSecondaryColor }}>
                    {profile.signature}
                  </p>
                  <p className="text-[8px] text-slate-500 font-mono uppercase">{profile.consultantName}</p>
                </div>

                {profile.stamp && (
                  <div className="border-2 border-dashed p-1 px-2 text-center transform -rotate-6 text-[8px] font-bold tracking-wider rounded uppercase opacity-85" style={{ color: profile.brandSecondaryColor, borderColor: `${profile.brandSecondaryColor}80` }}>
                    {profile.stamp}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-[7px] text-slate-400 text-center uppercase tracking-wide leading-relaxed font-mono">
                {profile.defaultReportFooter}
              </div>

            </div>

            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold mb-1">
                ⚙️ WHITE-LABEL DISCOVERY
              </h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                This template binds dynamically at print/compile time. You can customize primary/secondary hex values to match your corporate branding.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
