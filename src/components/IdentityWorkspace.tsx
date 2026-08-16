import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  Building, 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Plus, 
  UserCheck, 
  Activity, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileCheck,
  Compass,
  FileSpreadsheet
} from "lucide-react";
import { identityService } from "../services/identityService";
import { IdentityRepository } from "../repositories/identityRepository";
import { 
  Identity, 
  IdentityProperty, 
  IdentityReport, 
  IdentityConsultation, 
  IdentityFollowUp, 
  IdentityNote, 
  IdentityAppointment,
  IdentityType,
  LeadLifecycleStatus
} from "../types/identity";

const STATUS_ORDER: LeadLifecycleStatus[] = [
  "VISITOR",
  "LEAD_CREATED",
  "FREE_ANALYSIS_COMPLETED",
  "CONSULTATION_BOOKED",
  "CONSULTATION_COMPLETED",
  "CLIENT",
  "REPEAT_CLIENT",
  "INACTIVE"
];

export default function IdentityWorkspace() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | IdentityType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | LeadLifecycleStatus>("ALL");

  // Relationships of the selected identity
  const [properties, setProperties] = useState<IdentityProperty[]>([]);
  const [reports, setReports] = useState<IdentityReport[]>([]);
  const [consultations, setConsultations] = useState<IdentityConsultation[]>([]);
  const [followUps, setFollowUps] = useState<IdentityFollowUp[]>([]);
  const [notes, setNotes] = useState<IdentityNote[]>([]);
  const [appointments, setAppointments] = useState<IdentityAppointment[]>([]);

  // Modals for adding relations (Sandbox Simulation)
  const [activeTab, setActiveTab] = useState<"PROPERTIES" | "REPORTS" | "CONSULTATIONS" | "FOLLOW_UPS" | "NOTES" | "APPOINTMENTS">("PROPERTIES");
  const [isAddingRelation, setIsAddingRelation] = useState(false);

  // Form states for simulator
  const [newPropName, setNewPropName] = useState("");
  const [newPropType, setNewPropType] = useState("Residential");
  const [newPropAddress, setNewPropAddress] = useState("");
  const [newPropCity, setNewPropCity] = useState("");
  const [newPropState, setNewPropState] = useState("");
  
  const [newReportTitle, setNewReportTitle] = useState("");
  const [newReportType, setNewReportType] = useState<"VASTU" | "NUMEROLOGY" | "LAL_KITAB" | "COMPREHENSIVE">("VASTU");
  const [newReportNotes, setNewReportNotes] = useState("");

  const [newFollowUpTopic, setNewFollowUpTopic] = useState("");
  const [newFollowUpNotes, setNewFollowUpNotes] = useState("");

  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteAuthor, setNewNoteAuthor] = useState("Senior Consultant");

  const [newApptType, setNewApptType] = useState("Zoom Consultation");
  const [newApptTime, setNewApptTime] = useState("");
  const [newApptNotes, setNewApptNotes] = useState("");

  // Load identities
  const fetchIdentities = async () => {
    const list = await IdentityRepository.getInstance().getAllIdentities();
    setIdentities(list);
    if (list.length > 0 && !selectedIdentity) {
      setSelectedIdentity(list[0]);
    } else if (selectedIdentity) {
      const refreshed = list.find(i => i.id === selectedIdentity.id);
      if (refreshed) setSelectedIdentity(refreshed);
    }
  };

  useEffect(() => {
    fetchIdentities();
  }, []);

  // Fetch relations when selectedIdentity changes
  useEffect(() => {
    if (selectedIdentity) {
      const repo = IdentityRepository.getInstance();
      Promise.all([
        repo.getProperties(selectedIdentity.id),
        repo.getReports(selectedIdentity.id),
        repo.getConsultations(selectedIdentity.id),
        repo.getFollowUps(selectedIdentity.id),
        repo.getNotes(selectedIdentity.id),
        repo.getAppointments(selectedIdentity.id)
      ]).then(([props, reps, cons, fups, nts, appts]) => {
        setProperties(props);
        setReports(reps);
        setConsultations(cons);
        setFollowUps(fups);
        setNotes(nts);
        setAppointments(appts);
      });
    }
  }, [selectedIdentity]);

  // Handle manual Lifecycle Status transition simulation
  const handleTransitionStatus = async (status: LeadLifecycleStatus) => {
    if (!selectedIdentity) return;
    try {
      const updated = await identityService.updateLifecycleStatus(selectedIdentity.id, status);
      setSelectedIdentity(updated);
      await fetchIdentities();
    } catch (e) {
      console.error(e);
    }
  };

  // Add relations handlers
  const handleAddRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentity) return;

    try {
      if (activeTab === "PROPERTIES") {
        await identityService.addPropertyToIdentity({
          identityId: selectedIdentity.id,
          propertyName: newPropName,
          propertyType: newPropType,
          address: newPropAddress,
          city: newPropCity,
          state: newPropState,
          country: "India"
        });
        // Clear
        setNewPropName("");
        setNewPropAddress("");
        setNewPropCity("");
        setNewPropState("");
      } else if (activeTab === "REPORTS") {
        await identityService.addReportToIdentity({
          identityId: selectedIdentity.id,
          title: newReportTitle,
          type: newReportType,
          notes: newReportNotes
        });
        setNewReportTitle("");
        setNewReportNotes("");
      } else if (activeTab === "FOLLOW_UPS") {
        await identityService.addFollowUpToIdentity({
          identityId: selectedIdentity.id,
          topic: newFollowUpTopic,
          notes: newFollowUpNotes
        });
        setNewFollowUpTopic("");
        setNewFollowUpNotes("");
      } else if (activeTab === "NOTES") {
        await identityService.addNoteToIdentity({
          identityId: selectedIdentity.id,
          content: newNoteContent,
          author: newNoteAuthor
        });
        setNewNoteContent("");
      } else if (activeTab === "APPOINTMENTS") {
        await identityService.addAppointmentToIdentity({
          identityId: selectedIdentity.id,
          dateTime: newApptTime || new Date().toISOString(),
          durationMinutes: 45,
          type: newApptType,
          notes: newApptNotes
        });
        setNewApptTime("");
        setNewApptNotes("");
      }

      setIsAddingRelation(false);
      // Trigger reload of relations
      setSelectedIdentity({ ...selectedIdentity });
    } catch (err) {
      console.error(err);
    }
  };

  // Search and filter logic
  const filteredIdentities = identities.filter(i => {
    const matchesSearch = 
      i.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.mobileNumber.includes(searchQuery) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "ALL" || i.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: LeadLifecycleStatus) => {
    switch (status) {
      case "VISITOR": return "bg-blue-50 text-blue-700 border-blue-200";
      case "LEAD_CREATED": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "FREE_ANALYSIS_COMPLETED": return "bg-amber-50 text-amber-700 border-amber-200";
      case "CONSULTATION_BOOKED": return "bg-purple-50 text-purple-700 border-purple-200";
      case "CONSULTATION_COMPLETED": return "bg-teal-50 text-teal-700 border-teal-200";
      case "CLIENT": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REPEAT_CLIENT": return "bg-green-100 text-green-800 border-green-300";
      case "INACTIVE": return "bg-slate-100 text-slate-600 border-slate-200";
      default: return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h1 className="text-2xl font-bold font-serif text-slate-900">Identity Control & Lead Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            URJAFLUX Single Source of Truth database. Houses centralized core human profile records and links them directly to properties, reports, consultations, follow-ups, notes, and appointments without duplication.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-3 rounded-xl shrink-0">
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Total Unique Profiles</span>
            <span className="text-lg font-black text-slate-900 font-mono">{identities.length} Registered</span>
          </div>
        </div>
      </div>

      {/* BODY CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT BAR: MASTER DIRECTORY LISTING */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[750px] overflow-hidden">
          
          {/* SEARCH & FILTERS CONTAINER */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Identity ID, Name, Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
              />
            </div>

            {/* FILTER DROPDOWNS */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase mb-1">Entity Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full py-1 px-2 border border-slate-200 rounded text-[11px] focus:outline-none bg-white"
                >
                  <option value="ALL">All Types</option>
                  <option value="VISITOR">Visitor</option>
                  <option value="LEAD">Lead</option>
                  <option value="CLIENT">Client</option>
                  <option value="CONSULTANT">Consultant</option>
                  <option value="STAFF">Staff</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase mb-1">Lifecycle Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full py-1 px-2 border border-slate-200 rounded text-[11px] focus:outline-none bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="VISITOR">Visitor (Default)</option>
                  <option value="LEAD_CREATED">Lead Created</option>
                  <option value="FREE_ANALYSIS_COMPLETED">Free Analysis Done</option>
                  <option value="CONSULTATION_BOOKED">Consultation Booked</option>
                  <option value="CONSULTATION_COMPLETED">Consultation Completed</option>
                  <option value="CLIENT">Client Profile</option>
                  <option value="REPEAT_CLIENT">Repeat Client</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* LIST ITEMS */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredIdentities.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>No matching identities found.</span>
              </div>
            ) : (
              filteredIdentities.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedIdentity(item)}
                  className={`w-full text-left p-4 transition-colors flex items-start gap-3.5 hover:bg-slate-50/50 ${
                    selectedIdentity?.id === item.id ? "bg-emerald-50/40 border-r-4 border-emerald-500" : ""
                  }`}
                >
                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 font-serif shrink-0">
                    {item.fullName.charAt(0)}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.fullName}</h4>
                      <span className="font-mono text-[9px] text-slate-400 shrink-0 font-bold">{item.id}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{item.mobileNumber}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-mono rounded font-bold uppercase">
                        {item.type}
                      </span>
                      <span className={`px-1.5 py-0.5 border text-[9px] font-mono rounded font-bold uppercase ${getStatusColor(item.status)}`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT BAR: DETAILED RELATIONS & LIFECYCLE FLOW */}
        <div className="lg:col-span-7 space-y-6 h-[750px] overflow-y-auto pr-1">
          {selectedIdentity ? (
            <div className="space-y-6">
              
              {/* CENTRAL PROFILE DEMOGRAPHICS & LIFECYCLE PROGRESS CARD */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                
                {/* Profile Identity Headline */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg font-serif">
                      {selectedIdentity.fullName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold font-serif text-slate-900">{selectedIdentity.fullName}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono text-emerald-600 font-bold">{selectedIdentity.id}</span>
                        <span>•</span>
                        <span className="uppercase font-mono font-bold text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {selectedIdentity.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 items-start sm:items-end w-full sm:w-auto">
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Test Lifecycle Action</span>
                    <select
                      value={selectedIdentity.status}
                      onChange={(e) => handleTransitionStatus(e.target.value as LeadLifecycleStatus)}
                      className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-bold text-slate-700 w-full sm:w-auto cursor-pointer"
                    >
                      <option value="VISITOR">Visitor</option>
                      <option value="LEAD_CREATED">Lead Created</option>
                      <option value="FREE_ANALYSIS_COMPLETED">Free Analysis Completed</option>
                      <option value="CONSULTATION_BOOKED">Consultation Booked</option>
                      <option value="CONSULTATION_COMPLETED">Consultation Completed</option>
                      <option value="CLIENT">Client</option>
                      <option value="REPEAT_CLIENT">Repeat Client</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* MANDATORY DETAILS & BIRTH REGISTRY */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase">Mobile (Verified)</span>
                    <span className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedIdentity.mobileNumber}</span>
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase">Email Address</span>
                    <span className="text-xs text-slate-800 font-bold truncate block flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedIdentity.email || "Not Provided"}</span>
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase">Date of Birth</span>
                    <span className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedIdentity.dob || "N/A"}</span>
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase">Time of Birth</span>
                    <span className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedIdentity.timeOfBirth || "N/A"}</span>
                    </span>
                  </div>

                  <div className="space-y-0.5 col-span-2">
                    <span className="block text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase">Place of Birth</span>
                    <span className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedIdentity.placeOfBirth || "N/A"}</span>
                    </span>
                  </div>
                </div>

                {/* VISUAL LIFECYCLE MAP */}
                <div className="space-y-3">
                  <span className="block text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase">LEAD LIFECYCLE FLOW CHRONOLOGY</span>
                  
                  <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
                    {STATUS_ORDER.map((status, index) => {
                      const isActive = selectedIdentity.status === status;
                      const isPast = STATUS_ORDER.indexOf(selectedIdentity.status) >= index;

                      return (
                        <div key={status} className="flex-1 flex flex-row md:flex-col items-center gap-2 relative">
                          {/* Dot / Chip */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 transition-all ${
                            isActive 
                              ? "bg-emerald-600 text-white ring-4 ring-emerald-100" 
                              : isPast 
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                                : "bg-slate-100 text-slate-400"
                          }`}>
                            {isPast && !isActive ? "✓" : index + 1}
                          </div>

                          {/* Label */}
                          <div className="text-left md:text-center">
                            <span className={`block text-[9px] font-bold tracking-wide leading-none ${
                              isActive ? "text-emerald-700 font-black" : "text-slate-500"
                            }`}>
                              {status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RELATION RELATIONSHIPS INSPECTOR - ONE IDENTITY -> MANY RELATIONS */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                
                {/* Tabs to navigate relations */}
                <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/50">
                  <button
                    onClick={() => setActiveTab("PROPERTIES")}
                    className={`px-4 py-3 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shrink-0 transition-colors border-b-2 ${
                      activeTab === "PROPERTIES" 
                        ? "border-emerald-600 text-emerald-800 bg-white" 
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Properties ({properties.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("REPORTS")}
                    className={`px-4 py-3 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shrink-0 transition-colors border-b-2 ${
                      activeTab === "REPORTS" 
                        ? "border-emerald-600 text-emerald-800 bg-white" 
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Reports ({reports.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("FOLLOW_UPS")}
                    className={`px-4 py-3 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shrink-0 transition-colors border-b-2 ${
                      activeTab === "FOLLOW_UPS" 
                        ? "border-emerald-600 text-emerald-800 bg-white" 
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Follow Ups ({followUps.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("NOTES")}
                    className={`px-4 py-3 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shrink-0 transition-colors border-b-2 ${
                      activeTab === "NOTES" 
                        ? "border-emerald-600 text-emerald-800 bg-white" 
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Notes ({notes.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("APPOINTMENTS")}
                    className={`px-4 py-3 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shrink-0 transition-colors border-b-2 ${
                      activeTab === "APPOINTMENTS" 
                        ? "border-emerald-600 text-emerald-800 bg-white" 
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Appts ({appointments.length})</span>
                  </button>
                </div>

                <div className="p-6 min-h-[220px]">
                  
                  {/* TAB CONTENT: PROPERTIES */}
                  {activeTab === "PROPERTIES" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-400">Associated Physical Structures</h3>
                        <button
                          onClick={() => setIsAddingRelation(true)}
                          className="px-2.5 py-1 text-[10px] bg-slate-900 text-white font-mono rounded font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Link Property</span>
                        </button>
                      </div>

                      {properties.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No properties registered under this identity.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {properties.map(p => (
                            <div key={p.id} className="p-3.5 border border-slate-100 bg-slate-50 rounded-xl space-y-1.5 relative overflow-hidden">
                              <span className="absolute top-3.5 right-3.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[8px] font-mono font-bold rounded">
                                {p.propertyType}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900">{p.propertyName}</h4>
                              <p className="text-[11px] text-slate-500 flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                                <span>{p.address}, {p.city}, {p.state}</span>
                              </p>
                              {p.floorPlanUrl && (
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 border-t border-slate-200/60 pt-2 mt-2">
                                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{p.floorPlanUrl} {p.drawnFloorPlan ? "(Interactive Canvas)" : "(Uploaded blueprint)"}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: REPORTS */}
                  {activeTab === "REPORTS" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-400">Diagnostic Reports History</h3>
                        <button
                          onClick={() => setIsAddingRelation(true)}
                          className="px-2.5 py-1 text-[10px] bg-slate-900 text-white font-mono rounded font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Link Report</span>
                        </button>
                      </div>

                      {reports.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No reports registered under this identity.</p>
                      ) : (
                        <div className="space-y-2">
                          {reports.map(r => (
                            <div key={r.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between gap-4">
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>
                                <p className="text-[10px] text-slate-500">
                                  Type: <span className="font-mono text-slate-700 font-bold">{r.type}</span> • Created: {r.dateCreated}
                                </p>
                                {r.notes && <p className="text-[11px] text-slate-600 leading-normal italic">Notes: {r.notes}</p>}
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold rounded shrink-0">
                                {r.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: FOLLOW UPS */}
                  {activeTab === "FOLLOW_UPS" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-400">Consultant Actions & Follow-ups</h3>
                        <button
                          onClick={() => setIsAddingRelation(true)}
                          className="px-2.5 py-1 text-[10px] bg-slate-900 text-white font-mono rounded font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Link Follow Up</span>
                        </button>
                      </div>

                      {followUps.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No follow ups scheduled.</p>
                      ) : (
                        <div className="space-y-2">
                          {followUps.map(f => (
                            <div key={f.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between gap-3">
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-900">{f.topic}</h4>
                                <p className="text-[10px] text-slate-400">Target Date: {f.date}</p>
                                {f.notes && <p className="text-[11px] text-slate-600 leading-normal">{f.notes}</p>}
                              </div>
                              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded shrink-0 ${
                                f.status === "DONE" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}>
                                {f.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: NOTES */}
                  {activeTab === "NOTES" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-400">Historical Log Notes (Never Deleted)</h3>
                        <button
                          onClick={() => setIsAddingRelation(true)}
                          className="px-2.5 py-1 text-[10px] bg-slate-900 text-white font-mono rounded font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Link Note</span>
                        </button>
                      </div>

                      {notes.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No operational notes registered.</p>
                      ) : (
                        <div className="space-y-2">
                          {notes.map(n => (
                            <div key={n.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl space-y-1.5">
                              <p className="text-xs text-slate-700 leading-relaxed font-sans">{n.content}</p>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>Author: <strong>{n.author}</strong></span>
                                <span>{new Date(n.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: APPOINTMENTS */}
                  {activeTab === "APPOINTMENTS" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-400">Meeting Calendar Appointments</h3>
                        <button
                          onClick={() => setIsAddingRelation(true)}
                          className="px-2.5 py-1 text-[10px] bg-slate-900 text-white font-mono rounded font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Link Appointment</span>
                        </button>
                      </div>

                      {appointments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No meetings scheduled.</p>
                      ) : (
                        <div className="space-y-2">
                          {appointments.map(a => (
                            <div key={a.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between gap-3">
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-900">{a.type}</h4>
                                <p className="text-[10px] text-slate-500">
                                  Scheduled: {new Date(a.dateTime).toLocaleString()} ({a.durationMinutes} mins)
                                </p>
                                {a.notes && <p className="text-[11px] text-slate-600 leading-normal italic">Agenda: {a.notes}</p>}
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold rounded shrink-0">
                                {a.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center h-[500px] flex flex-col justify-center items-center shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Identity Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Select an identity profile from the left sidebar panel to explore unified relational details.</p>
            </div>
          )}
        </div>

      </div>

      {/* RELATION ADDITION MODAL / OVERLAY SIMULATOR */}
      {isAddingRelation && selectedIdentity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-slate-200 shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            
            <div className="bg-slate-900 text-white p-5">
              <h3 className="text-sm font-bold font-mono tracking-widest uppercase">
                Simulate: Add Relation to {selectedIdentity.fullName}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Adds a relational dataset linked precisely to unique key ID <strong className="text-emerald-400 font-mono font-bold">{selectedIdentity.id}</strong>.
              </p>
            </div>

            <form onSubmit={handleAddRelation} className="p-5 space-y-4">
              
              {/* IF ADDING PROPERTY */}
              {activeTab === "PROPERTIES" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Property Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lotus Heights Block C"
                      value={newPropName}
                      onChange={(e) => setNewPropName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
                    <select
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Street, Sector Address"
                      value={newPropAddress}
                      onChange={(e) => setNewPropAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        placeholder="New Delhi"
                        value={newPropCity}
                        onChange={(e) => setNewPropCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        placeholder="Delhi"
                        value={newPropState}
                        onChange={(e) => setNewPropState(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* IF ADDING REPORT */}
              {activeTab === "REPORTS" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Report Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 16-Zone Energy Analysis Report"
                      value={newReportTitle}
                      onChange={(e) => setNewReportTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Type</label>
                    <select
                      value={newReportType}
                      onChange={(e) => setNewReportType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    >
                      <option value="VASTU">Vastu Studio</option>
                      <option value="NUMEROLOGY">Numerology Studio</option>
                      <option value="LAL_KITAB">Lal Kitab Studio</option>
                      <option value="COMPREHENSIVE">Comprehensive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Findings & Notes</label>
                    <textarea
                      required
                      placeholder="State corrective remedial methods or results..."
                      value={newReportNotes}
                      onChange={(e) => setNewReportNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 h-24 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* IF ADDING FOLLOW UP */}
              {activeTab === "FOLLOW_UPS" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Follow Up Action Topic</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Check North entrance element"
                      value={newFollowUpTopic}
                      onChange={(e) => setNewFollowUpTopic(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Consultant Advisory Notes</label>
                    <textarea
                      required
                      placeholder="Details on what requires confirmation..."
                      value={newFollowUpNotes}
                      onChange={(e) => setNewFollowUpNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 h-24 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* IF ADDING NOTE */}
              {activeTab === "NOTES" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Note Content</label>
                    <textarea
                      required
                      placeholder="Write internal operational log notes..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 h-28 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Author Credit</label>
                    <input
                      type="text"
                      required
                      value={newNoteAuthor}
                      onChange={(e) => setNewNoteAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>
                </div>
              )}

              {/* IF ADDING APPOINTMENT */}
              {activeTab === "APPOINTMENTS" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Type</label>
                    <select
                      value={newApptType}
                      onChange={(e) => setNewApptType(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50"
                    >
                      <option value="Zoom Consultation">Zoom Consultation</option>
                      <option value="On-Site Vastu Audit">On-Site Vastu Audit</option>
                      <option value="Phone Call Remedial Sync">Phone Call Remedial Sync</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newApptTime}
                      onChange={(e) => setNewApptTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Agenda Notes</label>
                    <textarea
                      placeholder="Provide simple agenda..."
                      value={newApptNotes}
                      onChange={(e) => setNewApptNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 h-20 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingRelation(false)}
                  className="flex-1 py-2 text-xs bg-slate-100 hover:bg-slate-200 font-mono font-bold rounded-lg transition-colors cursor-pointer text-slate-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-slate-900 hover:bg-slate-800 font-mono font-bold text-white rounded-lg transition-colors shadow"
                >
                  SAVE RELATION
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
