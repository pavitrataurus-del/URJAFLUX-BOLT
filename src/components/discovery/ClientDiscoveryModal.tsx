import React, { useState, useEffect } from "react";
import { 
  User, 
  Building2, 
  KeyRound, 
  Target, 
  Sparkles, 
  Users, 
  ShieldAlert, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RotateCcw, 
  Wand2, 
  ChevronRight,
  Plus,
  Minus,
  Check,
  Globe,
  FileType,
  Database,
  Hash,
  Copy
} from "lucide-react";
import { 
  ClientDiscoveryRecord, 
  ConsultationPurpose, 
  PropertyConstraint, 
  ClientPreference, 
  PropertyOwnership,
  ExpandedPropertyCategory,
  ReportLanguage,
  ReportTypePreference
} from "../../types/clientDiscovery";
import { 
  clientDiscoveryService, 
  validateClientDiscovery,
  sanitizeClientDiscoveryRecord
} from "../../services/clientDiscoveryService";

interface ClientDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EXPANDED_PROPERTY_CATEGORIES: { category: ExpandedPropertyCategory; group: "Residential" | "Commercial" | "Specialized" }[] = [
  // Residential
  { category: "Apartment", group: "Residential" },
  { category: "Independent House", group: "Residential" },
  { category: "Villa", group: "Residential" },
  { category: "Duplex", group: "Residential" },
  { category: "Farm House", group: "Residential" },
  
  // Commercial
  { category: "Shop", group: "Commercial" },
  { category: "Office", group: "Commercial" },
  { category: "Commercial Office", group: "Commercial" },
  { category: "Factory", group: "Commercial" },
  { category: "Warehouse", group: "Commercial" },
  { category: "Industrial Unit", group: "Commercial" },

  // Specialized / Institutional / Hospitality
  { category: "Clinic", group: "Specialized" },
  { category: "Hospital", group: "Specialized" },
  { category: "Hotel", group: "Specialized" },
  { category: "Restaurant", group: "Specialized" },
  { category: "School", group: "Specialized" },
  { category: "College", group: "Specialized" },
  { category: "Temple", group: "Specialized" },
  { category: "Plot", group: "Specialized" },
  { category: "Mixed Use Property", group: "Specialized" },
  { category: "Other", group: "Specialized" }
];

const LANGUAGE_OPTIONS: ReportLanguage[] = [
  "English",
  "Hindi",
  "Hinglish",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Other"
];

const REPORT_TYPE_OPTIONS: { id: ReportTypePreference; label: string; desc: string }[] = [
  { id: "Homeowner Report", label: "Homeowner Report", desc: "Clean, simplified presentation for end occupants" },
  { id: "Professional Consultant Report", label: "Professional Consultant Report", desc: "Detailed technical Vastu analysis & exact degrees" },
  { id: "White Label Report", label: "White Label Report", desc: "Unbranded report ready for custom agency branding" },
  { id: "Founder Review Report", label: "Founder Review Report", desc: "Strict, high-precision verification audit" }
];

const PURPOSE_OPTIONS: { id: ConsultationPurpose; label: string; desc: string }[] = [
  { id: "Financial Growth", label: "Financial Growth", desc: "Wealth accumulation & cashflow" },
  { id: "Debt Problems", label: "Debt Problems", desc: "Overcoming loan liabilities" },
  { id: "Business Expansion", label: "Business Expansion", desc: "Scaling operations & sales" },
  { id: "Career Growth", label: "Career Growth", desc: "Promotions & career stability" },
  { id: "Health", label: "Health & Vitality", desc: "Physical wellbeing & healing" },
  { id: "Family Harmony", label: "Family Harmony", desc: "Relationships & emotional peace" },
  { id: "Marriage", label: "Marriage Prospects", desc: "Marital stability & matches" },
  { id: "Children's Education", label: "Education & Focus", desc: "Academic growth & memory" },
  { id: "Mental Peace", label: "Mental Peace", desc: "Stress reduction & clarity" },
  { id: "Legal Matters", label: "Legal & Court Matters", desc: "Favorable litigation outcomes" },
  { id: "Property Purchase", label: "Property Purchase", desc: "Buying land or new home" },
  { id: "New Construction", label: "New Construction", desc: "Designing new building plan" },
  { id: "Other", label: "Other Objectives", desc: "Custom specific requirement" }
];

const CONSTRAINT_OPTIONS: { id: PropertyConstraint; label: string }[] = [
  { id: "No Demolition", label: "Strictly No Demolition" },
  { id: "Low Budget", label: "Low Budget Remedies" },
  { id: "Moderate Budget", label: "Moderate Budget Remedies" },
  { id: "Premium Budget", label: "Premium / Unlimited Budget" },
  { id: "Society Restrictions", label: "Apartment / Society Constraints" },
  { id: "Rental Restrictions", label: "Rented Property Rules" },
  { id: "Structural Changes Allowed", label: "Minor Structural Changes Allowed" }
];

