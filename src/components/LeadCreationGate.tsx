import React, { useState } from "react";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  Building2, 
  Upload, 
  ChevronRight, 
  FileText, 
  KeyRound,
  Compass,
  PenTool
} from "lucide-react";
import { identityService } from "../services/identityService";
import { Identity, IdentityProperty } from "../types/identity";

interface LeadCreationGateProps {
  analysisType: "VASTU" | "NUMEROLOGY" | "LAL_KITAB";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (identity: Identity, property?: IdentityProperty) => void;
}

export default function LeadCreationGate({ 
  analysisType, 
  isOpen, 
  onClose, 
  onSuccess 
}: LeadCreationGateProps) {
  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Lead Details, 2: OTP, 3: Property (only if Vastu)
  
  // Error / Status State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Field values
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // OTP state
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  
  // Property state (for Vastu)
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("Residential");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [floorPlanMethod, setFloorPlanMethod] = useState<"UPLOAD" | "DRAW">("UPLOAD");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Step 1 - Identity Creation & Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full Name is mandatory before starting any analysis.");
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setError("A valid Mobile Number is mandatory before starting any analysis.");
      return;
    }
    if (!dob) {
      setError("Date of Birth is mandatory before starting any analysis.");
      return;
    }
    if (!timeOfBirth) {
      setError("Time of Birth is mandatory.");
      return;
    }
    if (!placeOfBirth.trim()) {
      setError("Place of Birth is mandatory.");
      return;
    }
    if (!privacyAccepted || !termsAccepted) {
      setError("You must accept the Privacy Policy and Terms of Service.");
      return;
    }

    try {
      setLoading(true);
      // Simulate sending OTP
      const code = await identityService.requestOtp(mobileNumber);
      setSimulatedOtp(code);
      setSuccessMsg(`Simulated OTP sent successfully!`);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to trigger OTP verification.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2 - Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!enteredOtp || enteredOtp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP code.");
      return;
    }

    try {
      setLoading(true);
      const isValid = await identityService.verifyOtp(mobileNumber, enteredOtp);
      if (isValid) {
        setSuccessMsg("Mobile number verified successfully!");
        if (analysisType === "VASTU") {
          // If Vastu is selected, proceed to property details step
          setStep(3);
        } else {
          // Numerology or Lal Kitab completes here!
          completeLeadRegistration(true);
        }
      } else {
        setOtpError("Incorrect OTP entered. Use the simulated code shown above.");
      }
    } catch (err: any) {
      setOtpError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3 - Submit Property and Complete Vastu
  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!propertyName.trim()) {
      setError("Property Name is required.");
      return;
    }
    if (!address.trim() || !city.trim() || !state.trim()) {
      setError("Complete address details (Address, City, State) are required.");
      return;
    }

    completeLeadRegistration(false);
  };

  const completeLeadRegistration = async (isDirect: boolean) => {
    try {
      setLoading(true);
      
      // Create Central Identity
      const identity = await identityService.createVisitorLead({
        fullName,
        mobileNumber,
        email: email || undefined,
        dob,
        timeOfBirth,
        placeOfBirth,
        privacyPolicyAccepted: true,
        termsAccepted: true,
        otpVerified: true
      });

      let property: IdentityProperty | undefined;

      // If Vastu property details were filled
      if (analysisType === "VASTU") {
        property = await identityService.addPropertyToIdentity({
          identityId: identity.id,
          propertyName,
          propertyType,
          address,
          city,
          state,
          country,
          floorPlanUrl: uploadedFileName || "floorplan_v1.png",
          drawnFloorPlan: floorPlanMethod === "DRAW"
        });

        // Also add System follow-up & default notes
        await identityService.addFollowUpToIdentity({
          identityId: identity.id,
          topic: `Initial Vastu Consultation & Remedy Check`,
          notes: `Self-registered through visitor Vastu portal for property: ${propertyName}`
        });

        await identityService.addNoteToIdentity({
          identityId: identity.id,
          content: `Visitor initiated Vastu analysis on property: ${propertyName}. Floor Plan Method: ${floorPlanMethod}`,
          author: "Visitor Web Portal"
        });
      } else {
        await identityService.addNoteToIdentity({
          identityId: identity.id,
          content: `Visitor initiated ${analysisType} calculation. Birth values recorded: ${dob} @ ${timeOfBirth} (${placeOfBirth})`,
          author: "Visitor Web Portal"
        });
      }

      // Transition life cycle status to "FREE_ANALYSIS_COMPLETED"
      const updatedIdentity = await identityService.updateLifecycleStatus(identity.id, "FREE_ANALYSIS_COMPLETED");
      
      // Fire success callback
      onSuccess(updatedIdentity, property);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during lead processing.");
    } finally {
      setLoading(false);
    }
  };

  const simulateFileUpload = () => {
    setUploadedFileName(`blueprint_draft_${Math.floor(1000 + Math.random() * 9000)}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative">
          <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold rounded-full uppercase tracking-wider absolute top-6 right-6">
            Gate Active
          </span>
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Identity Authentication Gate</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            URJAFLUX Lead Intelligence Protocol requires verification before initiating <strong className="text-emerald-400 font-bold">{analysisType}</strong> diagnostics.
          </p>

          {/* PROGRESS INDICATION */}
          <div className="flex items-center gap-1.5 mt-4">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-emerald-400" : "bg-slate-700"}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-emerald-400" : "bg-slate-700"}`}></div>
            <div className={`h-1 flex-1 rounded-full ${analysisType === "VASTU" ? (step >= 3 ? "bg-emerald-400" : "bg-slate-700") : "hidden"}`}></div>
          </div>
        </div>

        {/* CONTENT CHANNELS */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: IDENTITY DATA COLLECTION */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">
                Step 1: Mandatory Demographic Profile
              </h3>

              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shreya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (OTP Verification) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g. shreya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Birth Registry Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Time of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="time"
                        required
                        value={timeOfBirth}
                        onChange={(e) => setTimeOfBirth(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Place of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="City, State, Country (e.g. New Delhi, India)"
                      value={placeOfBirth}
                      onChange={(e) => setPlaceOfBirth(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 leading-normal">
                    I accept the privacy policy of URJAFLUX AI OS, consenting to have my birth coordinate details secured in compliance with local regulations.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 leading-normal">
                    I accept the terms of service, agreeing to use this diagnostic report as an advisory framework.
                  </span>
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>REQUEST VERIFICATION OTP</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: SIMULATED OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">
                Step 2: Enter Secure Verification Code
              </h3>

              {/* SIMULATED OTP DISPLAY NOTICE CHIP */}
              {simulatedOtp && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>[SANDBOX SIMULATION] OTP Broadcaster</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    A secure authentication channel transmitted code:
                  </p>
                  <div className="text-lg font-mono font-black tracking-[0.3em] text-slate-900 bg-white/70 py-1.5 px-3 rounded text-center border border-amber-100">
                    {simulatedOtp}
                  </div>
                </div>
              )}

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Verification OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit code"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full tracking-[0.5em] text-center font-mono py-3 text-lg border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  VERIFY & PROCEED
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: VASTU PROPERTY COLLECTOR */}
          {step === 3 && (
            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">
                Step 3: Collect Property Information
              </h3>

              <div className="space-y-3">
                {/* Property Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dwarka Flat, Lotus Heights"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Agricultural">Agricultural</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-402, Sector 15, Dwarka"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>

                {/* City, State, Country Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Floor Plan Preference */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Floor Plan Delivery
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setFloorPlanMethod("UPLOAD")}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        floorPlanMethod === "UPLOAD"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Blueprint</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFloorPlanMethod("DRAW")}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        floorPlanMethod === "DRAW"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Draw Floor Plan</span>
                    </button>
                  </div>

                  {floorPlanMethod === "UPLOAD" ? (
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center space-y-2">
                      <div className="w-10 h-10 bg-slate-200/60 rounded-full flex items-center justify-center mx-auto text-slate-500">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={simulateFileUpload}
                          className="text-xs bg-white hover:bg-slate-100 border border-slate-200 py-1 px-3 rounded font-bold cursor-pointer text-slate-700"
                        >
                          Select PDF / Image Blueprint
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DWG, PNG, or JPG up to 10MB</p>
                      </div>
                      {uploadedFileName && (
                        <div className="mt-2 py-1 px-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono rounded flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{uploadedFileName} uploaded</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center space-y-2">
                      <div className="w-10 h-10 bg-slate-200/60 rounded-full flex items-center justify-center mx-auto text-slate-500 animate-pulse">
                        <Compass className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Studio Interactive Drawing Canvas</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Ready to launch the custom vector segmenter tool once this registration finishes.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  LAUNCH ANALYSIS
                </button>
              </div>
            </form>
          )}
        </div>

        {/* SECURE BLOCK FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>URJAFLUX SCRIPTURE CORE V2 DATA COMPLIANCE SHIELD</span>
        </div>
      </div>
    </div>
  );
}
