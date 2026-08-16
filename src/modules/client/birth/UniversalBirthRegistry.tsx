import React, { useState, useEffect } from "react";
import { Client, Property } from "../../../types/app";
import { Save, AlertCircle, Edit, Globe, Calendar, CheckSquare, Clock } from "lucide-react";
import { BirthProfileCard } from "./BirthProfileCard";
import { BirthVerificationPanel } from "./BirthVerificationPanel";
import { BirthLocationSelector, LocationData } from "./BirthLocationSelector";
import { BirthDataValidator } from "./BirthDataValidator";
import { BirthAuditTimeline } from "./BirthAuditTimeline";
import { SmartDOBInput } from "../../../components/SmartDOBInput";

interface UniversalBirthRegistryProps {
  client: Client;
  properties: Property[];
  onUpdateClient: (updatedClient: Client) => Promise<any>;
}

export const UniversalBirthRegistry: React.FC<UniversalBirthRegistryProps> = ({
  client,
  properties,
  onUpdateClient
}) => {
  // Local edit states
  const [name, setName] = useState(client.name || "");
  const [gender, setGender] = useState(client.gender || "Male");
  const [dob, setDob] = useState(client.dob || "");
  const [birthTime, setBirthTime] = useState(client.birthTime || "");
  const [birthPlace, setBirthPlace] = useState(client.birthPlace || "");
  const [country, setCountry] = useState(client.country || "");
  const [state, setState] = useState(client.state || "");
  const [city, setCity] = useState(client.city || "");
  const [latitude, setLatitude] = useState<number | undefined>(client.birthLatitude);
  const [longitude, setLongitude] = useState<number | undefined>(client.birthLongitude);
  const [timezone, setTimezone] = useState(client.birthTimezone || "Asia/Kolkata");
  const [accuracy, setAccuracy] = useState<"Exact" | "Approximate" | "Unknown">(client.birthTimeAccuracy || "User Entered" as any || "Exact");
  const [status, setStatus] = useState<"Verified" | "User Entered" | "Incomplete">(client.birthDataStatus || "User Entered");
  const [preferredLanguage, setPreferredLanguage] = useState(client.preferredLanguage || client.language || "English");
  const [auditLogs, setAuditLogs] = useState<any[]>(client.birthAuditLog || []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showRecalculate, setShowRecalculate] = useState(false);

  // Sync state with client changes
  useEffect(() => {
    setName(client.name || "");
    setGender(client.gender || "Male");
    setDob(client.dob || "");
    setBirthTime(client.birthTime || "");
    setBirthPlace(client.birthPlace || "");
    setCountry(client.country || "");
    setState(client.state || "");
    setCity(client.city || "");
    setLatitude(client.birthLatitude);
    setLongitude(client.birthLongitude);
    setTimezone(client.birthTimezone || "Asia/Kolkata");
    setAccuracy(client.birthTimeAccuracy || "Exact");
    setStatus(client.birthDataStatus || "User Entered");
    setPreferredLanguage(client.preferredLanguage || client.language || "English");
    setAuditLogs(client.birthAuditLog || []);
  }, [client]);

  // Push an item to the Audit log
  const pushAuditLog = (action: string, details: string) => {
    const newLog = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      operator: "ADMIN",
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Set birth time as unknown explicitly
  const handleSetBirthTimeUnavailable = () => {
    setBirthTime("Unknown / Not Available");
    setAccuracy("Unknown");
    pushAuditLog("Field Cleared", "Birth Time flagged as Unknown / Not Available.");
  };

  // Location Selector callback
  const handleLocationSelected = (loc: LocationData) => {
    setBirthPlace(loc.city);
    setCity(loc.city);
    setState(loc.state);
    setCountry(loc.country);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setTimezone(loc.timezone);
    pushAuditLog("Location Updated", `Birth Place resolved to ${loc.city}, ${loc.country} with coordinates N:${loc.latitude.toFixed(4)}, E:${loc.longitude.toFixed(4)}.`);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(false);

    // Mandatories Validation
    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (!dob) {
      setError("Date of Birth is required.");
      return;
    }
    if (!birthTime) {
      setError("Birth Time is required. Select 'Unknown / Not Available' if unavailable.");
      return;
    }
    if (!birthPlace.trim()) {
      setError("Birth Place is required.");
      return;
    }

    setSaving(true);

    const birthDataChanged = client.dob !== dob || client.birthTime !== birthTime || client.birthPlace !== birthPlace;
    
    const updatedClient: Client = {
      ...client,
      name,
      gender,
      dob,
      birthTime,
      birthPlace,
      country,
      state,
      city,
      birthLatitude: latitude,
      birthLongitude: longitude,
      birthTimezone: timezone,
      birthTimeAccuracy: accuracy,
      birthDataStatus: status,
      preferredLanguage,
      language: preferredLanguage, // keep back-compatibility
      birthAuditLog: auditLogs.length > 0 ? auditLogs : [
        {
          id: `audit_initial_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "Registry Created",
          operator: "ADMIN",
          details: "Created single source of truth for all Vastu, Numerology & Lal Kitab modules."
        }
      ]
    };

    try {
      await onUpdateClient(updatedClient);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      if (birthDataChanged) {
        setShowRecalculate(true);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save birth registry changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="universal-birth-registry-workspace">
      {/* Overview Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-rose-500 animate-spin-slow" />
            Universal Birth Registry
          </h3>
          <p className="text-[10.5px] font-mono text-slate-400 mt-0.5">
            SINGLE SOURCE OF TRUTH (SSoT) FOR CELESTIAL & COORDINATE DATA
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-950/20"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "SAVING..." : "SAVE REGISTRY"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/35 border border-rose-900/60 text-rose-400 text-xs rounded-lg flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-950/35 border border-emerald-900/60 text-emerald-400 text-xs rounded-lg flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Registry database successfully synced with Cloud State!</span>
        </div>
      )}

      {showRecalculate && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4 mb-6">
          <div>
            <h4 className="text-amber-900 font-bold text-sm">Birth information has changed.</h4>
            <p className="text-amber-700 text-xs mt-1">Numerology, Lal Kitab and generated reports may require recalculation.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setShowRecalculate(false)} className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-colors">Later</button>
            <button onClick={() => setShowRecalculate(false)} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 shadow-sm transition-colors">Recalculate Now</button>
          </div>
        </div>
      )}

      {/* Main Double Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Editor Forms */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-5 bg-white/25 border border-slate-200 rounded-xl space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest border-b border-slate-950 pb-2 flex items-center gap-1.5">
              <Edit className="w-4 h-4 text-emerald-400" />
              Core Identity Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value !== client.name) {
                      pushAuditLog("Name Modified", `Name edited from '${client.name}' to '${e.target.value}'.`);
                    }
                  }}
                  required
                  placeholder="Full Legal/Core Name"
                  className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    pushAuditLog("Gender Updated", `Gender updated to ${e.target.value}.`);
                  }}
                  className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="col-span-1 sm:col-span-2">
                <SmartDOBInput
                  value={dob}
                  onChange={(val) => {
                    setDob(val);
                    pushAuditLog("DOB Modified", `Date of Birth updated to ${val}.`);
                  }}
                  required
                />
              </div>

              {/* Birth Time */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Birth Time *</label>
                  <button
                    type="button"
                    onClick={handleSetBirthTimeUnavailable}
                    className="text-[9px] text-rose-400 hover:text-slate-900 underline cursor-pointer"
                  >
                    Set Unknown
                  </button>
                </div>
                <input
                  type={birthTime === "Unknown / Not Available" ? "text" : "time"}
                  value={birthTime}
                  onChange={(e) => {
                    setBirthTime(e.target.value);
                    pushAuditLog("Birth Time Modified", `Birth Time updated to ${e.target.value}.`);
                  }}
                  required
                  className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Preferred Language */}
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Preferred Language for Scripture reports</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => {
                    setPreferredLanguage(e.target.value);
                    pushAuditLog("Language Updated", `Set scripture report preference language to ${e.target.value}.`);
                  }}
                  className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi / हिन्दी</option>
                  <option value="Sanskrit">Sanskrit / संस्कृतम्</option>
                </select>
              </div>
            </div>
          </div>

          {/* Smart Location Selector Section */}
          <BirthLocationSelector
            initialCity={birthPlace}
            initialState={state}
            initialCountry={country}
            initialLat={latitude}
            initialLng={longitude}
            initialTimezone={timezone}
            onSelectLocation={handleLocationSelected}
          />

          {/* Astro Verification Status panel */}
          <BirthVerificationPanel
            client={{
              ...client,
              birthTimeAccuracy: accuracy,
              birthDataStatus: status
            }}
            onUpdate={async (updatedFields, msg) => {
              if (updatedFields.birthTimeAccuracy) setAccuracy(updatedFields.birthTimeAccuracy);
              if (updatedFields.birthDataStatus) setStatus(updatedFields.birthDataStatus);
              pushAuditLog("Verification Update", msg);
            }}
          />
        </form>

        {/* Right Column: Visualizer, Validator, & Audit Trail */}
        <div className="space-y-5">
          {/* Birth Profile Card Visual Summary */}
          <BirthProfileCard
            client={{
              ...client,
              name,
              gender,
              dob,
              birthTime,
              birthPlace,
              country,
              state,
              city,
              birthLatitude: latitude,
              birthLongitude: longitude,
              birthTimezone: timezone,
              birthTimeAccuracy: accuracy,
              birthDataStatus: status,
              preferredLanguage
            }}
          />

          {/* Birth Data Validator (Progress Tracker) */}
          <BirthDataValidator
            client={{
              ...client,
              name,
              gender,
              dob,
              birthTime,
              birthPlace,
              country,
              state,
              city,
              birthLatitude: latitude,
              birthLongitude: longitude,
              birthTimezone: timezone,
              birthTimeAccuracy: accuracy,
              birthDataStatus: status,
              preferredLanguage
            }}
            properties={properties}
            onSetBirthTimeUnavailable={handleSetBirthTimeUnavailable}
          />

          {/* Audit Logs Timeline */}
          <BirthAuditTimeline
            client={{
              ...client,
              birthAuditLog: auditLogs
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UniversalBirthRegistry;
