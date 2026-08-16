import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Users,
  Compass,
  FileText,
  Activity as ActivityIcon,
  Send,
  Plus,
  Lock,
  CheckCircle,
  AlertCircle,
  Search,
  UserPlus,
  Volume2,
  Video,
  Monitor,
  Sparkles,
  RefreshCw,
  Eye,
  FileUp,
  Smile,
  Check,
  Tag,
  Settings as SettingsIcon,
  ShieldAlert,
  Save,
  HelpCircle
} from "lucide-react";
import { CollaborationEngine } from "../../core/collaboration/CollaborationEngine";
import {
  Workspace,
  WorkspaceMember,
  Team,
  DiscussionThread,
  Comment,
  Reply,
  Annotation,
  SharedSession,
  Presence,
  Activity,
  WorkspaceRole
} from "../../core/collaboration/CollaborationTypes";
import { NotificationEngine } from "../../core/workflow/SchedulerNotifications";

export const CollaborationWorkspacePage: React.FC = () => {
  const collabEngine = CollaborationEngine.getInstance();

  // Engine state variables
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentForReply, setActiveCommentForReply] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [sharedSessions, setSharedSessions] = useState<SharedSession[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Sub-navigation tabs: "dashboard" | "discussions" | "annotations" | "sessions" | "activities" | "search" | "members" | "future"
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Input states
  const [newCommentText, setNewCommentText] = useState("");
  const [newReplyText, setNewReplyText] = useState("");
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadDomain, setNewThreadDomain] = useState<any>("GENERAL");
  const [newThreadResourceId, setNewThreadResourceId] = useState("");
  const [newThreadResourceLabel, setNewThreadResourceLabel] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("ENGINEER");

  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [saveSearchName, setSaveSearchName] = useState("");

  // Shared session simulated state
  const [activeSession, setActiveSession] = useState<SharedSession | null>(null);
  const [simulatedCursors, setSimulatedCursors] = useState<{ userId: string; name: string; x: number; y: number }[]>([]);
  const [isSessionRunning, setIsSessionRunning] = useState(false);

  // New annotation state
  const [annotationResourceDomain, setAnnotationResourceDomain] = useState<any>("DOMAIN-011");
  const [annotationResourceType, setAnnotationResourceType] = useState<any>("FLOOR_PLAN");
  const [annotationResourceLabel, setAnnotationResourceLabel] = useState("Main Lobby North Axis");
  const [annotationResourceId, setAnnotationResourceId] = useState("plan_lobby_01");
  const [annotationContent, setAnnotationContent] = useState("");
  const [annotationX, setAnnotationX] = useState(150);
  const [annotationY, setAnnotationY] = useState(220);

  // Activity filters
  const [activityDomainFilter, setActivityDomainFilter] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<any>("");
  const [activitySearch, setActivitySearch] = useState("");

  // Attachments simulation
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast / Status banner
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      const wThreads = collabEngine.getThreads(activeWorkspace.id);
      setThreads(wThreads);
      if (wThreads.length > 0 && !activeThread) {
        setActiveThread(wThreads[0]);
      }
      setMembers(collabEngine.getWorkspaceMembers(activeWorkspace.id));
      setAnnotations(collabEngine.getAnnotations(activeWorkspace.id));
      setSharedSessions(collabEngine.getSharedSessions(activeWorkspace.id));
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeThread) {
      setComments(collabEngine.getComments(activeThread.id));
    } else {
      setComments([]);
    }
  }, [activeThread]);

  // Live presence cursor simulation interval
  useEffect(() => {
    let interval: any;
    if (isSessionRunning) {
      interval = setInterval(() => {
        setSimulatedCursors([
          {
            userId: "user_dev_engineer",
            name: "Siddharth (Lead Engineer)",
            x: Math.floor(200 + Math.random() * 300),
            y: Math.floor(100 + Math.random() * 200)
          },
          {
            userId: "user_pm_arjun",
            name: "Arjun (Project Manager)",
            x: Math.floor(150 + Math.random() * 250),
            y: Math.floor(120 + Math.random() * 180)
          }
        ]);
      }, 1800);
    } else {
      setSimulatedCursors([]);
    }
    return () => clearInterval(interval);
  }, [isSessionRunning]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshData = () => {
    const ws = collabEngine.getWorkspaces();
    setWorkspaces(ws);
    if (ws.length > 0 && !activeWorkspace) {
      setActiveWorkspace(ws[0]);
    }
    setPresences(collabEngine.getPresences());
    setActivities(collabEngine.getActivities());
    setTeams(collabEngine.teams); // Get pre-seeded teams
    setSavedSearches(collabEngine.getSavedSearches());
  };

  // --- WORKSPACE HANDLERS ---
  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const ws = collabEngine.createWorkspace(newWsName, newWsDesc);
    refreshData();
    setActiveWorkspace(ws);
    setNewWsName("");
    setNewWsDesc("");
    showToast(`Workspace "${ws.name}" created successfully!`);
  };

  // --- DISCUSSION HANDLERS ---
  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !newThreadTitle.trim()) return;

    const resourceRef = newThreadResourceId
      ? { domain: newThreadDomain, resourceId: newThreadResourceId, label: newThreadResourceLabel || "Resource Reference" }
      : undefined;

    const thread = collabEngine.createThread(activeWorkspace.id, newThreadTitle, resourceRef);
    refreshData();
    setThreads(collabEngine.getThreads(activeWorkspace.id));
    setActiveThread(thread);
    setNewThreadTitle("");
    setNewThreadResourceId("");
    setNewThreadResourceLabel("");
    showToast(`Discussion "${thread.title}" created!`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !newCommentText.trim()) return;

    const attachmentsPayload = uploadedFiles.map(f => ({
      id: `att_${Math.random().toString(36).substring(2, 6)}`,
      name: f.name,
      url: f.url,
      mimeType: "image/png",
      sizeBytes: f.size,
      uploadedBy: collabEngine.getCurrentUser().name,
      uploadedAt: new Date().toISOString()
    }));

    collabEngine.addComment(activeThread.id, newCommentText, attachmentsPayload);
    setComments(collabEngine.getComments(activeThread.id));
    setNewCommentText("");
    setUploadedFiles([]);
    refreshData();
    showToast("Comment published!");
  };

  const handleAddReply = (commentId: string) => {
    if (!newReplyText.trim()) return;

    collabEngine.addReply(commentId, newReplyText);
    setNewReplyText("");
    setActiveCommentForReply(null);
    if (activeThread) {
      setComments(collabEngine.getComments(activeThread.id));
    }
    refreshData();
    showToast("Reply published!");
  };

  const handleResolveThread = (threadId: string) => {
    collabEngine.resolveThread(threadId);
    if (activeWorkspace) {
      setThreads(collabEngine.getThreads(activeWorkspace.id));
    }
    refreshData();
    showToast("Discussion marked as resolved.");
  };

  const handleLockThread = (threadId: string) => {
    collabEngine.lockThread(threadId);
    if (activeWorkspace) {
      setThreads(collabEngine.getThreads(activeWorkspace.id));
    }
    refreshData();
    showToast("Thread locked.");
  };

  const handleAddReaction = (commentId: string, emoji: string) => {
    collabEngine.addReactionToComment(commentId, emoji);
    if (activeThread) {
      setComments(collabEngine.getComments(activeThread.id));
    }
    refreshData();
  };

  // --- ANNOTATION HANDLERS ---
  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !annotationContent.trim()) return;

    collabEngine.addAnnotation(
      activeWorkspace.id,
      {
        domain: annotationResourceDomain,
        resourceId: annotationResourceId,
        resourceType: annotationResourceType,
        label: annotationResourceLabel
      },
      annotationContent,
      {
        type: "POINT",
        coordinates: [[annotationX, annotationY]]
      }
    );

    setAnnotations(collabEngine.getAnnotations(activeWorkspace.id));
    setAnnotationContent("");
    refreshData();
    showToast("Annotation attached successfully!");
  };

  const handleResolveAnnotation = (id: string) => {
    collabEngine.resolveAnnotation(id);
    if (activeWorkspace) {
      setAnnotations(collabEngine.getAnnotations(activeWorkspace.id));
    }
    refreshData();
    showToast("Annotation resolved.");
  };

  // --- MEMBER HANDLERS ---
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !inviteEmail.trim()) return;

    collabEngine.inviteMember(activeWorkspace.id, inviteEmail, inviteRole);
    setMembers(collabEngine.getWorkspaceMembers(activeWorkspace.id));
    setInviteEmail("");
    showToast(`Invitation sent to ${inviteEmail}!`);
  };

  const handleUpdateRole = (memberId: string, role: WorkspaceRole) => {
    collabEngine.updateMemberRole(memberId, role);
    if (activeWorkspace) {
      setMembers(collabEngine.getWorkspaceMembers(activeWorkspace.id));
    }
    showToast("Member workspace permissions updated.");
  };

  // --- SEARCH HANDLERS ---
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const results = collabEngine.searchCollaborationResources(searchQuery, {
      workspaceId: activeWorkspace?.id,
      type: searchType ? (searchType as any) : undefined
    });
    setSearchResults(results);
  };

  const handleSaveSearch = () => {
    if (!saveSearchName.trim() || !searchQuery.trim()) return;
    collabEngine.saveSearch(saveSearchName, searchQuery, { type: searchType });
    setSavedSearches(collabEngine.getSavedSearches());
    setSaveSearchName("");
    showToast("Search layout saved successfully.");
  };

  const handleApplySavedSearch = (saved: any) => {
    setSearchQuery(saved.query);
    setSearchType(saved.filters.type || "");
    const results = collabEngine.searchCollaborationResources(saved.query, {
      workspaceId: activeWorkspace?.id,
      type: saved.filters.type
    });
    setSearchResults(results);
    setActiveTab("search");
  };

  // --- SHARED SESSION HANDLERS ---
  const handleCreateSession = (title: string, type: any, resourceId: string) => {
    if (!activeWorkspace) return;
    const session = collabEngine.createSharedSession(activeWorkspace.id, title, { type, id: resourceId });
    setActiveSession(session);
    setSharedSessions(collabEngine.getSharedSessions(activeWorkspace.id));
    setIsSessionRunning(true);
    showToast("Joint co-editing session started!", "success");
    setActiveTab("sessions");
  };

  // --- FILE ATTACHMENT SIMULATOR ---
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFiles(prev => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          url: "https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&q=80&w=400"
        }
      ]);
      showToast(`Staged file upload: ${file.name}`);
    }
  };

  // Filtered Activities
  const filteredActivities = activities.filter(act => {
    if (activityDomainFilter && act.domain !== activityDomainFilter) return false;
    if (activityTypeFilter && act.type !== activityTypeFilter) return false;
    if (activitySearch) {
      const q = activitySearch.toLowerCase();
      return (
        act.description.toLowerCase().includes(q) ||
        act.userName.toLowerCase().includes(q) ||
        act.resourceType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 border transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {toast.type === "success" ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Panel with Workspace Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Domain-014</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Enterprise Collaboration Hub</h1>
          </div>
          <p className="text-sm text-slate-500">
            Real-time discussions, annotations, presence panels, and cross-domain reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1 font-semibold">Active Workspace</label>
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={activeWorkspace?.id || ""}
              onChange={(e) => {
                const found = workspaces.find(w => w.id === e.target.value);
                if (found) setActiveWorkspace(found);
              }}
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const modal = document.getElementById("create-ws-modal");
              if (modal) modal.style.display = "flex";
            }}
            className="mt-5 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 px-3 rounded-lg transition-colors border border-slate-700"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2">
        {[
          { id: "dashboard", label: "Dashboard", icon: ActivityIcon },
          { id: "discussions", label: "Discussions", icon: MessageSquare },
          { id: "annotations", label: "Annotations", icon: Eye },
          { id: "sessions", label: "Shared Studio", icon: Monitor },
          { id: "activities", label: "Activity Log", icon: RefreshCw },
          { id: "search", label: "Global Search", icon: Search },
          { id: "members", label: "Team Members", icon: Users },
          { id: "future", label: "Future Engine", icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-4 text-sm font-semibold border-b-2 transition-all ${
                isActive
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Primary Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Workspace Panels (Left side columns on wide screens, full on smaller) */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* TAB: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && activeWorkspace && (
            <div className="flex flex-col gap-6">
              
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Active Threads</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{threads.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Annotations</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{annotations.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Active Sessions</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{sharedSessions.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Members Count</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{members.length}</p>
                </div>
              </div>

              {/* Workspace details & Resource Board */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Workspace Scope</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {activeWorkspace.description}
                </p>

                <h4 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">Cross-Domain Interactive Resource Board</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Astrology Consultation Discussions (DOMAIN-009)",
                      desc: "Consultative birth-charts & Vastu direction remediation coordination.",
                      domain: "DOMAIN-009",
                      resId: "consultation_delhi_01",
                      resLabel: "Delhi Sidharth Chart Review"
                    },
                    {
                      title: "Report Reviews (DOMAIN-010)",
                      desc: "Official PDFs and client report feedback comments.",
                      domain: "DOMAIN-010",
                      resId: "report_delhi_ext_final",
                      resLabel: "Structural Vastu Feasibility Draft"
                    },
                    {
                      title: "CAD & Floor Plan Annotations (DOMAIN-011)",
                      desc: "Spatial coordinates with precise degrees and alignment notes.",
                      domain: "DOMAIN-011",
                      resId: "cad_layout_delhi_south_01",
                      resLabel: "Lobby 3D Layout Blueprint"
                    },
                    {
                      title: "Vision AI Inspection Reviews (DOMAIN-012)",
                      desc: "Remediation threads on hairline cracks and concrete defects.",
                      domain: "DOMAIN-012",
                      resId: "vision_defect_img_109",
                      resLabel: "Inspection Wall Photo #109"
                    }
                  ].map((res, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 mb-1">{res.title}</h5>
                        <p className="text-xs text-slate-500 mb-4">{res.desc}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const foundThread = threads.find(t => t.resourceRef?.resourceId === res.resId);
                            if (foundThread) {
                              setActiveThread(foundThread);
                            } else {
                              const newT = collabEngine.createThread(activeWorkspace.id, `Review: ${res.resLabel}`, {
                                domain: res.domain as any,
                                resourceId: res.resId,
                                label: res.resLabel
                              });
                              setActiveThread(newT);
                              setThreads(collabEngine.getThreads(activeWorkspace.id));
                            }
                            setActiveTab("discussions");
                          }}
                          className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded"
                        >
                          Open Thread
                        </button>
                        <button
                          onClick={() => handleCreateSession(res.resLabel, "CAD_EDIT", res.resId)}
                          className="text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-3 rounded"
                        >
                          Co-Edit Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Teams */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-slate-900">Active Teams ({teams.length})</h3>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Department Isolation</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map(t => (
                    <div key={t.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50">
                      <h4 className="text-sm font-bold text-slate-800">{t.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">{t.description}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-medium">Members:</span>
                        <div className="flex -space-x-2">
                          {t.memberIds.map((mid, idx) => (
                            <span
                              key={idx}
                              title={mid}
                              className="h-6 w-6 rounded-full bg-emerald-200 border border-white text-[10px] font-bold text-emerald-800 flex items-center justify-center"
                            >
                              {mid.substring(5, 7).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DISCUSSIONS */}
          {activeTab === "discussions" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Thread list panel */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Discussions</h3>
                  <button
                    onClick={() => {
                      const div = document.getElementById("new-thread-form");
                      if (div) div.style.display = div.style.display === "none" ? "block" : "none";
                    }}
                    className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Create Thread Form */}
                <form
                  id="new-thread-form"
                  onSubmit={handleCreateThread}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-200 hidden flex-col gap-2"
                >
                  <input
                    type="text"
                    placeholder="Thread title..."
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-emerald-600 bg-white"
                  />
                  <select
                    value={newThreadDomain}
                    onChange={(e) => setNewThreadDomain(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white"
                  >
                    <option value="GENERAL">General Discussion</option>
                    <option value="DOMAIN-009">Astrology Consultation (D-009)</option>
                    <option value="DOMAIN-010">Report Reviews (D-010)</option>
                    <option value="DOMAIN-011">CAD Annotations (D-011)</option>
                    <option value="DOMAIN-012">Vision Inspection (D-012)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Ref Resource ID (Optional)"
                    value={newThreadResourceId}
                    onChange={(e) => setNewThreadResourceId(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-emerald-600 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Ref Label (e.g. Lobby CAD)"
                    value={newThreadResourceLabel}
                    onChange={(e) => setNewThreadResourceLabel(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-emerald-600 bg-white"
                  />
                  <button type="submit" className="w-full text-xs font-semibold bg-emerald-600 text-white py-1.5 rounded">
                    Launch Thread
                  </button>
                </form>

                {/* List */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px]">
                  {threads.map(t => {
                    const isSelected = activeThread?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setActiveThread(t)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-300"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            t.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {t.status}
                          </span>
                          {t.resourceRef && (
                            <span className="text-[10px] text-slate-400 font-mono font-bold">
                              {t.resourceRef.domain}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1">{t.title}</h4>
                        <p className="text-[10px] text-slate-400">Created by {t.createdBy}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat thread comments */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 md:col-span-2 flex flex-col justify-between min-h-[480px]">
                {activeThread ? (
                  <>
                    {/* Active Thread Title Details */}
                    <div className="border-b border-slate-200 pb-4 mb-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{activeThread.title}</h3>
                        {activeThread.resourceRef && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200">
                              Linked Resource: {activeThread.resourceRef.label} ({activeThread.resourceRef.resourceId})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {activeThread.status === "OPEN" && (
                          <>
                            <button
                              onClick={() => handleResolveThread(activeThread.id)}
                              className="text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 py-1 px-3 rounded"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleLockThread(activeThread.id)}
                              className="text-xs font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 py-1 px-3 rounded"
                            >
                              Lock
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Messages Flow */}
                    <div className="flex-1 overflow-y-auto max-h-[380px] space-y-4 mb-4 pr-2">
                      {comments.map((c) => (
                        <div key={c.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-700">{c.createdBy}</span>
                            <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                          </div>

                          {/* Markdown formatted content */}
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-3">
                            {c.content}
                          </p>

                          {/* Image/File attachments */}
                          {c.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {c.attachments.map(att => (
                                <a
                                  key={att.id}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <FileUp className="h-4 w-4 text-emerald-600" />
                                  <div className="text-left">
                                    <p className="text-[10px] font-bold truncate max-w-[120px]">{att.name}</p>
                                    <p className="text-[8px] text-slate-400">{(att.sizeBytes / 1024).toFixed(1)} KB</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Reactions */}
                          <div className="flex flex-wrap gap-1 items-center mb-3">
                            {c.reactions.map((r, i) => (
                              <span
                                key={i}
                                title={`Reacted by ${r.userName}`}
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-full cursor-pointer"
                                onClick={() => handleAddReaction(c.id, r.emoji)}
                              >
                                {r.emoji}
                              </span>
                            ))}
                            <div className="flex gap-1.5 ml-2">
                              {["👍", "❤️", "🔥", "⚠️"].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddReaction(c.id, emoji)}
                                  className="text-xs hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Reply section list */}
                          <div className="mt-3 pl-4 border-l-2 border-emerald-200 space-y-2">
                            {collabEngine.getReplies(c.id).map(r => (
                              <div key={r.id} className="p-2 bg-white rounded border border-slate-100 text-[11px]">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-600">{r.createdBy}</span>
                                  <span className="text-[9px] text-slate-400">{new Date(r.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-slate-700">{r.content}</p>
                              </div>
                            ))}

                            {activeCommentForReply === c.id ? (
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="text"
                                  placeholder="Type nested reply..."
                                  value={newReplyText}
                                  onChange={(e) => setNewReplyText(e.target.value)}
                                  className="flex-1 text-[11px] p-1.5 border border-slate-200 rounded focus:outline-emerald-600 bg-white"
                                />
                                <button
                                  onClick={() => handleAddReply(c.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded"
                                >
                                  Reply
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setActiveCommentForReply(c.id)}
                                className="text-[10px] font-bold text-emerald-600 hover:underline mt-1 block"
                              >
                                Write Reply
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Editor Input Form */}
                    {activeThread.status === "OPEN" ? (
                      <form onSubmit={handleAddComment} className="border-t border-slate-200 pt-4 flex flex-col gap-2">
                        {/* Staged attachments list */}
                        {uploadedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2 rounded">
                            {uploadedFiles.map((f, i) => (
                              <div key={i} className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                                {f.name}
                                <button type="button" onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))} className="hover:text-rose-600">×</button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type a comment... Supports markdown-like formatting (e.g. use @arjun.projectmanager)"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            className="flex-1 text-xs p-3 border border-slate-200 rounded-lg focus:outline-emerald-600 bg-slate-50 focus:bg-white transition-colors"
                          />
                          
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={triggerFileSelect}
                            title="Simulate attachment"
                            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg"
                          >
                            <FileUp className="h-4 w-4" />
                          </button>

                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-1.5">
                        <Lock className="h-4 w-4" />
                        This discussion thread is archived/locked.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <MessageSquare className="h-10 w-10 stroke-1" />
                    <p className="text-xs font-semibold">Select or launch a discussion thread to begin collaborating</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ANNOTATIONS OVERLAY STUDIO */}
          {activeTab === "annotations" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cross-Domain Annotation Studio</h3>
              <p className="text-sm text-slate-500 mb-6">
                Attach feedback coordinates directly to blueprints, inspection images, and technical results without altering original assets.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual simulator layer */}
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] relative border border-slate-800">
                  <span className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-slate-700">
                    Spatial CAD & Image Overlay Plane
                  </span>

                  {/* Blueprint simulation background */}
                  <div className="w-full max-w-sm h-48 border border-slate-800 bg-slate-950 rounded-lg relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="border border-emerald-500/20 rounded-full h-32 w-32 flex items-center justify-center text-emerald-400/40 text-[10px]">
                      Vastu Octagram Grid
                    </div>
                    
                    {/* Simulated current annotations on plane */}
                    {annotations.map((an) => {
                      if (an.geometry?.coordinates) {
                        const [x, y] = an.geometry.coordinates[0];
                        return (
                          <div
                            key={an.id}
                            style={{ left: `${(x % 100) + 20}%`, top: `${(y % 100) + 15}%` }}
                            className={`absolute h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow animate-pulse cursor-pointer ${
                              an.resolved ? "bg-slate-600" : "bg-emerald-500 hover:scale-125 transition-transform"
                            }`}
                            title={`Annotation: ${an.content}`}
                          >
                            ●
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <p className="text-slate-400 text-[10px] mt-4 font-mono">
                    Total overlay nodes rendered: {annotations.length}
                  </p>
                </div>

                {/* Form and list */}
                <div className="flex flex-col gap-4">
                  <form onSubmit={handleAddAnnotation} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Add Overlay Pin Annotation</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={annotationResourceDomain}
                        onChange={(e) => setAnnotationResourceDomain(e.target.value as any)}
                        className="text-xs p-2 border border-slate-200 rounded bg-white focus:outline-emerald-600"
                      >
                        <option value="DOMAIN-011">CAD Engine (D-011)</option>
                        <option value="DOMAIN-012">Vision AI Inspection (D-012)</option>
                        <option value="DOMAIN-010">Report Reviews (D-010)</option>
                      </select>

                      <select
                        value={annotationResourceType}
                        onChange={(e) => setAnnotationResourceType(e.target.value as any)}
                        className="text-xs p-2 border border-slate-200 rounded bg-white focus:outline-emerald-600"
                      >
                        <option value="FLOOR_PLAN">Floor Plan</option>
                        <option value="VISION_IMAGE">Vision Image</option>
                        <option value="REPORT">Document Report</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Ref Asset Name"
                        value={annotationResourceLabel}
                        onChange={(e) => setAnnotationResourceLabel(e.target.value)}
                        className="text-xs p-2 border border-slate-200 rounded bg-white focus:outline-emerald-600"
                      />
                      <input
                        type="text"
                        placeholder="Ref Asset ID"
                        value={annotationResourceId}
                        onChange={(e) => setAnnotationResourceId(e.target.value)}
                        className="text-xs p-2 border border-slate-200 rounded bg-white focus:outline-emerald-600"
                      />
                    </div>

                    <textarea
                      placeholder="Enter feedback details..."
                      rows={2}
                      value={annotationContent}
                      onChange={(e) => setAnnotationContent(e.target.value)}
                      className="text-xs p-2 border border-slate-200 rounded bg-white focus:outline-emerald-600"
                    ></textarea>

                    <button type="submit" className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded transition-colors">
                      Attach Spatial Pin
                    </button>
                  </form>
                </div>
              </div>

              {/* Annotation Log */}
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Annotation Audit Log</h4>
                <div className="space-y-3">
                  {annotations.map((an) => (
                    <div key={an.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            {an.resourceRef.resourceType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">
                            {an.resourceRef.domain} / {an.resourceRef.resourceId}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mb-1">{an.content}</p>
                        <p className="text-[10px] text-slate-400">Linked to "{an.resourceRef.label}" by {an.createdBy}</p>
                      </div>

                      <div>
                        {an.resolved ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            Resolved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleResolveAnnotation(an.id)}
                            className="text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 py-1.5 px-3 rounded text-slate-700 shadow-sm"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SHARED CO-EDITING STUDIO */}
          {activeTab === "sessions" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Live Shared Session Studio</h3>
                <p className="text-sm text-slate-500">
                  Initiate dynamic real-time collaboration. Cursors of Siddharth and PM Arjun will sync, simulating joint reviews.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsSessionRunning(true)}
                  disabled={isSessionRunning}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 px-4 rounded disabled:opacity-50"
                >
                  Join / Start Simulated Co-Edit Session
                </button>
                <button
                  onClick={() => setIsSessionRunning(false)}
                  disabled={!isSessionRunning}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2 px-4 rounded disabled:opacity-50"
                >
                  End Session
                </button>
              </div>

              {isSessionRunning ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 min-h-[350px] relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-center text-white z-10">
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                      ● LIVE SESSION ON
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Co-editing Delhi South Floor Plan (plan_lobby_01)
                    </span>
                  </div>

                  {/* Simulated interactive whiteboard/canvas with cursors */}
                  <div className="flex-1 w-full relative">
                    {/* Simulated background plan lines */}
                    <svg className="absolute inset-0 h-full w-full opacity-10 stroke-white stroke-1">
                      <line x1="10%" y1="20%" x2="90%" y2="20%" />
                      <line x1="30%" y1="10%" x2="30%" y2="90%" />
                      <circle cx="50%" cy="50%" r="40" fill="none" />
                    </svg>

                    {/* Rendering simulated cursors */}
                    {simulatedCursors.map((cursor, i) => (
                      <div
                        key={i}
                        style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
                        className="absolute flex flex-col items-start z-20 pointer-events-none transition-all duration-1000 ease-out"
                      >
                        <div className="text-[10px] text-white bg-slate-800/90 backdrop-blur border border-slate-700 px-2 py-0.5 rounded shadow">
                          {cursor.name}
                        </div>
                        <span className="text-emerald-400 text-lg">✦</span>
                      </div>
                    ))}

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-xs text-slate-500 font-semibold font-mono animate-pulse">
                        Siddharth and Arjun's cursors are moving... Simulated peer activity tracking active.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-slate-400 text-[10px] font-semibold">
                    <span>Host: Pavitra Sharma (You)</span>
                    <span>Active Session Peers: Lead Engineer, PM Arjun</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Monitor className="h-10 w-10 stroke-1" />
                  <p className="text-sm font-semibold">Click "Join" above to boot simulated real-time peer presence & canvas sharing</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: ACTIVITY FEED */}
          {activeTab === "activities" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Unified Platform Activity Feed</h3>
                  <p className="text-sm text-slate-500">Chronological list of collaborative edits, reviews, and uploads across the OS.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={activityDomainFilter}
                    onChange={(e) => setActivityDomainFilter(e.target.value)}
                    className="text-xs p-2 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="">All Domains</option>
                    <option value="DOMAIN-009">Consultation discussions (D-009)</option>
                    <option value="DOMAIN-010">Report Reviews (D-010)</option>
                    <option value="DOMAIN-011">CAD Annotations (D-011)</option>
                    <option value="DOMAIN-012">Vision AI (D-012)</option>
                    <option value="DOMAIN-013">Workflow events (D-013)</option>
                    <option value="DOMAIN-014">Collaboration (D-014)</option>
                  </select>

                  <select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value as any)}
                    className="text-xs p-2 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="">All Types</option>
                    <option value="COMMENT">Comments</option>
                    <option value="APPROVAL">Approvals</option>
                    <option value="SPATIAL_CHANGE">Spatial Changes</option>
                    <option value="UPLOAD">Uploads</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Search feed..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="text-xs p-2 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredActivities.map((act) => (
                  <div key={act.id} className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-800">
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-800">{act.userName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{act.description}</p>
                      <div className="flex gap-2 items-center">
                        <span className="bg-slate-100 text-slate-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                          {act.domain}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          Resource: {act.resourceType} / {act.resourceId}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GLOBAL SEARCH */}
          {activeTab === "search" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Full-Text Search & Discovery Index</h3>
                <p className="text-sm text-slate-500">Scan discussions, comments, annotations, attachments, and teams.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter search phrase..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm p-3 border border-slate-200 rounded-lg focus:outline-emerald-600"
                />

                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="">All Fields</option>
                  <option value="THREAD">Discussion Threads</option>
                  <option value="COMMENT">Comments</option>
                  <option value="ANNOTATION">Annotations</option>
                  <option value="MEMBER">Members</option>
                  <option value="ATTACHMENT">Attachments</option>
                </select>

                <button
                  onClick={handleSearch}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg text-sm"
                >
                  Search Index
                </button>
              </div>

              {/* Save layout */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Name this search..."
                    value={saveSearchName}
                    onChange={(e) => setSaveSearchName(e.target.value)}
                    className="text-xs p-2 border border-slate-200 rounded bg-white"
                  />
                  <button
                    onClick={handleSaveSearch}
                    className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded"
                  >
                    Save Search Structure
                  </button>
                </div>
              </div>

              {/* Saved searches lists */}
              {savedSearches.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2.5 tracking-wider">Saved Searches</h4>
                  <div className="flex flex-wrap gap-2">
                    {savedSearches.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleApplySavedSearch(s)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 px-3 rounded border border-slate-200"
                      >
                        {s.name} ("{s.query}")
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Results Queue ({searchResults.length})</h4>
                <div className="space-y-3">
                  {searchResults.map((res, i) => (
                    <div key={i} className="p-4 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                          {res.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Found {new Date(res.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 mb-1">{res.title}</h5>
                      <p className="text-xs text-slate-500 leading-relaxed">{res.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEMBERS */}
          {activeTab === "members" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Workspace Membership Console</h3>
                  <p className="text-sm text-slate-500">Manage user roles, administrative permissions, and workspace invitations.</p>
                </div>

                <form onSubmit={handleInviteMember} className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter email to invite..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded focus:outline-emerald-600 bg-slate-50"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="text-xs p-2.5 border border-slate-200 rounded bg-slate-50"
                  >
                    <option value="ENGINEER">Engineer</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="ADMIN">Admin</option>
                    <option value="END_USER">End User</option>
                  </select>
                  <button type="submit" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded flex items-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    Invite
                  </button>
                </form>
              </div>

              {/* Members Queue */}
              <div className="space-y-4">
                {members.map((m) => (
                  <div key={m.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {m.email.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{m.email}</p>
                        <p className="text-[10px] text-slate-400">Joined on {new Date(m.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {m.status}
                      </span>

                      <select
                        value={m.role}
                        onChange={(e) => handleUpdateRole(m.id, e.target.value as any)}
                        className="text-xs p-1.5 border border-slate-200 rounded bg-white"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="PROJECT_MANAGER">Project Manager</option>
                        <option value="ENGINEER">Engineer</option>
                        <option value="END_USER">End User</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FUTURE EXTENSION POINTS */}
          {activeTab === "future" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Technical Future Extension Points</h3>
                <p className="text-sm text-slate-500">Documented specifications and clean mock integrations preparing the system for live telecommunications and voice AI services.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Volume2 className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">Voice & Audio Collaboration Channels</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Designed to map into WebRTC SDP negotiation pipelines. Exposes socket listeners and audio buffers.
                  </p>
                  <button className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-3 rounded font-semibold">
                    Inspect Call Hooks
                  </button>
                </div>

                <div className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">Dynamic Multi-Peer Video Conferencing</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Prepares high-frequency frame routing layers, custom webcam canvases, and screen-sharing pipelines.
                  </p>
                  <button className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-3 rounded font-semibold">
                    Inspect Frame Mappings
                  </button>
                </div>

                <div className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">Automated Meeting Summarization</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Leverages advanced neural processing context windows to summarize conversation strings into structured actionable task lists.
                  </p>
                  <button className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 py-1.5 px-3 rounded font-bold">
                    Inspect Engine Adapters
                  </button>
                </div>

                <div className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">Enterprise Whiteboards & Diagrams</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Visual diagram overlays for drawing alignment geometries and spatial planning directly.
                  </p>
                  <button className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-3 rounded font-semibold">
                    Inspect Canvas Handlers
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Live Presence & Peers Panel (Right column on wide screens) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Peer Presence Tracker</h3>
            <div className="space-y-3">
              {presences.map((p) => {
                let statusColor = "bg-slate-400";
                if (p.status === "ONLINE") statusColor = "bg-emerald-500";
                else if (p.status === "AWAY") statusColor = "bg-amber-400";

                return (
                  <div key={p.userId} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{p.userName}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-semibold mb-1">
                      Role: <span className="text-slate-600">{p.role}</span>
                    </div>

                    {p.status === "ONLINE" && p.activeView && (
                      <div className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full inline-block">
                        Viewing: {p.activeView.toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Review Sign-off list */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pending Reviews</h3>
            <div className="space-y-2">
              {[
                { title: "Noida Vastu Layout Draft", role: "Vastu Auditor" },
                { title: "Defect Image Wall #12", role: "Concrete Engineer" }
              ].map((item, i) => (
                <div key={i} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1">{item.title}</h4>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Assigned: {item.role}</span>
                  <button
                    onClick={() => {
                      showToast(`Sign-off review initiated for ${item.title}`);
                    }}
                    className="text-[10px] font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 py-1 mt-2.5 rounded text-center w-full shadow-sm"
                  >
                    Start Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: CREATE WORKSPACE (Injected in DOM, handled by vanilla display styles) */}
      <div
        id="create-ws-modal"
        style={{ display: "none" }}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Create New Collaboration Workspace</h3>
            <button
              onClick={() => {
                const modal = document.getElementById("create-ws-modal");
                if (modal) modal.style.display = "none";
              }}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Workspace Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Noida Residential Site"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="text-xs p-2 border border-slate-200 rounded focus:outline-emerald-600 bg-slate-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Description</label>
              <textarea
                placeholder="Brief purpose..."
                rows={3}
                value={newWsDesc}
                onChange={(e) => setNewWsDesc(e.target.value)}
                className="text-xs p-2 border border-slate-200 rounded focus:outline-emerald-600 bg-slate-50"
              ></textarea>
            </div>

            <button
              type="submit"
              onClick={() => {
                const modal = document.getElementById("create-ws-modal");
                if (modal) modal.style.display = "none";
              }}
              className="w-full text-xs font-semibold bg-slate-900 text-white py-2.5 rounded hover:bg-slate-800 transition-colors"
            >
              Create Workspace
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};
