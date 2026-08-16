import React, { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Users,
  UserCheck,
  Video,
  Phone,
  MapPin,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Compass,
  Lock,
  BookOpen,
  Briefcase,
  Layers,
  Settings,
  Check,
  AlertCircle,
  FileText,
  History,
  CheckSquare,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Send,
  Eye,
  MessageSquare
} from "lucide-react";

import {
  workflowService,
  consultationService,
  appointmentService,
  taskService,
  followUpService,
  workflowTimelineService
} from "../../services/workflowService";
import { IdentityRepository } from "../../repositories/identityRepository";
import { WorkflowRepository } from "../../repositories/workflowRepository";
import { Identity } from "../../types/identity";
import {
  ConsultationWorkflowStage,
  ConsultationWorkflow,
  Consultation,
  ConsultationTask,
  Appointment,
  FollowUp,
  ConsultationNote,
  TimelineEvent,
  ConsultationType,
  MeetingMode
} from "../../types/workflow";

export default function EnterpriseConsultantWorkflow() {
  // Navigation tabs inside Workflow Workspace
  const [activeTab, setActiveTab] = useState<"dashboard" | "client_summary" | "tasks_board" | "appointments" | "automations">("dashboard");

  // Core state
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [selectedIdentityId, setSelectedIdentityId] = useState<string>("");
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<ConsultationWorkflow | null>(null);
  
  // Lists for Dashboard Overview
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [allTasks, setAllTasks] = useState<ConsultationTask[]>([]);
  const [allFollowUps, setAllFollowUps] = useState<FollowUp[]>([]);
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);
  
  // Client-specific lists
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [clientTasks, setClientTasks] = useState<ConsultationTask[]>([]);
  const [clientFollowUps, setClientFollowUps] = useState<FollowUp[]>([]);
  const [clientConsultations, setClientConsultations] = useState<Consultation[]>([]);
  const [clientNotes, setClientNotes] = useState<ConsultationNote[]>([]);
  const [clientTimeline, setClientTimeline] = useState<TimelineEvent[]>([]);

  // Selected stage details inside Client summary
  const [viewingStage, setViewingStage] = useState<ConsultationWorkflowStage>("VISITOR");

  // Creation/Edit states
  const [showScheduleAppt, setShowScheduleAppt] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showLogConsultation, setShowLogConsultation] = useState(false);
  const [showCreateFollowUp, setShowCreateFollowUp] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);

  // New forms values
  const [newAppt, setNewAppt] = useState({
    date: "",
    time: "",
    timezone: "Asia/Kolkata",
    mode: "VIDEO" as MeetingMode,
    location: "",
    reminderSchedule: "1_DAY" as Appointment["reminderSchedule"],
    notes: ""
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as ConsultationTask["priority"],
    dueDate: "",
    assignedUserId: "consultant_01",
    recurringPattern: "NONE" as ConsultationTask["recurringPattern"]
  });

  const [newCons, setNewCons] = useState({
    type: "VASTU" as ConsultationType,
    mode: "VIDEO" as MeetingMode,
    durationMinutes: 45
  });

  const [consOutcomeForm, setConsOutcomeForm] = useState({
    id: "",
    status: "COMPLETED" as Consultation["status"],
    outcome: "",
    recommendations: "",
    nextAction: ""
  });
  const [editingCons, setEditingCons] = useState<Consultation | null>(null);

  const [newFup, setNewFup] = useState({
    reason: "",
    dueDate: "",
    notes: ""
  });

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    isPrivate: false
  });

  // Stage transition prompt values
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [targetTransitionStage, setTargetTransitionStage] = useState<ConsultationWorkflowStage>("LEAD_CREATED");
  const [transitionNotes, setTransitionNotes] = useState("");

  // Automation flags visual settings
  const [automationsState, setAutomationsState] = useState({
    postConsultationTask: true,
    postReportFollowup: true,
    annualReviewReminder: true
  });

  // Load identities & generic dashboard data
  useEffect(() => {
    const loadCoreData = async () => {
      const ids = await IdentityRepository.getInstance().getAllIdentities();
      setIdentities(ids);
      
      const repo = WorkflowRepository.getInstance();
      setAllAppointments(repo.getAppointments());
      setAllTasks(repo.getTasks());
      setAllFollowUps(repo.getFollowUps());
      setAllConsultations(repo.getConsultations());

      if (ids.length > 0) {
        // Default select Shreya Sharma if exists
        const defaultId = ids.find(i => i.id === "ID-VASTU901")?.id || ids[0].id;
        setSelectedIdentityId(defaultId);
      }
    };
    loadCoreData();
  }, []);

  // Sync state whenever client changes
  useEffect(() => {
    if (!selectedIdentityId) return;
    const client = identities.find(i => i.id === selectedIdentityId) || null;
    setSelectedIdentity(client);

    if (client) {
      // Get or create workflow
      const wf = workflowService.getOrCreateWorkflowForIdentity(client.id);
      setCurrentWorkflow(wf);
      setViewingStage(wf.currentStage);

      // Refresh client collections
      refreshClientCollections(client.id);
    }
  }, [selectedIdentityId, identities]);

  const refreshClientCollections = (clientId: string) => {
    const repo = WorkflowRepository.getInstance();
    setClientAppointments(repo.getAppointmentsByIdentity(clientId));
    setClientTasks(repo.getTasksByIdentity(clientId));
    setClientFollowUps(repo.getFollowUpsByIdentity(clientId));
    setClientConsultations(repo.getConsultationsByIdentity(clientId));
    setClientNotes(repo.getNotesByIdentity(clientId));
    setClientTimeline(repo.getTimelineEventsByIdentity(clientId));

    // Also update global board tallies
    setAllAppointments(repo.getAppointments());
    setAllTasks(repo.getTasks());
    setAllFollowUps(repo.getFollowUps());
    setAllConsultations(repo.getConsultations());
  };

  const reloadWorkflow = () => {
    if (!selectedIdentityId) return;
    const wf = workflowService.getOrCreateWorkflowForIdentity(selectedIdentityId);
    setCurrentWorkflow(wf);
  };

  // HANDLERS
  const handleStageTransition = () => {
    if (!selectedIdentityId) return;
    workflowService.advanceWorkflowStage(
      selectedIdentityId,
      targetTransitionStage,
      transitionNotes,
      "consultant_01"
    );
    setShowTransitionModal(false);
    setTransitionNotes("");
    reloadWorkflow();
    refreshClientCollections(selectedIdentityId);
  };

  const handleToggleChecklist = (stage: ConsultationWorkflowStage, itemIdx: number, currentDone: boolean) => {
    if (!selectedIdentityId) return;
    workflowService.updateStageChecklistItem(
      selectedIdentityId,
      stage,
      itemIdx,
      !currentDone,
      "consultant_01"
    );
    reloadWorkflow();
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentityId) return;
    appointmentService.scheduleAppointment({
      identityId: selectedIdentityId,
      date: newAppt.date,
      time: newAppt.time,
      timezone: newAppt.timezone,
      mode: newAppt.mode,
      location: newAppt.location,
      reminderSchedule: newAppt.reminderSchedule,
      notes: newAppt.notes,
      authorId: "consultant_01"
    });
    setShowScheduleAppt(false);
    setNewAppt({
      date: "",
      time: "",
      timezone: "Asia/Kolkata",
      mode: "VIDEO",
      location: "",
      reminderSchedule: "1_DAY",
      notes: ""
    });
    refreshClientCollections(selectedIdentityId);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentityId) return;
    taskService.createTask({
      identityId: selectedIdentityId,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      assignedUserId: newTask.assignedUserId,
      recurringPattern: newTask.recurringPattern
    });
    setShowCreateTask(false);
    setNewTask({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      assignedUserId: "consultant_01",
      recurringPattern: "NONE"
    });
    refreshClientCollections(selectedIdentityId);
  };

  const handleLogConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentityId) return;
    consultationService.createConsultation({
      identityId: selectedIdentityId,
      consultantId: "consultant_01",
      type: newCons.type,
      mode: newCons.mode,
      durationMinutes: newCons.durationMinutes,
      authorId: "consultant_01"
    });
    setShowLogConsultation(false);
    refreshClientCollections(selectedIdentityId);
  };

  const handleUpdateConsOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentityId || !editingCons) return;
    consultationService.updateConsultationOutcome(
      editingCons.id,
      consOutcomeForm.status,
      consOutcomeForm.outcome,
      consOutcomeForm.recommendations.split("\n").filter(Boolean),
      consOutcomeForm.nextAction,
      "consultant_01"
    );
    setEditingCons(null);
    refreshClientCollections(selectedIdentityId);
  };

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentityId || clientConsultations.length === 0) {
      alert("Consultation record required before creating follow-up.");
      return;
    }
    followUpService.createFollowUp({
      consultationId: clientConsultations[0].id,
      identityId: selectedIdentityId,
      reason: newFup.reason,
      dueDate: newFup.dueDate,
      notes: newFup.notes,
      authorId: "consultant_01"
    });
    setShowCreateFollowUp(false);
    setNewFup({ reason: "", dueDate: "", notes: "" });
    refreshClientCollections(selectedIdentityId);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentityId) return;
    consultationService.createNote({
      identityId: selectedIdentityId,
      title: newNote.title,
      content: newNote.content,
      isPrivate: newNote.isPrivate,
      authorId: "consultant_01"
    });
    setShowCreateNote(false);
    setNewNote({ title: "", content: "", isPrivate: false });
    refreshClientCollections(selectedIdentityId);
  };

  const handleToggleTaskDone = (taskId: string, currentStatus: ConsultationTask["status"]) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    taskService.updateTaskStatus(taskId, nextStatus, "consultant_01");
    if (selectedIdentityId) {
      refreshClientCollections(selectedIdentityId);
    }
  };

  const handleCompleteFollowUpAction = (fupId: string) => {
    const outcome = prompt("Enter Follow-Up Outcome details:");
    if (outcome === null) return;
    followUpService.completeFollowUp(fupId, outcome, "Follow-up successfully resolved during review call.", "consultant_01");
    if (selectedIdentityId) {
      refreshClientCollections(selectedIdentityId);
    }
  };

  const handleApptStatusUpdate = (apptId: string, status: Appointment["status"], attendance: Appointment["attendance"]) => {
    appointmentService.updateAppointmentStatus(apptId, status, attendance, "consultant_01");
    if (selectedIdentityId) {
      refreshClientCollections(selectedIdentityId);
    }
  };

  // Helper arrays for visual stages stepper
  const workflowStages: { id: ConsultationWorkflowStage; label: string }[] = [
    { id: "VISITOR", label: "Visitor" },
    { id: "LEAD_CREATED", label: "Lead Created" },
    { id: "IDENTITY_VERIFIED", label: "Identity Verified" },
    { id: "FREE_ANALYSIS", label: "Free Analysis" },
    { id: "CONSULTATION_REQUESTED", label: "Requested" },
    { id: "CONSULTATION_SCHEDULED", label: "Scheduled" },
    { id: "CONSULTATION_CONFIRMED", label: "Confirmed" },
    { id: "CONSULTATION_IN_PROGRESS", label: "In Progress" },
    { id: "ANALYSIS_COMPLETE", label: "Analysis Complete" },
    { id: "REPORT_DRAFT", label: "Drafting Report" },
    { id: "REPORT_REVIEWED", label: "Report Reviewed" },
    { id: "REPORT_DELIVERED", label: "Report Delivered" },
    { id: "REMEDY_TRACKING", label: "Remedy Tracking" },
    { id: "FOLLOW_UP_SCHEDULED", label: "Follow-Up Scheduled" },
    { id: "FOLLOW_UP_COMPLETED", label: "Follow-Up Completed" },
    { id: "ANNUAL_REVIEW", label: "Annual Review" },
    { id: "REPEAT_CONSULTATION", label: "Repeat Client" }
  ];

  return (
    <div className="space-y-6">
      {/* 1. COMPACT ENTERPRISE HEADER */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Business Workflow Architecture
          </span>
          <h2 className="text-2xl font-bold text-slate-950 mt-1">Enterprise Consultant Workflow Engine</h2>
          <p className="text-xs text-slate-500 mt-1">
            Central orchestration hub managing consultations, tasks, appointments, follow-ups, and append-only stage history.
          </p>
        </div>

        {/* Client Picker Selector & Client Overall Progress */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <select
              value={selectedIdentityId}
              onChange={(e) => setSelectedIdentityId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="" disabled>Select Client Context</option>
              {identities.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.fullName} ({i.id})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (currentWorkflow) {
                setTargetTransitionStage(currentWorkflow.currentStage);
                setShowTransitionModal(true);
              }
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2.5 rounded-lg transition-all shadow-sm font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Advance Stage
          </button>
        </div>
      </div>

      {/* 2. MAIN TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap gap-1">
        {[
          { id: "dashboard", label: "Consultant Operations Dashboard", icon: Sliders },
          { id: "client_summary", label: "Client Lifecycle Summary", icon: UserCheck },
          { id: "tasks_board", label: "Tasks & Remedies Board", icon: CheckSquare },
          { id: "appointments", label: "Appointments Scheduler", icon: Calendar },
          { id: "automations", label: "Automation Blueprints", icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-950 bg-emerald-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEWPORT CONTROLLER */}
      <div className="space-y-6">

        {/* ========================================== */}
        {/* --- TAB 1: OPERATIONS DASHBOARD (PART 10) --- */}
        {/* ========================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Quick Overview Tallies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Scheduled Today</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {allAppointments.filter(a => a.status === "SCHEDULED" || a.status === "RESCHEDULED").length}
                  </div>
                  <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">Active consultations</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tasks Due Today</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {allTasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS").length}
                  </div>
                  <span className="text-[10px] text-amber-600 block mt-1 font-semibold">Operational checklist</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Reports Pending</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {allTasks.filter(t => t.title.toLowerCase().includes("report") && t.status !== "COMPLETED").length}
                  </div>
                  <span className="text-[10px] text-blue-600 block mt-1 font-semibold">Ready for review draft</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Follow-Ups Pending</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {allFollowUps.filter(f => f.status === "PENDING").length}
                  </div>
                  <span className="text-[10px] text-purple-600 block mt-1 font-semibold">Verification checkups</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left & Middle: Operational Tables */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Today's Appointments */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" /> Scheduled Meetings Console
                    </h3>
                    <button
                      onClick={() => setShowScheduleAppt(true)}
                      className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule Call
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {allAppointments.length === 0 ? (
                      <p className="p-6 text-xs text-slate-400 text-center">No appointments scheduled</p>
                    ) : (
                      allAppointments.map((appt) => {
                        const clientName = identities.find(i => i.id === appt.identityId)?.fullName || appt.identityId;
                        return (
                          <div key={appt.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/40 transition-all">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-900">{clientName}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                                  appt.mode === "VIDEO" ? "bg-cyan-50 text-cyan-700 border border-cyan-100" : "bg-teal-50 text-teal-700 border border-teal-100"
                                }`}>
                                  {appt.mode}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
                                <span>Date: <strong className="text-slate-800">{appt.date}</strong></span>
                                <span>Time: <strong className="text-slate-800">{appt.time}</strong> ({appt.timezone})</span>
                              </div>
                              {appt.notes && <p className="text-[10px] text-slate-400 italic mt-1 font-mono">{appt.notes}</p>}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {appt.status === "SCHEDULED" ? (
                                <>
                                  <button
                                    onClick={() => handleApptStatusUpdate(appt.id, "COMPLETED", "ATTENDED")}
                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] px-2.5 py-1 rounded font-bold"
                                  >
                                    Mark Attended
                                  </button>
                                  <button
                                    onClick={() => handleApptStatusUpdate(appt.id, "CANCELLED", "CANCELLED")}
                                    className="bg-red-50 text-red-700 hover:bg-red-100 text-[10px] px-2.5 py-1 rounded font-bold"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                                  {appt.status} ({appt.attendance})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Pending Follow-Ups Checkup */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" /> Pending Remedy & Feedback Follow-Ups
                    </h3>
                    {clientConsultations.length > 0 && (
                      <button
                        onClick={() => setShowCreateFollowUp(true)}
                        className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Schedule Review
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {allFollowUps.length === 0 ? (
                      <p className="p-6 text-xs text-slate-400 text-center">No follow-ups logged</p>
                    ) : (
                      allFollowUps.map((fup) => {
                        const clientName = identities.find(i => i.id === fup.identityId)?.fullName || fup.identityId;
                        return (
                          <div key={fup.id} className="p-4 flex justify-between items-center hover:bg-slate-50/40 transition-all">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-900">{clientName}</span>
                                <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                  DUE {fup.dueDate}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1 font-semibold">{fup.reason}</p>
                              {fup.notes && <p className="text-[10px] text-slate-400 font-mono italic">{fup.notes}</p>}
                            </div>
                            <div>
                              {fup.status === "PENDING" ? (
                                <button
                                  onClick={() => handleCompleteFollowUpAction(fup.id)}
                                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] px-2.5 py-1.5 rounded-lg font-bold"
                                >
                                  Resolve Follow-Up
                                </button>
                              ) : (
                                <div className="text-right">
                                  <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">Completed</span>
                                  <p className="text-[9px] text-slate-400 mt-1">Outcome: {fup.outcome}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. Pending Consultations needing Outcome updates */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-teal-600" /> Active Consultations Backlog
                    </h3>
                    <button
                      onClick={() => setShowLogConsultation(true)}
                      className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Consultation
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {allConsultations.filter(c => c.status === "SCHEDULED" || c.status === "IN_PROGRESS").length === 0 ? (
                      <p className="p-6 text-xs text-slate-400 text-center">No pending active consultations require input</p>
                    ) : (
                      allConsultations.filter(c => c.status === "SCHEDULED" || c.status === "IN_PROGRESS").map((cons) => {
                        const clientName = identities.find(i => i.id === cons.identityId)?.fullName || cons.identityId;
                        return (
                          <div key={cons.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-900">{clientName}</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                                  {cons.type} ({cons.mode})
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                Consultation Ref: {cons.id} • Target duration: {cons.durationMinutes} min
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingCons(cons);
                                setConsOutcomeForm({
                                  id: cons.id,
                                  status: "COMPLETED",
                                  outcome: cons.outcome || "",
                                  recommendations: cons.recommendations.join("\n"),
                                  nextAction: cons.nextAction || ""
                                });
                              }}
                              className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] px-3 py-1.5 rounded font-bold"
                            >
                              Log Recommendations & Conclude
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Activity Feed (Chronological events) & Quick Actions */}
              <div className="space-y-6">
                
                {/* Quick Actions Panel */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Quick Workflow Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowScheduleAppt(true)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 transition-all text-slate-700 border border-slate-200 text-center rounded-lg space-y-2"
                    >
                      <Calendar className="w-5 h-5 mx-auto text-emerald-600" />
                      <span className="text-[10px] block font-semibold">Book Meeting</span>
                    </button>
                    <button
                      onClick={() => setShowCreateTask(true)}
                      className="p-3 bg-slate-50 hover:bg-amber-50 hover:text-amber-950 transition-all text-slate-700 border border-slate-200 text-center rounded-lg space-y-2"
                    >
                      <CheckSquare className="w-5 h-5 mx-auto text-amber-600" />
                      <span className="text-[10px] block font-semibold">Assign Task</span>
                    </button>
                    <button
                      onClick={() => setShowLogConsultation(true)}
                      className="p-3 bg-slate-50 hover:bg-teal-50 hover:text-teal-950 transition-all text-slate-700 border border-slate-200 text-center rounded-lg space-y-2"
                    >
                      <Briefcase className="w-5 h-5 mx-auto text-teal-600" />
                      <span className="text-[10px] block font-semibold">Add Consultation</span>
                    </button>
                    <button
                      onClick={() => {
                        if (currentWorkflow) {
                          setTargetTransitionStage(currentWorkflow.currentStage);
                          setShowTransitionModal(true);
                        }
                      }}
                      className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 transition-all text-slate-700 border border-slate-200 text-center rounded-lg space-y-2"
                    >
                      <Sparkles className="w-5 h-5 mx-auto text-indigo-600" />
                      <span className="text-[10px] block font-semibold">Transition Stage</span>
                    </button>
                  </div>
                </div>

                {/* Unified Append-Only Operations Log */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-emerald-600" /> Client Activity Timeline Feed
                  </h3>
                  <div className="border-l border-slate-200 pl-4 space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {clientTimeline.length === 0 ? (
                      <p className="text-xs text-slate-400">Select a client to view historical activity.</p>
                    ) : (
                      clientTimeline.map((evt) => (
                        <div key={evt.id} className="relative text-xs space-y-1">
                          <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>{evt.eventType}</span>
                          </div>
                          <span className="font-semibold text-slate-900 block">{evt.title}</span>
                          <p className="text-slate-500 text-[10px] leading-relaxed">{evt.description}</p>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                            By: {evt.authorId}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}


        {/* ========================================== */}
        {/* --- TAB 2: CLIENT LIFE CYCLE SUMMARY (PART 8 & 1/2) --- */}
        {/* ========================================== */}
        {activeTab === "client_summary" && (
          <div className="space-y-6">
            
            {/* 1. Client Card Summary Header */}
            {selectedIdentity && currentWorkflow && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-emerald-950 text-emerald-100 p-6 rounded-2xl shadow-md border border-emerald-800">
                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded font-mono text-emerald-300 font-bold">
                    ACTIVE LIFECYCLE MONITOR
                  </span>
                  <h3 className="text-xl font-bold text-white">{selectedIdentity.fullName}</h3>
                  <div className="text-xs text-emerald-300 space-y-1">
                    <p>Core Email: <strong className="text-emerald-100">{selectedIdentity.email}</strong></p>
                    <p>Mobile: <strong className="text-emerald-100">{selectedIdentity.mobileNumber}</strong></p>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase text-emerald-300 font-bold">Active Stage</span>
                  <div className="text-md font-bold text-white mt-1 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                    {currentWorkflow.currentStage.replace(/_/g, " ")}
                  </div>
                  <span className="text-[9px] text-emerald-300 mt-1 italic">
                    Version track: #{currentWorkflow.version}
                  </span>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase text-emerald-300 font-bold">Overall Progress</span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {currentWorkflow.overallProgress}%
                  </div>
                  <div className="w-full bg-emerald-900 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${currentWorkflow.overallProgress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Timeline Stepper */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Operational Lifecycle Checkpoints</h3>
              <div className="flex gap-2 overflow-x-auto pb-4 pt-1 whitespace-nowrap scrollbar-hide">
                {currentWorkflow && workflowStages.map((stg) => {
                  const sState = currentWorkflow.stagesState[stg.id];
                  const isActive = currentWorkflow.currentStage === stg.id;
                  const isCompleted = sState?.status === "COMPLETED";

                  return (
                    <button
                      key={stg.id}
                      onClick={() => setViewingStage(stg.id)}
                      className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all shrink-0 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                          : isCompleted
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : viewingStage === stg.id
                          ? "bg-slate-100 text-slate-800 border-slate-300"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : isActive ? (
                        <Compass className="w-4 h-4 text-white animate-spin-slow" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                      {stg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Stage Detail Panel */}
            {currentWorkflow && currentWorkflow.stagesState[viewingStage] && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Checklist and Action panel */}
                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-6">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-600">
                        STAGE CONFIGURATION & REVIEWS
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-2">
                        {viewingStage.replace(/_/g, " ")} Checklist
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        currentWorkflow.stagesState[viewingStage].status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-800"
                          : currentWorkflow.stagesState[viewingStage].status === "IN_PROGRESS"
                          ? "bg-indigo-50 text-indigo-800 animate-pulse"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {currentWorkflow.stagesState[viewingStage].status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2">Stage Completion: {currentWorkflow.stagesState[viewingStage].progressPercentage}%</p>
                    </div>
                  </div>

                  {/* Stage checklist checkboxes */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Prerequisite Tasks</h5>
                    {currentWorkflow.stagesState[viewingStage].checklist.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleChecklist(viewingStage, idx, item.done)}
                        className="p-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                      >
                        <span className={`text-xs font-semibold ${item.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {item.item}
                        </span>
                        {item.done ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-300" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Update stage custom notes text */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Internal Stage Notes</label>
                    <textarea
                      value={currentWorkflow.stagesState[viewingStage].notes}
                      onChange={(e) => {
                        if (!selectedIdentityId) return;
                        workflowService.updateStageNotes(selectedIdentityId, viewingStage, e.target.value, "consultant_01");
                        reloadWorkflow();
                      }}
                      rows={3}
                      placeholder="Add stage-specific comments, issues, or details."
                      className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Audit history track of this stage */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-emerald-600" /> Stage Modification Log
                  </h3>
                  <div className="border-l border-slate-200 pl-4 space-y-4 max-h-[300px] overflow-y-auto">
                    {currentWorkflow.stagesState[viewingStage].history.map((h, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                          <span>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="font-semibold text-slate-800">{h.updateMessage}</span>
                        <p className="text-[10px] text-slate-500 italic">By: {h.changedBy}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* At-A-Glance Summaries (Part 8 Details) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Upcoming Appointments */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Client Appointments</h4>
                {clientAppointments.filter(a => a.status === "SCHEDULED" || a.status === "RESCHEDULED").length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No future meetings slotted.</p>
                ) : (
                  clientAppointments.filter(a => a.status === "SCHEDULED" || a.status === "RESCHEDULED").map(a => (
                    <div key={a.id} className="p-3 border border-slate-100 rounded bg-slate-50 text-xs">
                      <div className="font-semibold text-slate-900">{a.date} at {a.time}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Mode: {a.mode} ({a.timezone})</div>
                    </div>
                  ))
                )}
              </div>

              {/* Consultation Outcomes and Recommendations */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 md:col-span-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Consultation Output & Recommendations</h4>
                {clientConsultations.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No formal consultation logs recorded yet.</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-700 uppercase">{clientConsultations[0].type} CONSULTATION</span>
                        <p className="font-semibold text-slate-800 mt-1">Outcome: {clientConsultations[0].outcome || "In analytical formulation"}</p>
                      </div>
                    </div>
                    {clientConsultations[0].recommendations.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-emerald-700">Recommended Remedial Corrections:</span>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-600">
                          {clientConsultations[0].recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {clientConsultations[0].nextAction && (
                      <p className="text-[10px] text-slate-500 font-mono mt-2">
                        Next Action Point: <strong className="text-slate-800">{clientConsultations[0].nextAction}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* CONSULTATION NOTE VERSIONING SYSTEM (Part 7) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" /> Versioned Consultation Notes & Documents
                </h3>
                <button
                  onClick={() => setShowCreateNote(true)}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Note
                </button>
              </div>

              {clientNotes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No consultation notes recorded. Add a note to start tracking.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientNotes.map((note) => (
                    <div key={note.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-[#FCFBF9] hover:border-slate-300 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">
                            {note.isPrivate ? "Private Consultant" : "Shared client view"}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{note.title}</h4>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                          v{note.versionHistory.length}
                        </span>
                      </div>
                      
                      <textarea
                        value={note.content}
                        onChange={(e) => {
                          consultationService.updateNoteContent(note.id, e.target.value, "consultant_01");
                          if (selectedIdentityId) refreshClientCollections(selectedIdentityId);
                        }}
                        rows={3}
                        className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-white font-mono"
                      />

                      {/* Version history list */}
                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Note Revision Log:</span>
                        {note.versionHistory.map((v, vIdx) => (
                          <div key={vIdx} className="text-[9px] text-slate-500 flex justify-between font-mono">
                            <span>Rev #{v.version} - {v.updatedBy}</span>
                            <span>{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}


        {/* ========================================== */}
        {/* --- TAB 3: TASKS BOARD (PART 4) ----------- */}
        {/* ========================================== */}
        {activeTab === "tasks_board" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-md font-bold text-slate-950">Tasks & Remedy Calibration Board</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assigned checklist items needed to fulfill elements balancing.</p>
              </div>
              <button
                onClick={() => setShowCreateTask(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: Pending */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" /> Pending ({clientTasks.filter(t => t.status === "PENDING").length})
                </span>
                {clientTasks.filter(t => t.status === "PENDING").map(task => (
                  <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-950 text-xs">{task.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        task.priority === "CRITICAL" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{task.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono">Due Date: {task.dueDate}</div>
                    
                    <button
                      onClick={() => handleToggleTaskDone(task.id, task.status)}
                      className="w-full bg-slate-950 hover:bg-slate-800 text-white text-[10px] py-1.5 rounded font-semibold"
                    >
                      Mark Complete
                    </button>
                  </div>
                ))}
              </div>

              {/* Column 2: In Progress */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-4 h-4 text-indigo-500" /> In Progress ({clientTasks.filter(t => t.status === "IN_PROGRESS").length})
                </span>
                {clientTasks.filter(t => t.status === "IN_PROGRESS").map(task => (
                  <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-950 text-xs">{task.title}</span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{task.priority}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{task.description}</p>
                    <button
                      onClick={() => handleToggleTaskDone(task.id, task.status)}
                      className="w-full bg-slate-950 text-white text-[10px] py-1.5 rounded font-semibold"
                    >
                      Mark Complete
                    </button>
                  </div>
                ))}
              </div>

              {/* Column 3: Completed */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Completed ({clientTasks.filter(t => t.status === "COMPLETED").length})
                </span>
                {clientTasks.filter(t => t.status === "COMPLETED").map(task => (
                  <div key={task.id} className="bg-white border border-slate-100 p-4 rounded-lg shadow-sm space-y-2 opacity-80">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-950 text-xs line-through">{task.title}</span>
                      <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">Done</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{task.description}</p>
                    {task.completedDate && (
                      <span className="text-[9px] text-slate-400 font-mono block">
                        Completed at: {new Date(task.completedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}


        {/* ========================================== */}
        {/* --- TAB 4: APPOINTMENTS SCHEDULER -------- */}
        {/* ========================================== */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-md font-bold text-slate-950">Appointments & Time Booking Console</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage live consultations, voice review calls, and physical site inspections.</p>
              </div>
              <button
                onClick={() => setShowScheduleAppt(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Book Appointment
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Meeting Date/Time</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Meeting Mode</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Location/URL Link</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Reminder Schedule</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clientAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-400">
                        No appointments booked for this client context.
                      </td>
                    </tr>
                  ) : (
                    clientAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <div className="font-bold text-slate-900">{appt.date}</div>
                          <div className="text-slate-500 font-mono mt-0.5">{appt.time} ({appt.timezone})</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                            {appt.mode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600">
                          {appt.location || "Google Meet (Slotted on Schedule)"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                          {appt.reminderSchedule} before
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span className={`px-2 py-0.5 rounded font-semibold ${
                            appt.status === "SCHEDULED" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span className="font-semibold text-slate-800">{appt.attendance}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ========================================== */}
        {/* --- TAB 5: AUTOMATION BLUEPRINTS --------- */}
        {/* ========================================== */}
        {activeTab === "automations" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">PRE-PRODUCTION</span>
              <h3 className="text-md font-bold text-slate-950 mt-1">Workflow Automation & Business Rules (Part 11)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure background triggering foundations. These systems monitor entity updates to generate downstream operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">Trigger Rule</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automationsState.postConsultationTask}
                        onChange={() => setAutomationsState(p => ({ ...p, postConsultationTask: !p.postConsultationTask }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Post-Consultation Deliverables</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    When any consultation status advances to <strong className="text-slate-800">COMPLETED</strong>, automatically create:
                  </p>
                  <ul className="list-disc pl-4 text-[10px] text-slate-500 mt-2 space-y-1">
                    <li>Draft Vastu-Astro report package compilation task.</li>
                    <li>Verify elements layout calibration verify task.</li>
                  </ul>
                </div>
                <div className="border-t border-slate-100 mt-4 pt-3 text-[10px] text-slate-400 font-mono">
                  Module ID: <span className="text-slate-600">RULE_POST_CONS_01</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">Trigger Rule</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automationsState.postReportFollowup}
                        onChange={() => setAutomationsState(p => ({ ...p, postReportFollowup: !p.postReportFollowup }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Post-Report Delivery Follow-up</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    When the lifecycle stage transitions to <strong className="text-slate-800">REPORT_DELIVERED</strong>, auto-generate:
                  </p>
                  <ul className="list-disc pl-4 text-[10px] text-slate-500 mt-2 space-y-1">
                    <li>Schedule visual verify followup in 7 days for placement checking.</li>
                  </ul>
                </div>
                <div className="border-t border-slate-100 mt-4 pt-3 text-[10px] text-slate-400 font-mono">
                  Module ID: <span className="text-slate-600">RULE_POST_REPT_02</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">Trigger Rule</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automationsState.annualReviewReminder}
                        onChange={() => setAutomationsState(p => ({ ...p, annualReviewReminder: !p.annualReviewReminder }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Annual Review Activation</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    When the client hits the <strong className="text-slate-800">ANNUAL_REVIEW</strong> stage milestone:
                  </p>
                  <ul className="list-disc pl-4 text-[10px] text-slate-500 mt-2 space-y-1">
                    <li>Generate task reminder for scheduling annual directional checkup.</li>
                  </ul>
                </div>
                <div className="border-t border-slate-100 mt-4 pt-3 text-[10px] text-slate-400 font-mono">
                  Module ID: <span className="text-slate-600">RULE_ANNUAL_REV_03</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>


      {/* ======================================================== */}
      {/* MODALS AND POPUPS (Zero Mock, Persistent Interactions) */}
      {/* ======================================================== */}

      {/* 1. STAGE ADVANCEMEMT TRANSITION MODAL */}
      {showTransitionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-emerald-600" /> Advance Client Stage Milestone
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Lifecycle checkpoint</label>
                <select
                  value={targetTransitionStage}
                  onChange={(e) => setTargetTransitionStage(e.target.value as ConsultationWorkflowStage)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {workflowStages.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transition Comments & Audit log notes</label>
                <textarea
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Provide brief notes explaining the stage update"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowTransitionModal(false)}
                className="px-3 py-2 text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleStageTransition}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold"
              >
                Execute Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SCHEDULE APPOINTMENT FORM MODAL */}
      {showScheduleAppt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateAppointment} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-emerald-600" /> Schedule Meeting Slot
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newAppt.date}
                  onChange={e => setNewAppt(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={newAppt.time}
                  onChange={e => setNewAppt(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Meeting Mode</label>
                <select
                  value={newAppt.mode}
                  onChange={e => setNewAppt(prev => ({ ...prev, mode: e.target.value as MeetingMode }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  <option value="VIDEO">Video Call (Google Meet/Zoom)</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="SITE_VISIT">On-Site Survey Visit</option>
                  <option value="OFFLINE">In-Office Discussion</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Location or Meeting Link</label>
                <input
                  type="text"
                  placeholder="Zoom url, phone digits, or address"
                  value={newAppt.location}
                  onChange={e => setNewAppt(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Meeting Objectives</label>
                <input
                  type="text"
                  placeholder="e.g., Elemental layout review, direction corrections review"
                  value={newAppt.notes}
                  onChange={e => setNewAppt(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setShowScheduleAppt(false)} className="px-3 py-2 text-slate-500">
                Cancel
              </button>
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. ASSIGN TASK FORM MODAL */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTask} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5">
              <CheckSquare className="w-5 h-5 text-emerald-600" /> Create Downstream Checklist Task
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verify entrance directional plate"
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Task Instructions</label>
                <textarea
                  placeholder="Describe step requirements..."
                  value={newTask.description}
                  onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setShowCreateTask(false)} className="px-3 py-2 text-slate-500">
                Cancel
              </button>
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">
                Assign Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. ADD CONSULTATION MODAL */}
      {showLogConsultation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogConsultation} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5">
              <Briefcase className="w-5 h-5 text-emerald-600" /> Start Consultation Session
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Consultation Category</label>
                <select
                  value={newCons.type}
                  onChange={e => setNewCons(prev => ({ ...prev, type: e.target.value as ConsultationType }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  <option value="VASTU">Vastu Shastra</option>
                  <option value="ASTROLOGY">Astrology Reading</option>
                  <option value="NUMEROLOGY">Numerology Calculations</option>
                  <option value="COMBINED">Combined Synthesis</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interaction Mode</label>
                <select
                  value={newCons.mode}
                  onChange={e => setNewCons(prev => ({ ...prev, mode: e.target.value as MeetingMode }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  <option value="VIDEO">Video Call</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="SITE_VISIT">Physical Site Visit</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Allocated Duration (Minutes)</label>
                <input
                  type="number"
                  value={newCons.durationMinutes}
                  onChange={e => setNewCons(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 30 }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setShowLogConsultation(false)} className="px-3 py-2 text-slate-500">
                Cancel
              </button>
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">
                Initialize Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. EDIT/CONCLUDE CONSULTATION MODAL */}
      {editingCons && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateConsOutcome} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-950">Conclude Consultation Session</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Session Summary Outcome</label>
                <textarea
                  required
                  placeholder="Log the diagnostic insights obtained from layout/charts mapping..."
                  value={consOutcomeForm.outcome}
                  onChange={e => setConsOutcomeForm(prev => ({ ...prev, outcome: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Downstream Remedial Recommendations (one per line)</label>
                <textarea
                  required
                  placeholder="Place elemental zinc foils under threshold...&#10;Add red light to southeast sector..."
                  value={consOutcomeForm.recommendations}
                  onChange={e => setConsOutcomeForm(prev => ({ ...prev, recommendations: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Consultant Next Action Statement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule visual check of placement"
                  value={consOutcomeForm.nextAction}
                  onChange={e => setConsOutcomeForm(prev => ({ ...prev, nextAction: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setEditingCons(null)} className="px-3 py-2 text-slate-500">
                Cancel
              </button>
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">
                Log Conclusions & Conclude
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. ADD FOLLOW-UP MODAL */}
      {showCreateFollowUp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateFollowUp} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5">
              <Users className="w-5 h-5 text-emerald-600" /> Book Review Follow-Up Action
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Follow-Up</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Elemental energy checkup"
                  value={newFup.reason}
                  onChange={e => setNewFup(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Follow-Up Due Date</label>
                <input
                  type="date"
                  required
                  value={newFup.dueDate}
                  onChange={e => setNewFup(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Context Notes</label>
                <textarea
                  placeholder="Any details regarding placement verifying..."
                  value={newFup.notes}
                  onChange={e => setNewFup(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setShowCreateFollowUp(false)} className="px-3 py-2 text-slate-500">
                Cancel
              </button>
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">
                Confirm Follow-Up
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. ADD NOTE MODAL */}
      {showCreateNote && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateNote} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-emerald-600" /> Record Consultation Note
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Northeast entrance grid corrections"
                  value={newNote.title}
                  onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rich Markdown Content</label>
                <textarea
                  required
                  placeholder="Write detailed observations..."
                  value={newNote.content}
                  onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivateCheck"
                  checked={newNote.isPrivate}
                  onChange={e => setNewNote(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isPrivateCheck" className="font-semibold text-slate-700">
                  Mark as private consultant note (hidden from client)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setShowCreateNote(false)} className="px-3 py-2 text-slate-500">
                Cancel
              </button>
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