const PREFERENCE_OPTIONS: { id: ClientPreference; label: string }[] = [
  { id: "Only Practical Remedies", label: "Only Practical & Non-Invasive Remedies" },
  { id: "Traditional Remedies Accepted", label: "Traditional Metal/Pyramid/Gem Remedies Accepted" },
  { id: "Non-Invasive Remedies Only", label: "Color / Element / Directional Shifting Only" },
  { id: "Structural Remedies Allowed", label: "Door Re-alignment / Wall Alterations Allowed" },
  { id: "White Label Consultant Report Required", label: "White-Label Branded Consultant Report" }
];

export const ClientDiscoveryModal: React.FC<ClientDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ClientDiscoveryRecord>(() =>
    clientDiscoveryService.getDiscovery()
  );
  const [validation, setValidation] = useState(() => validateClientDiscovery(formData));
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const disc = clientDiscoveryService.getDiscovery();
      setFormData(disc);
      setValidation(validateClientDiscovery(disc));
      setSaveSuccessMessage(null);
    }
  }, [isOpen]);

  // Continuous background auto-save to LocalStorage/Firestore
  useEffect(() => {
    if (isOpen && formData) {
      const timer = setTimeout(() => {
        clientDiscoveryService.saveDiscovery(formData, true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, isOpen]);

  const handleDataChange = (updater: (prev: ClientDiscoveryRecord) => ClientDiscoveryRecord) => {
    setFormData(prev => {
      const updated = updater(prev);
      setValidation(validateClientDiscovery(updated));
      return updated;
    });
  };

  const togglePurpose = (purpose: ConsultationPurpose) => {
    handleDataChange(prev => {
      const exists = prev.primaryPurposes.includes(purpose);
      const nextPurposes = exists
        ? prev.primaryPurposes.filter(p => p !== purpose)
        : [...prev.primaryPurposes, purpose];
      return { ...prev, primaryPurposes: nextPurposes };
    });
  };

  const toggleConstraint = (constraint: PropertyConstraint) => {
    handleDataChange(prev => {
      const exists = prev.constraints.includes(constraint);
      const nextConstraints = exists
        ? prev.constraints.filter(c => c !== constraint)
        : [...prev.constraints, constraint];
      return { ...prev, constraints: nextConstraints };
    });
  };

  const togglePreference = (preference: ClientPreference) => {
    handleDataChange(prev => {
      const exists = prev.preferences.includes(preference);
      const nextPreferences = exists
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference];
      return { ...prev, preferences: nextPreferences };
    });
  };

  const updateOccupants = (field: keyof ClientDiscoveryRecord["occupants"], delta: number) => {
    handleDataChange(prev => {
      const currentVal = prev.occupants[field];
      const newVal = Math.max(0, currentVal + delta);
      const updatedOccupants = { ...prev.occupants, [field]: newVal };

      if (field !== "totalMembers") {
        updatedOccupants.totalMembers = 
          updatedOccupants.adults + 
          updatedOccupants.children + 
          updatedOccupants.seniorCitizens;
      }

      return { ...prev, occupants: updatedOccupants };
    });
  };

  const handleLoadPreset = () => {
    const preset = clientDiscoveryService.loadPresetSample();
    setFormData(preset);
    setValidation(validateClientDiscovery(preset));
    setSaveSuccessMessage("Loaded Sample Client Discovery Preset!");
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleReset = () => {
    const fresh = clientDiscoveryService.resetDiscovery();
    setFormData(fresh);
    setValidation(validateClientDiscovery(fresh));
    setSaveSuccessMessage("Form reset to default.");
    setTimeout(() => setSaveSuccessMessage(null), 2000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAndProceed = () => {
    const sanitized = sanitizeClientDiscoveryRecord(formData);
    setFormData(sanitized);
    const valResult = clientDiscoveryService.saveDiscovery(sanitized, true);
    setValidation(valResult);

    setSaveSuccessMessage("Client Discovery Saved & Completed! Proceeding to Vastu Analysis...");
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER BAR */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Client Discovery Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  KIE Sprint-2 Module 1 (Founder Edition)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mandatory First Step: Context, Goals, Constraints & Automatic Identity Setup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadPreset}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Load standard sample discovery data for quick testing"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Load Sample Preset</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTOMATIC IDENTITY & STORAGE ARCHITECTURE BANNER */}
        <div className="px-6 py-2.5 bg-slate-900 text-slate-200 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-2 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Automatic Client ID */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <Hash className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Client ID:</span>
              <span className="text-emerald-400 font-bold">{formData.clientId}</span>
              <button onClick={() => handleCopy(formData.clientId, "clientId")} className="hover:text-white ml-1">
                {copiedId === "clientId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            {/* Automatic Consultation ID */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <Hash className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Consultation ID:</span>
              <span className="text-indigo-400 font-bold">{formData.consultationId}</span>
              <button onClick={() => handleCopy(formData.consultationId, "consultationId")} className="hover:text-white ml-1">
                {copiedId === "consultationId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Provider-Independent Storage Adapter Badge */}
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400 text-[11px]">Storage Provider:</span>
            <span className="text-teal-400 font-semibold text-[11px] bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {clientDiscoveryService.getActiveStorageProviderName()} [Adapter Active]
            </span>
          </div>
        </div>

        {/* PROGRESS METER */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-[#070c18] border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Discovery Progress:</span>
            <span className={`font-bold ${validation.isValid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {validation.completedSectionsCount} / {validation.totalSectionsCount} Sections Completed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${validation.isValid ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${(validation.completedSectionsCount / validation.totalSectionsCount) * 100}%` }}
              />
            </div>
            {validation.isValid ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Analysis
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" /> Required Fields Pending
              </span>
            )}
          </div>
        </div>

        {/* FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {saveSuccessMessage && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              saveSuccessMessage.includes("Missing") 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            }`}>
              {saveSuccessMessage.includes("Missing") ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* SECTION 1: CLIENT INFORMATION */}
          <section className="space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">1</span>
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Client Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.clientInfo.clientName}
                  onChange={(e) => handleDataChange(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo, clientName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070c18] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                {validation.errors.clientName && <p className="text-[10px] text-rose-500 mt-1">{validation.errors.clientName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.clientInfo.mobile}
                  onChange={(e) => handleDataChange(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo, mobile: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070c18] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. client@example.com"
                  value={formData.clientInfo.email}
                  onChange={(e) => handleDataChange(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070c18] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={formData.clientInfo.city}
                  onChange={(e) => handleDataChange(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070c18] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                {validation.errors.city && <p className="text-[10px] text-rose-500 mt-1">{validation.errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Country <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. India"
                  value={formData.clientInfo.country}
                  onChange={(e) => handleDataChange(prev => ({
                    ...prev,
                    clientInfo: { ...prev.clientInfo, country: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070c18] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                {validation.errors.country && <p className="text-[10px] text-rose-500 mt-1">{validation.errors.country}</p>}
              </div>
            </div>
          </section>

          {/* SECTION 2: EXPANDED PROPERTY CATEGORY */}
          <section className="space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">2</span>
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expanded Property Categories</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Property Category <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {EXPANDED_PROPERTY_CATEGORIES.map((item) => {
                  const isSelected = formData.propertyCategory === item.category;
                  return (
                    <button
                      key={item.category}
                      type="button"
                      onClick={() => handleDataChange(prev => ({ ...prev, propertyCategory: item.category }))}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                          : "bg-white dark:bg-[#070c18] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-semibold block">{item.category}</span>
                        <span className="text-[9px] text-slate-400 font-mono uppercase">{item.group}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 3: PROPERTY OWNERSHIP */}
          <section className="space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">3</span>
              <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Property Ownership</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["Self Owned", "Rented", "Under Construction", "Renovation"] as PropertyOwnership[]).map((own) => (
                <button
                  key={own}
                  type="button"
                  onClick={() => handleDataChange(prev => ({ ...prev, propertyOwnership: own }))}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                    formData.propertyOwnership === own
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "bg-white dark:bg-[#070c18] border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formData.propertyOwnership === own ? "border-emerald-500 bg-emerald-500" : "border-slate-400"}`}>
                    {formData.propertyOwnership === own && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span>{own}</span>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 4: PRIMARY CONSULTATION PURPOSE */}
          <section className="space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">4</span>
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Primary Consultation Purpose</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Multiple Selection Allowed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {PURPOSE_OPTIONS.map((opt) => {
                const isSelected = formData.primaryPurposes.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => togglePurpose(opt.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/60 shadow-xs"
                        : "bg-white dark:bg-[#070c18] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-bold ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
                        {opt.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
            {validation.errors.primaryPurposes && (
              <p className="text-xs text-rose-500">{validation.errors.primaryPurposes}</p>
            )}
          </section>

          {/* SECTION 5: CLIENT GOAL */}
          <section className="space-y-3 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">5</span>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Client Goal & Vision</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                What does the client specifically want to achieve? <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Rapid business revenue expansion, elimination of debt, improved health of senior parents, and family peace without major wall demolition..."
                value={formData.clientGoal}
                onChange={(e) => handleDataChange(prev => ({ ...prev, clientGoal: e.target.value }))}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070c18] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {validation.errors.clientGoal && (
                <p className="text-[10px] text-rose-500 mt-1">{validation.errors.clientGoal}</p>
              )}
            </div>
          </section>

          {/* SECTION 6: PEOPLE LIVING IN THE PROPERTY */}
          <section className="space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">6</span>
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Occupants & Household Members</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Total Members: {formData.occupants.totalMembers}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { key: "adults" as const, label: "Adults" },
                { key: "children" as const, label: "Children" },
                { key: "seniorCitizens" as const, label: "Senior Citizens" },
                { key: "workingProfessionals" as const, label: "Professionals" },
                { key: "students" as const, label: "Students" }
              ].map(item => (
                <div key={item.key} className="bg-white dark:bg-[#070c18] border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    {item.label}
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => updateOccupants(item.key, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      {formData.occupants[item.key]}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateOccupants(item.key, 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 7: PROPERTY CONSTRAINTS */}
          <section className="space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">7</span>
                <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Property Constraints</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Multiple Selection</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {CONSTRAINT_OPTIONS.map((opt) => {
                const isSelected = formData.constraints.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleConstraint(opt.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/60 text-amber-600 dark:text-amber-400 font-bold"
                        : "bg-white dark:bg-[#070c18] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "border-amber-500 bg-amber-500 text-white" : "border-slate-400"}`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 8: CLIENT PREFERENCES */}
          <section className="space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">8</span>
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Client Preferences & Remedy Style</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Multiple Selection</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PREFERENCE_OPTIONS.map((opt) => {
                const isSelected = formData.preferences.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => togglePreference(opt.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500/60 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "bg-white dark:bg-[#070c18] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-400"}`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 9: REPORT PREFERENCES (PREFERRED LANGUAGE & REPORT TYPE) */}
          <section className="space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">9</span>
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Report Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Report Language
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleDataChange(prev => ({ ...prev, preferredLanguage: lang }))}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        formData.preferredLanguage === lang
                          ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 font-bold"
                          : "bg-white dark:bg-[#070c18] border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Report Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Report Type
                </label>
                <div className="space-y-2">
                  {REPORT_TYPE_OPTIONS.map((type) => {
                    const isSelected = formData.preferredReportType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleDataChange(prev => ({ ...prev, preferredReportType: type.id }))}
                        className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                            : "bg-white dark:bg-[#070c18] border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{type.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{type.desc}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10: ADDITIONAL NOTES */}
          <section className="space-y-3 bg-slate-50/50 dark:bg-[#0f172a]/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center">10</span>
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Additional Notes & Observations</h3>
            </div>

            <textarea
              rows={2}
              placeholder="Any specific family history, health history, or site observations noted during initial discussion..."
              value={formData.additionalNotes}
              onChange={(e) => handleDataChange(prev => ({ ...prev, additionalNotes: e.target.value }))}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070c18] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </section>

          {/* OFFICIAL STRUCTURED DISCOVERY SUMMARY CARD */}
          {validation.summary && (
            <section className="space-y-3 bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileType className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Official KIE Discovery Summary Context
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                  Ready for Downstream KIE Modules
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-white/80 dark:bg-[#070c18]/80 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 block">Client Identity</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{validation.summary.clientName}</span>
                  <span className="text-[10px] text-slate-500 block">{validation.summary.cityAndCountry}</span>
                </div>

                <div className="bg-white/80 dark:bg-[#070c18]/80 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 block">Property & Ownership</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{validation.summary.propertyCategory}</span>
                  <span className="text-[10px] text-slate-500 block">{validation.summary.ownership}</span>
                </div>

                <div className="bg-white/80 dark:bg-[#070c18]/80 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 block">Occupants Breakdown</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{validation.summary.familySummary.totalMembers} Members</span>
                  <span className="text-[10px] text-slate-500 block">{validation.summary.familySummary.breakdownText}</span>
                </div>

                <div className="bg-white/80 dark:bg-[#070c18]/80 p-2.5 rounded-lg border border-emerald-500/20 col-span-1 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block">Primary Goals & Problems</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block truncate">{validation.summary.primaryProblems.join(", ")}</span>
                  <span className="text-[10px] text-slate-500 block truncate">"{validation.summary.primaryGoals}"</span>
                </div>

                <div className="bg-white/80 dark:bg-[#070c18]/80 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 block">Report Config</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{validation.summary.preferredLanguage}</span>
                  <span className="text-[10px] text-slate-500 block">{validation.summary.preferredReportType}</span>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* FOOTER BAR */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveAndProceed}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
          >
            <span>Save Client Discovery & Proceed</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

