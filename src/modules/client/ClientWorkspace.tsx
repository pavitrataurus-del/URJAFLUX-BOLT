import React, { useState, useEffect } from "react";
import { Client, Property, ProjectReport } from "../../types/app";
import { ClientProvider, useUCMS } from "./ClientContext";
import { ClientList } from "./ClientList";
import { ClientSearch } from "./ClientSearch";
import { ClientFilters, FilterOptions } from "./ClientFilters";
import { ClientDashboard } from "./ClientDashboard";
import { useTranslation } from "../../localization/hooks/useTranslation";
import { Users, Plus, X, Search, Filter, Calendar } from "lucide-react";
import { BirthLocationSelector } from "./birth/BirthLocationSelector";
import { SmartDOBInput } from "../../components/SmartDOBInput";

interface ClientWorkspaceProps {
  initialClients?: Client[];
  initialProperties?: Property[];
  initialReports?: ProjectReport[];
  onClientsChange?: (clients: Client[]) => void;
  onPropertiesChange?: (properties: Property[]) => void;
  onReportsChange?: (reports: ProjectReport[]) => void;
  onNavigateToReports?: (reportId: string) => void;
  startWithAddClient?: boolean;
  clearStartWithAddClient?: () => void;
}

const ClientWorkspaceInner: React.FC<{
  onNavigateToReports?: (reportId: string) => void;
  startWithAddClient?: boolean;
  clearStartWithAddClient?: () => void;
}> = ({ onNavigateToReports, startWithAddClient, clearStartWithAddClient }) => {
  const { t } = useTranslation();
  const { 
    clients, 
    properties, 
    reports, 
    activeClientId, 
    setActiveClientId, 
    activeClient,
    addClient,
    updateClient,
    deleteClient,
    addProperty,
    deleteProperty
  } = useUCMS();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    status: "All",
    propertyCount: "All",
    consultationType: "All",
    joinedPeriod: "All"
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalClient, setModalClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"Active" | "Pending" | "Inactive">("Active");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [notes, setNotes] = useState("");

  // Onboarding Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Step 2 Birth state
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthLatitude, setBirthLatitude] = useState<number | undefined>(undefined);
  const [birthLongitude, setBirthLongitude] = useState<number | undefined>(undefined);
  const [birthTimezone, setBirthTimezone] = useState("Asia/Kolkata");
  const [birthTimeAccuracy, setBirthTimeAccuracy] = useState<"Exact" | "Approximate" | "Unknown">("Exact");

  // Step 3 Property state
  const [assignProperty, setAssignProperty] = useState(false);
  const [propName, setPropName] = useState("");
  const [propAddress, setPropAddress] = useState("");
  const [propPlotSize, setPropPlotSize] = useState("");
  const [propFloors, setPropFloors] = useState(1);
  const [propFacing, setPropFacing] = useState("North");

  // Trigger wizard if started from dashboard or elsewhere
  useEffect(() => {
    if (startWithAddClient) {
      handleOpenWizard();
      if (clearStartWithAddClient) {
        clearStartWithAddClient();
      }
    }
  }, [startWithAddClient]);

  const handleOpenWizard = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setStatus("Active");
    setPreferredLanguage("English");
    setNotes("");

    setGender("Male");
    setDob("");
    setBirthTime("");
    setBirthPlace("");
    setBirthLatitude(undefined);
    setBirthLongitude(undefined);
    setBirthTimezone("Asia/Kolkata");
    setBirthTimeAccuracy("Exact");

    setAssignProperty(false);
    setPropName("");
    setPropAddress("");
    setPropPlotSize("");
    setPropFloors(1);
    setPropFacing("North");

    setWizardStep(1);
    setShowWizard(true);
  };

  const handleOpenAdd = () => {
    handleOpenWizard();
  };

  const handleOpenEdit = (client: Client) => {
    setModalClient(client);
    setName(client.name || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setCompany(client.company || "");
    setStatus(client.status || "Active");
    setPreferredLanguage(client.language || "English");
    setNotes(client.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      phone,
      company,
      status,
      language: preferredLanguage,
      notes,
    };

    try {
      if (modalClient) {
        // Edit mode
        await updateClient({
          ...modalClient,
          ...payload
        });
      } else {
        // Add mode
        await addClient(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  const handleFinishWizard = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill in all required fields marked with * in Step 1 (Name, Email, Phone).");
      setWizardStep(1);
      return;
    }

    const isBirthComplete = dob && birthTime && birthPlace && birthPlace.trim() !== "";
    const birthStatusVal = isBirthComplete ? "Verified" : "Incomplete";

    const clientPayload: Omit<Client, "id" | "joinedDate"> = {
      name,
      email,
      phone,
      company,
      status,
      language: preferredLanguage,
      notes,
      gender,
      dob: dob || undefined,
      birthTime: birthTime || undefined,
      birthPlace: birthPlace || undefined,
      birthLatitude,
      birthLongitude,
      birthTimezone,
      birthTimeAccuracy,
      birthDataStatus: birthStatusVal as any,
      birthAuditLog: [
        {
          id: `audit_initial_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "Client Onboarded",
          operator: "ADMIN",
          details: `Client profile registered through Guided Onboarding Wizard. Birth Registry status: ${birthStatusVal}.`
        }
      ]
    };

    try {
      // 1. Create client
      const newClient = await addClient(clientPayload);
      
      // 2. Assign property if requested
      if (assignProperty && propName.trim() && propAddress.trim()) {
        await addProperty({
          name: propName,
          address: propAddress,
          plotSize: propPlotSize || "Not Specified",
          floors: propFloors || 1,
          facingDirection: propFacing,
          clientId: newClient.id,
          ownerName: newClient.name,
          constructionStatus: "Completed",
          consultationStatus: "Pending"
        });
      }

      // 3. Automatically open Client Dossier (Dossier Overview)
      setActiveClientId(newClient.id);
      
      // Close wizard
      setShowWizard(false);
    } catch (err) {
      console.error("Error onboarding client through wizard:", err);
      alert("Failed to onboard client. Please check your fields and try again.");
    }
  };

  const handleResetFilters = () => {
    setFilters({
      status: "All",
      propertyCount: "All",
      consultationType: "All",
      joinedPeriod: "All"
    });
    setSearchQuery("");
  };

  // Filter clients dynamically
  const filteredClients = clients.filter(client => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = client.name?.toLowerCase().includes(query);
      const matchesEmail = client.email?.toLowerCase().includes(query);
      const matchesPhone = client.phone?.toLowerCase().includes(query);
      const matchesCity = client.city?.toLowerCase().includes(query) || false;
      if (!matchesName && !matchesEmail && !matchesPhone && !matchesCity) {
        return false;
      }
    }

    // 2. Status Filter
    if (filters.status !== "All" && client.status !== filters.status) {
      return false;
    }

    // 3. Property Count Filter
    const clientProperties = properties.filter(p => p.clientId === client.id);
    if (filters.propertyCount === "Has Properties" && clientProperties.length === 0) {
      return false;
    }
    if (filters.propertyCount === "No Properties" && clientProperties.length > 0) {
      return false;
    }

    // 4. Consultation Type Filter
    if (filters.consultationType !== "All") {
      const hasType = client.consultationHistory?.some(c => c.type === filters.consultationType);
      if (!hasType) return false;
    }

    // 5. Joined Period Filter
    if (filters.joinedPeriod !== "All") {
      const joinedDate = new Date(client.joinedDate);
      const now = new Date();
      if (filters.joinedPeriod === "This Month") {
        const isThisMonth = joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear();
        if (!isThisMonth) return false;
      }
      if (filters.joinedPeriod === "This Year") {
        const isThisYear = joinedDate.getFullYear() === now.getFullYear();
        if (!isThisYear) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {activeClient ? (
        <ClientDashboard
          client={activeClient}
          properties={properties}
          reports={reports}
          onBack={() => setActiveClientId(null)}
          onUpdateClient={updateClient}
          onAddProperty={addProperty}
          onDeleteProperty={deleteProperty}
          onNavigateToReports={onNavigateToReports}
        />
      ) : showWizard ? (
        <div className="space-y-6 max-w-4xl mx-auto" id="client-registration-wizard-container">
          {/* Wizard Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-slate-900 shadow-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Client Onboarding Wizard
                </h2>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  STEP {wizardStep} OF 3 • SYSTEM SETUP
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWizard(false)}
              className="px-3 py-1.5 bg-white hover:bg-slate-850 text-slate-400 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            >
              QUIT WIZARD
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: 1, label: "1. Personal Info" },
              { step: 2, label: "2. Birth Registry" },
              { step: 3, label: "3. Property Setup" }
            ].map((s) => (
              <div key={s.step} className="space-y-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    wizardStep >= s.step ? "bg-emerald-500" : "bg-white"
                  }`}
                />
                <span className={`block text-[10px] font-mono uppercase text-center ${
                  wizardStep === s.step ? "text-emerald-400 font-bold" : "text-slate-600"
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Wizard Step Panel */}
          <div className="bg-slate-50/40 border border-slate-200/80 p-6 rounded-xl space-y-6">
            
            {/* STEP 1: PERSONAL INFORMATION */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 text-left">
                  <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    Step 1: Personal Profile Information
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Onboard new customer identification profiles. Email, phone, and name are critical database indexes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vardhan Sharma"
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. vardhan@sharma.com"
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Phone Number *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Company / Organization</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Sharma Spiritual Veda Group"
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Initial Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="Active">Active / Onboarded</option>
                      <option value="Pending">Pending / Verification</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Preferred Consultation Language</label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi / हिन्दी</option>
                      <option value="Sanskrit">Sanskrit / संस्कृतम्</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Consultation Context Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Provide spiritual biography, current life roadblocks, or focus details..."
                    className="w-full bg-slate-50 text-xs text-slate-200 p-3.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: UNIVERSAL BIRTH REGISTRY */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                      Step 2: Universal Birth Registry SSoT Parameters
                    </h3>
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                      Sprint 13 Compliant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Astro-computations require accurate birth time and geographical coordinates to determine Lal Kitab cosmic houses.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <SmartDOBInput
                      value={dob}
                      onChange={setDob}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Birth Time (Local)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setBirthTime("Unknown / Not Available");
                          setBirthTimeAccuracy("Unknown");
                        }}
                        className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300"
                      >
                        MARK UNKNOWN
                      </button>
                    </div>
                    <input
                      type="text"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      placeholder="e.g. 05:31 (24h format) or Unknown"
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Time Accuracy Tier</label>
                    <select
                      value={birthTimeAccuracy}
                      onChange={(e) => setBirthTimeAccuracy(e.target.value as any)}
                      className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-medium font-mono"
                    >
                      <option value="Exact">Exact (Hospital record-level precision)</option>
                      <option value="Approximate">Approximate (Recalled / Rectified)</option>
                      <option value="Unknown">Unknown / Flagged for rectification</option>
                    </select>
                  </div>
                </div>

                {/* Location Resolution Selector */}
                <div className="space-y-3 pt-4 border-t border-slate-200 text-left">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Geographical Coordinate Resolution
                  </h4>
                  <BirthLocationSelector
                    initialCity={birthPlace}
                    initialLat={birthLatitude}
                    initialLng={birthLongitude}
                    initialTimezone={birthTimezone}
                    onSelectLocation={(loc) => {
                      setBirthPlace(loc.city);
                      setBirthLatitude(loc.latitude);
                      setBirthLongitude(loc.longitude);
                      setBirthTimezone(loc.timezone);
                    }}
                  />
                  {birthPlace && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-emerald-300 flex items-center justify-between gap-2 animate-fade-in">
                      <span>RESOLVED PLACE: <strong>{birthPlace.toUpperCase()}</strong></span>
                      <span>LAT: {birthLatitude?.toFixed(4) ?? "N/A"} • LNG: {birthLongitude?.toFixed(4) ?? "N/A"} • {birthTimezone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: PROPERTY ASSIGNMENT */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 text-left">
                  <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    Step 3: Immediate Property Assignment (Optional)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Registering their residence or corporate office lets you calculate magnetic deviations and directional compass offsets right away.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-emerald-950/15 border border-emerald-900/40 p-4 rounded-xl text-left">
                  <input
                    type="checkbox"
                    id="assignPropertyCheckbox"
                    checked={assignProperty}
                    onChange={(e) => setAssignProperty(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-200 bg-slate-50 rounded cursor-pointer"
                  />
                  <div>
                    <label htmlFor="assignPropertyCheckbox" className="text-xs font-mono text-slate-900 font-bold uppercase cursor-pointer select-none">
                      Enable Property Assignment
                    </label>
                    <p className="text-[10.5px] text-emerald-400/80 font-sans mt-0.5">
                      Check this to enter their primary Vastu property parameters immediately.
                    </p>
                  </div>
                </div>

                {assignProperty && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Property Label Name *</label>
                      <input
                        type="text"
                        value={propName}
                        onChange={(e) => setPropName(e.target.value)}
                        required={assignProperty}
                        placeholder="e.g. Vardhan Villa Delhi"
                        className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Site Physical Address *</label>
                      <input
                        type="text"
                        value={propAddress}
                        onChange={(e) => setPropAddress(e.target.value)}
                        required={assignProperty}
                        placeholder="e.g. Sector-15, Dwarka, Delhi"
                        className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Plot / Plot Size (sq.ft.)</label>
                      <input
                        type="text"
                        value={propPlotSize}
                        onChange={(e) => setPropPlotSize(e.target.value)}
                        placeholder="e.g. 2400 sq.ft."
                        className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Total Floors Count</label>
                      <input
                        type="number"
                        min={1}
                        value={propFloors}
                        onChange={(e) => setPropFloors(Number(e.target.value))}
                        className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Primary Facing Direction</label>
                      <select
                        value={propFacing}
                        onChange={(e) => setPropFacing(e.target.value)}
                        className="w-full bg-slate-50 text-xs text-slate-200 px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="North">North (Resonant with Kuber / Kubera)</option>
                        <option value="East">East (Resonant with Indra / Aditya)</option>
                        <option value="West">West (Resonant with Varun)</option>
                        <option value="South">South (Resonant with Yama / Agni)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wizard Footer Controls */}
          <div className="flex justify-between items-center bg-white/50 border border-slate-200 p-4 rounded-xl">
            <button
              type="button"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep((prev) => prev - 1)}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 transition-all ${
                wizardStep === 1
                  ? "bg-slate-50 text-slate-700 border-transparent cursor-not-allowed opacity-40"
                  : "bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-900 cursor-pointer"
              }`}
            >
              PREVIOUS
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="px-3.5 py-2 text-xs font-mono text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                CANCEL
              </button>

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1) {
                      if (!name.trim() || !email.trim() || !phone.trim()) {
                        alert("Name, Email, and Phone are required parameters to proceed.");
                        return;
                      }
                    }
                    setWizardStep((prev) => prev + 1);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all shadow-lg shadow-indigo-950/40"
                >
                  NEXT STEP
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all shadow-lg shadow-emerald-950/40"
                >
                  FINISH & REGISTER
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Search and Filters Grid */}
          <div className="flex flex-col md:flex-row gap-3">
            <ClientSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          <ClientFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />

          {/* Client Directory Listing */}
          <div className="pt-2">
            <ClientList
              clients={filteredClients}
              properties={properties}
              reports={reports}
              onSelectClient={setActiveClientId}
              
              onDeleteClient={deleteClient}
              onOpenAddModal={handleOpenAdd}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-950 p-4 bg-slate-50">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                {modalClient ? "Update Client Profile" : "Register New Client"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveClient} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Jane Doe"
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g., jane@doe.com"
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g., +1234567890"
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Company / Org</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., ACME Corp"
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Preferred Language */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi / हिन्दी</option>
                    <option value="Sanskrit">Sanskrit / संस्कृतम्</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Consultant Bio Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Private comments on client background, spiritual inclination, Veda parameters..."
                  className="w-full bg-slate-50 text-xs text-slate-200 p-3 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-950 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-900 border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs font-mono font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-lg transition-colors cursor-pointer text-xs font-mono font-bold shadow-md shadow-indigo-950/30"
                >
                  {modalClient ? "SAVE DETAILS" : "REGISTER CLIENT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const ClientWorkspace: React.FC<ClientWorkspaceProps> = ({
  initialClients,
  initialProperties,
  initialReports,
  onClientsChange,
  onPropertiesChange,
  onReportsChange,
  onNavigateToReports,
  startWithAddClient,
  clearStartWithAddClient
}) => {
  return (
    <ClientProvider
      initialClients={initialClients}
      initialProperties={initialProperties}
      initialReports={initialReports}
      onClientsChange={onClientsChange}
      onPropertiesChange={onPropertiesChange}
      onReportsChange={onReportsChange}
    >
      <ClientWorkspaceInner
        onNavigateToReports={onNavigateToReports}
        startWithAddClient={startWithAddClient}
        clearStartWithAddClient={clearStartWithAddClient}
      />
    </ClientProvider>
  );
};

export default ClientWorkspace;
