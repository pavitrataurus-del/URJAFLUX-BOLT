import {
  Workspace,
  WorkspaceMember,
  Team,
  Conversation,
  DiscussionThread,
  Comment,
  Reply,
  Mention,
  Activity,
  Presence,
  SharedSession,
  Annotation,
  Attachment,
  Reaction,
  WorkspaceRole
} from "./CollaborationTypes";
import { NotificationEngine } from "../workflow/SchedulerNotifications";
import { EnterpriseEventBus } from "../workflow/EventBus";

export class CollaborationEngine {
  private static instance: CollaborationEngine;

  private workspaces: Workspace[] = [];
  private members: WorkspaceMember[] = [];
  public teams: Team[] = [];
  private conversations: Conversation[] = [];
  private threads: DiscussionThread[] = [];
  private comments: Comment[] = [];
  private replies: Reply[] = [];
  private activities: Activity[] = [];
  private presences: Presence[] = [];
  private sharedSessions: SharedSession[] = [];
  private annotations: Annotation[] = [];
  private savedSearches: { id: string; name: string; query: string; filters: any }[] = [];

  // Active session details
  private currentUserId = "user_pavitra";
  private currentUserEmail = "pavitra.taurus@gmail.com";
  private currentUserName = "Pavitra Sharma";
  private currentUserRole: WorkspaceRole = "ADMIN";

  private constructor() {
    this.loadFromStorage();
    if (this.workspaces.length === 0) {
      this.seedInitialData();
    }
  }

  public static getInstance(): CollaborationEngine {
    if (!CollaborationEngine.instance) {
      CollaborationEngine.instance = new CollaborationEngine();
    }
    return CollaborationEngine.instance;
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("urjaflux_collab_workspaces", JSON.stringify(this.workspaces));
        localStorage.setItem("urjaflux_collab_members", JSON.stringify(this.members));
        localStorage.setItem("urjaflux_collab_teams", JSON.stringify(this.teams));
        localStorage.setItem("urjaflux_collab_conversations", JSON.stringify(this.conversations));
        localStorage.setItem("urjaflux_collab_threads", JSON.stringify(this.threads));
        localStorage.setItem("urjaflux_collab_comments", JSON.stringify(this.comments));
        localStorage.setItem("urjaflux_collab_replies", JSON.stringify(this.replies));
        localStorage.setItem("urjaflux_collab_activities", JSON.stringify(this.activities));
        localStorage.setItem("urjaflux_collab_presences", JSON.stringify(this.presences));
        localStorage.setItem("urjaflux_collab_shared_sessions", JSON.stringify(this.sharedSessions));
        localStorage.setItem("urjaflux_collab_annotations", JSON.stringify(this.annotations));
        localStorage.setItem("urjaflux_collab_saved_searches", JSON.stringify(this.savedSearches));
      } catch (err) {
        console.error("Failed to save collaboration engine state to localStorage:", err);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const w = localStorage.getItem("urjaflux_collab_workspaces");
        if (w) this.workspaces = JSON.parse(w);

        const m = localStorage.getItem("urjaflux_collab_members");
        if (m) this.members = JSON.parse(m);

        const t = localStorage.getItem("urjaflux_collab_teams");
        if (t) this.teams = JSON.parse(t);

        const c = localStorage.getItem("urjaflux_collab_conversations");
        if (c) this.conversations = JSON.parse(c);

        const th = localStorage.getItem("urjaflux_collab_threads");
        if (th) this.threads = JSON.parse(th);

        const co = localStorage.getItem("urjaflux_collab_comments");
        if (co) this.comments = JSON.parse(co);

        const re = localStorage.getItem("urjaflux_collab_replies");
        if (re) this.replies = JSON.parse(re);

        const ac = localStorage.getItem("urjaflux_collab_activities");
        if (ac) this.activities = JSON.parse(ac);

        const pr = localStorage.getItem("urjaflux_collab_presences");
        if (pr) this.presences = JSON.parse(pr);

        const ss = localStorage.getItem("urjaflux_collab_shared_sessions");
        if (ss) this.sharedSessions = JSON.parse(ss);

        const an = localStorage.getItem("urjaflux_collab_annotations");
        if (an) this.annotations = JSON.parse(an);

        const ssr = localStorage.getItem("urjaflux_collab_saved_searches");
        if (ssr) this.savedSearches = JSON.parse(ssr);
      } catch (err) {
        console.error("Failed to load collaboration state from localStorage:", err);
      }
    }
  }

  // Active Session Identity Setters
  public setCurrentUser(id: string, email: string, name: string, role: WorkspaceRole) {
    this.currentUserId = id;
    this.currentUserEmail = email;
    this.currentUserName = name;
    this.currentUserRole = role;
    this.updatePresence(id, name, role, "ONLINE");
  }

  public getCurrentUser() {
    return {
      id: this.currentUserId,
      email: this.currentUserEmail,
      name: this.currentUserName,
      role: this.currentUserRole
    };
  }

  // --- SEED INITIAL DATA ---
  private seedInitialData(): void {
    const defaultWorkspaceId = "ws_primary_hq";
    
    // 1. Core Workspace
    this.workspaces = [
      {
        id: defaultWorkspaceId,
        version: 1,
        name: "URJAFLUX Enterprise HQ",
        description: "Primary orchestrating and collaborative space for central corporate engineering, architectural verification, and Vastu compliance audits.",
        status: "ACTIVE",
        settings: {
          allowExternalMembers: true,
          requireApprovalForFiles: false,
          defaultRole: "ENGINEER"
        },
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "ws_site_audit_delhi",
        version: 1,
        name: "Delhi South Ext Site Layout",
        description: "Target workspace for Noida-Delhi residential floor planning, remediation tasks, and real-time inspector coordination.",
        status: "ACTIVE",
        settings: {
          allowExternalMembers: false,
          requireApprovalForFiles: true,
          defaultRole: "ENGINEER"
        },
        createdBy: "user_pavitra",
        updatedBy: "user_pavitra",
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      }
    ];

    // 2. Members
    this.members = [
      {
        id: "member_1",
        version: 1,
        workspaceId: defaultWorkspaceId,
        userId: "user_pavitra",
        email: "pavitra.taurus@gmail.com",
        role: "ADMIN",
        status: "ACTIVE",
        joinedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "member_2",
        version: 1,
        workspaceId: defaultWorkspaceId,
        userId: "user_dev_engineer",
        email: "engineer.siddharth@urjaflux.com",
        role: "ENGINEER",
        status: "ACTIVE",
        joinedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "member_3",
        version: 1,
        workspaceId: defaultWorkspaceId,
        userId: "user_pm_arjun",
        email: "arjun.projectmanager@urjaflux.com",
        role: "PROJECT_MANAGER",
        status: "ACTIVE",
        joinedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "member_4",
        version: 1,
        workspaceId: defaultWorkspaceId,
        userId: "user_end_client",
        email: "client.kapoor@gmail.com",
        role: "END_USER",
        status: "ACTIVE",
        joinedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        metadata: {}
      }
    ];

    // 3. Teams
    this.teams = [
      {
        id: "team_vastu_tech",
        version: 1,
        name: "Vastu & Astrological Analysis Team",
        description: "Specialists in alignment algorithms, Lal Kitab parsing, and planetary offset mappings.",
        workspaceId: defaultWorkspaceId,
        memberIds: ["user_pavitra", "user_dev_engineer"],
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "team_site_inspectors",
        version: 1,
        name: "Field Survey & Inspection Squad",
        description: "Runs Drone/Vision AI processing pipelines and structural site updates.",
        workspaceId: defaultWorkspaceId,
        memberIds: ["user_dev_engineer", "user_pm_arjun"],
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        metadata: {}
      }
    ];

    // 4. Threads for Cross-Domain Integrations
    this.threads = [
      {
        id: "th_vastu_9",
        version: 1,
        workspaceId: defaultWorkspaceId,
        title: "DOMAIN-009: Client Vastu Consultation Plan Alignment",
        status: "OPEN",
        resourceRef: {
          domain: "DOMAIN-009",
          resourceId: "consultation_delhi_01",
          label: "Vastu Consultation Delhi-Sidharth"
        },
        createdBy: "user_pm_arjun",
        updatedBy: "user_pm_arjun",
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "th_report_10",
        version: 1,
        workspaceId: defaultWorkspaceId,
        title: "DOMAIN-010: Structural Vastu Feasibility Report Review",
        status: "OPEN",
        resourceRef: {
          domain: "DOMAIN-010",
          resourceId: "report_delhi_ext_final",
          label: "Noida Sector 62 Feasibility Document"
        },
        createdBy: "user_pavitra",
        updatedBy: "user_pavitra",
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "th_cad_11",
        version: 1,
        workspaceId: defaultWorkspaceId,
        title: "DOMAIN-011: Main Entrance Spatial Deviation Adjustment",
        status: "OPEN",
        resourceRef: {
          domain: "DOMAIN-011",
          resourceId: "cad_layout_delhi_south_01",
          label: "Delhi South Ext 3D Floor Plan CAD"
        },
        createdBy: "user_dev_engineer",
        updatedBy: "user_dev_engineer",
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "th_vision_12",
        version: 1,
        workspaceId: defaultWorkspaceId,
        title: "DOMAIN-012: Vision AI concrete crack inspection anomaly review",
        status: "OPEN",
        resourceRef: {
          domain: "DOMAIN-012",
          resourceId: "vision_defect_img_109",
          label: "Northeast Wall Crack Image Annotation"
        },
        createdBy: "user_dev_engineer",
        updatedBy: "user_dev_engineer",
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      }
    ];

    // 5. Comments & Nested Replies (Phase 3)
    this.comments = [
      {
        id: "c_vastu_01",
        version: 1,
        threadId: "th_vastu_9",
        content: "The Vastu analysis of the client's natal chart shows a severe Saturn block in the West quadrant. @arjun.projectmanager, have we checked the door measurements?",
        attachments: [],
        reactions: [{ id: "react_1", emoji: "👍", userId: "user_pm_arjun", userName: "Arjun ProjectManager" }],
        mentions: [
          {
            id: "m_1",
            type: "USER",
            targetId: "user_pm_arjun",
            label: "@arjun.projectmanager",
            startIndex: 83,
            length: 21
          }
        ],
        createdBy: "user_pavitra",
        updatedBy: "user_pavitra",
        createdAt: new Date(Date.now() - 2.5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2.5 * 24 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "c_cad_01",
        version: 1,
        threadId: "th_cad_11",
        content: "We need to offset the bathroom layout by 3.5 degrees West to achieve a full 98% Vastu rating. Let's execute this update immediately. Check the attached floor plan snippet.",
        attachments: [
          {
            id: "att_cad_01",
            name: "bathroom_layout_offset.png",
            url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
            mimeType: "image/png",
            sizeBytes: 1048576,
            uploadedBy: "user_dev_engineer",
            uploadedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString()
          }
        ],
        reactions: [{ id: "react_2", emoji: "🔥", userId: "user_pavitra", userName: "Pavitra" }],
        mentions: [],
        createdBy: "user_dev_engineer",
        updatedBy: "user_dev_engineer",
        createdAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      }
    ];

    this.replies = [
      {
        id: "re_vastu_01",
        version: 1,
        commentId: "c_vastu_01",
        content: "Yes, verified! The current door width is 1.2m, which is clear. I will sync this with the CAD schema. @engineer.siddharth, please log this in the active remediation workflow.",
        reactions: [],
        mentions: [
          {
            id: "m_2",
            type: "USER",
            targetId: "user_dev_engineer",
            label: "@engineer.siddharth",
            startIndex: 79,
            length: 19
          }
        ],
        createdBy: "user_pm_arjun",
        updatedBy: "user_pm_arjun",
        createdAt: new Date(Date.now() - 2.2 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2.2 * 24 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      }
    ];

    // 6. Annotations (Phase 5)
    this.annotations = [
      {
        id: "an_cad_01",
        version: 1,
        workspaceId: defaultWorkspaceId,
        resourceRef: {
          domain: "DOMAIN-011",
          resourceId: "cad_layout_delhi_south_01",
          resourceType: "FLOOR_PLAN",
          label: "Main Lobby Entrance CAD Draft"
        },
        geometry: {
          type: "POINT",
          coordinates: [[120, 240]]
        },
        content: "Move entrance 15cm right to perfectly center Vastu axis alignment",
        resolved: false,
        createdBy: "user_pavitra",
        updatedBy: "user_pavitra",
        createdAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      },
      {
        id: "an_vision_02",
        version: 1,
        workspaceId: defaultWorkspaceId,
        resourceRef: {
          domain: "DOMAIN-012",
          resourceId: "vision_defect_img_109",
          resourceType: "VISION_IMAGE",
          label: "Inspection Image #109 Wall Defect"
        },
        geometry: {
          type: "RECTANGLE",
          coordinates: [[50, 50], [200, 150]]
        },
        content: "Hairline crack detected. Severity HIGH. Remediation needed before concrete pours.",
        resolved: false,
        createdBy: "user_dev_engineer",
        updatedBy: "user_dev_engineer",
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        isDeleted: false,
        metadata: {}
      }
    ];

    // 7. Simulated Live Presences (Phase 7)
    this.presences = [
      {
        userId: "user_pavitra",
        userName: "Pavitra Sharma",
        role: "ADMIN",
        status: "ONLINE",
        lastSeen: new Date().toISOString(),
        activeView: "collaboration",
        cursorCoordinates: { x: 340, y: 560 }
      },
      {
        userId: "user_dev_engineer",
        userName: "Siddharth (Lead Engineer)",
        role: "ENGINEER",
        status: "ONLINE",
        lastSeen: new Date().toISOString(),
        activeView: "cad",
        cursorCoordinates: { x: 712, y: 432 }
      },
      {
        userId: "user_pm_arjun",
        userName: "Arjun (Project Manager)",
        role: "PROJECT_MANAGER",
        status: "AWAY",
        lastSeen: new Date(Date.now() - 12 * 60000).toISOString(),
        activeView: "workflow"
      },
      {
        userId: "user_end_client",
        userName: "Rohan Kapoor (Client)",
        role: "END_USER",
        status: "OFFLINE",
        lastSeen: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ];

    // 8. Shared Interactive Collaboration Sessions
    this.sharedSessions = [
      {
        id: "session_cad_collab",
        version: 1,
        workspaceId: defaultWorkspaceId,
        title: "3D Floor Plan alignment co-review",
        hostId: "user_pavitra",
        activeParticipantIds: ["user_pavitra", "user_dev_engineer"],
        resourceRef: {
          type: "CAD_EDIT",
          id: "cad_layout_delhi_south_01"
        },
        createdBy: "user_pavitra",
        updatedBy: "user_pavitra",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        metadata: {}
      }
    ];

    // 9. Initial Activity Log
    this.activities = [
      {
        id: "act_1",
        timestamp: new Date(Date.now() - 3.5 * 24 * 3600 * 1000).toISOString(),
        domain: "DOMAIN-011",
        type: "SPATIAL_CHANGE",
        userId: "user_dev_engineer",
        userName: "Siddharth",
        description: "Altered door coordinate mappings inside Delhi South plan",
        resourceId: "cad_layout_delhi_south_01",
        resourceType: "FLOOR_PLAN"
      },
      {
        id: "act_2",
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        domain: "DOMAIN-012",
        type: "VISION_REVIEW",
        userId: "user_pm_arjun",
        userName: "Arjun ProjectManager",
        description: "Approved inspection crack classification report #102",
        resourceId: "vision_defect_img_102",
        resourceType: "VISION_IMAGE"
      },
      {
        id: "act_3",
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        domain: "DOMAIN-010",
        type: "REPORT_GENERATION",
        userId: "user_pavitra",
        userName: "Pavitra",
        description: "Generated final Astrological planetary alignment feasibility report",
        resourceId: "report_delhi_ext_final",
        resourceType: "REPORT"
      }
    ];

    this.saveToStorage();
  }

  // --- WORKSPACE & MEMBERSHIP OPERATIONS (PHASE 2) ---
  public getWorkspaces(): Workspace[] {
    return this.workspaces.filter(w => !w.isDeleted);
  }

  public createWorkspace(name: string, description: string, settings?: Partial<Workspace['settings']>): Workspace {
    const ws: Workspace = {
      id: `ws_${Math.random().toString(36).substring(2, 11)}`,
      version: 1,
      name,
      description,
      status: "ACTIVE",
      settings: {
        allowExternalMembers: settings?.allowExternalMembers ?? true,
        requireApprovalForFiles: settings?.requireApprovalForFiles ?? false,
        defaultRole: settings?.defaultRole ?? "ENGINEER"
      },
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      metadata: {}
    };

    this.workspaces.push(ws);

    // Auto-add creator as ADMIN member
    this.joinWorkspace(ws.id, this.currentUserId, this.currentUserEmail, "ADMIN");

    this.logActivity(
      "DOMAIN-014",
      "UPLOAD",
      `Created Workspace "${name}"`,
      ws.id,
      "WORKSPACE"
    );

    this.saveToStorage();
    return ws;
  }

  public joinWorkspace(workspaceId: string, userId: string, email: string, role: WorkspaceRole): WorkspaceMember {
    const existing = this.members.find(m => m.workspaceId === workspaceId && m.userId === userId && !m.isDeleted);
    if (existing) return existing;

    const member: WorkspaceMember = {
      id: `member_${Math.random().toString(36).substring(2, 11)}`,
      version: 1,
      workspaceId,
      userId,
      email,
      role,
      status: "ACTIVE",
      joinedAt: new Date().toISOString(),
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      metadata: {}
    };

    this.members.push(member);
    this.saveToStorage();
    return member;
  }

  public inviteMember(workspaceId: string, email: string, role: WorkspaceRole): void {
    const invitedUserMockId = `user_${Math.random().toString(36).substring(2, 6)}`;
    const member = this.joinWorkspace(workspaceId, invitedUserMockId, email, role);
    member.status = "PENDING"; // Needs to accept

    // Emit secure notification through DOMAIN-013 NotificationEngine
    NotificationEngine.getInstance().send(
      "EMAIL",
      email,
      "Enterprise Workspace Invitation",
      `You have been invited to join the URJAFLUX Workspace by ${this.currentUserName} as a ${role}.`
    );

    this.logActivity(
      "DOMAIN-014",
      "COMMENT",
      `Invited ${email} to Workspace`,
      workspaceId,
      "WORKSPACE"
    );

    this.saveToStorage();
  }

  public getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    return this.members.filter(m => m.workspaceId === workspaceId && !m.isDeleted);
  }

  public updateMemberRole(memberId: string, role: WorkspaceRole): void {
    const member = this.members.find(m => m.id === memberId);
    if (member) {
      member.role = role;
      member.updatedAt = new Date().toISOString();
      member.updatedBy = this.currentUserId;
      this.saveToStorage();
    }
  }

  // --- DISCUSSION ENGINE OPERATIONS (PHASE 3) ---
  public getThreads(workspaceId: string): DiscussionThread[] {
    return this.threads.filter(t => t.workspaceId === workspaceId && !t.isDeleted);
  }

  public createThread(
    workspaceId: string,
    title: string,
    resourceRef?: DiscussionThread['resourceRef']
  ): DiscussionThread {
    const thread: DiscussionThread = {
      id: `th_${Math.random().toString(36).substring(2, 11)}`,
      version: 1,
      workspaceId,
      title,
      status: "OPEN",
      resourceRef,
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      metadata: {}
    };

    this.threads.push(thread);

    this.logActivity(
      resourceRef?.domain || "DOMAIN-014",
      "COMMENT",
      `Created discussion thread "${title}"`,
      thread.id,
      "DISCUSSION_THREAD"
    );

    this.saveToStorage();
    return thread;
  }

  public resolveThread(threadId: string): void {
    const thread = this.threads.find(t => t.id === threadId);
    if (thread) {
      thread.status = "RESOLVED";
      thread.resolvedBy = this.currentUserId;
      thread.resolvedAt = new Date().toISOString();
      thread.updatedAt = new Date().toISOString();
      thread.updatedBy = this.currentUserId;

      this.logActivity(
        "DOMAIN-014",
        "APPROVAL",
        `Resolved thread: "${thread.title}"`,
        threadId,
        "DISCUSSION_THREAD"
      );

      this.saveToStorage();
    }
  }

  public lockThread(threadId: string): void {
    const thread = this.threads.find(t => t.id === threadId);
    if (thread) {
      thread.status = "LOCKED";
      thread.lockedBy = this.currentUserId;
      thread.lockedAt = new Date().toISOString();
      thread.updatedAt = new Date().toISOString();
      thread.updatedBy = this.currentUserId;

      this.saveToStorage();
    }
  }

  public getComments(threadId: string): Comment[] {
    return this.comments.filter(c => c.threadId === threadId && !c.isDeleted);
  }

  public addComment(threadId: string, content: string, attachments: Attachment[] = []): Comment {
    // 1. Parse Mentions (Phase 4)
    const mentions = this.parseMentions(content);

    const comment: Comment = {
      id: `c_${Math.random().toString(36).substring(2, 11)}`,
      version: 1,
      threadId,
      content,
      attachments,
      reactions: [],
      mentions,
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      metadata: {}
    };

    this.comments.push(comment);

    // 2. Dispatch Mention Alerts via DOMAIN-013 (Phase 8)
    this.dispatchMentionAlerts(mentions, threadId, content);

    // 3. Log Activity (Phase 6)
    const thread = this.threads.find(t => t.id === threadId);
    this.logActivity(
      thread?.resourceRef?.domain || "DOMAIN-014",
      "COMMENT",
      `Added comment: "${content.substring(0, 45)}..."`,
      comment.id,
      "COMMENT"
    );

    this.saveToStorage();
    return comment;
  }

  public addReactionToComment(commentId: string, emoji: string): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      const existing = comment.reactions.find(r => r.emoji === emoji && r.userId === this.currentUserId);
      if (existing) {
        comment.reactions = comment.reactions.filter(r => !(r.emoji === emoji && r.userId === this.currentUserId));
      } else {
        comment.reactions.push({
          id: `react_${Math.random().toString(36).substring(2, 11)}`,
          emoji,
          userId: this.currentUserId,
          userName: this.currentUserName
        });
      }
      this.saveToStorage();
    }
  }

  public getReplies(commentId: string): Reply[] {
    return this.replies.filter(r => r.commentId === commentId && !r.isDeleted);
  }

  public addReply(commentId: string, content: string): Reply {
    const mentions = this.parseMentions(content);
    const reply: Reply = {
      id: `re_${Math.random().toString(36).substring(2, 11)}`,
      version: 1,
      commentId,
      content,
      mentions,
      reactions: [],
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      metadata: {}
    };

    this.replies.push(reply);

    // Dispatch Mentions in replies
    this.dispatchMentionAlerts(mentions, commentId, content);

    this.saveToStorage();
    return reply;
  }

  // --- MENTION ENGINE MAPPINGS (PHASE 4) ---
  private parseMentions(content: string): Mention[] {
    const mentions: Mention[] = [];
    // Standard matches for @username or @TeamVastu or @RolePM
    const regex = /@([a-zA-Z0-9_\.\-]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const matchLabel = match[0];
      const name = match[1].toLowerCase();

      let targetId = "general";
      let type: Mention['type'] = "CONTEXT";

      if (name.includes("arjun") || name.includes("pm")) {
        targetId = "user_pm_arjun";
        type = "USER";
      } else if (name.includes("siddharth") || name.includes("engineer")) {
        targetId = "user_dev_engineer";
        type = "USER";
      } else if (name.includes("pavitra") || name.includes("admin")) {
        targetId = "user_pavitra";
        type = "USER";
      } else if (name.includes("vastu")) {
        targetId = "team_vastu_tech";
        type = "TEAM";
      } else if (name.includes("field") || name.includes("inspect")) {
        targetId = "team_site_inspectors";
        type = "TEAM";
      }

      mentions.push({
        id: `m_${Math.random().toString(36).substring(2, 6)}`,
        type,
        targetId,
        label: matchLabel,
        startIndex: match.index,
        length: matchLabel.length
      });
    }
    return mentions;
  }

  private dispatchMentionAlerts(mentions: Mention[], contextId: string, content: string) {
    mentions.forEach(m => {
      // Find recipient details
      let email = "collaborators@urjaflux.com";
      if (m.targetId === "user_pm_arjun") email = "arjun.projectmanager@urjaflux.com";
      else if (m.targetId === "user_dev_engineer") email = "engineer.siddharth@urjaflux.com";
      else if (m.targetId === "user_pavitra") email = "pavitra.taurus@gmail.com";

      NotificationEngine.getInstance().send(
        "EMAIL",
        email,
        "You were mentioned in a Discussion",
        `Hi! ${this.currentUserName} mentioned you in a comment thread (${contextId}):\n\n"${content}"`
      );

      // Also publish an event on the Event Bus
      EnterpriseEventBus.getInstance().publish({
        type: "SYSTEM_EVENT",
        source: "DOMAIN-014",
        name: "USER_MENTIONED",
        payload: {
          mentionId: m.id,
          targetId: m.targetId,
          mentionedBy: this.currentUserId,
          label: m.label,
          contentPreview: content.substring(0, 80)
        }
      });
    });
  }

  // --- ANNOTATION ENGINE OPERATIONS (PHASE 5) ---
  public getAnnotations(workspaceId: string): Annotation[] {
    return this.annotations.filter(a => a.workspaceId === workspaceId && !a.isDeleted);
  }

  public addAnnotation(
    workspaceId: string,
    resourceRef: Annotation['resourceRef'],
    content: string,
    geometry?: Annotation['geometry']
  ): Annotation {
    const annotation: Annotation = {
      id: `an_${Math.random().toString(36).substring(2, 11)}`,
      version: 1,
      workspaceId,
      resourceRef,
      geometry,
      content,
      resolved: false,
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      metadata: {}
    };

    this.annotations.push(annotation);

    this.logActivity(
      resourceRef.domain,
      "SPATIAL_CHANGE",
      `Added annotation on ${resourceRef.resourceType} "${resourceRef.label}": "${content}"`,
      annotation.id,
      "ANNOTATION"
    );

    this.saveToStorage();
    return annotation;
  }

  public resolveAnnotation(annotationId: string): void {
    const annotation = this.annotations.find(a => a.id === annotationId);
    if (annotation) {
      annotation.resolved = true;
      annotation.updatedAt = new Date().toISOString();
      annotation.updatedBy = this.currentUserId;

      this.logActivity(
        annotation.resourceRef.domain,
        "APPROVAL",
        `Resolved spatial annotation on ${annotation.resourceRef.label}`,
        annotationId,
        "ANNOTATION"
      );

      this.saveToStorage();
    }
  }

  // --- ACTIVITY FEED LOGGING (PHASE 6) ---
  public logActivity(
    domain: string,
    type: Activity['type'],
    description: string,
    resourceId: string,
    resourceType: string
  ): void {
    const act: Activity = {
      id: `act_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      domain,
      type,
      userId: this.currentUserId,
      userName: this.currentUserName,
      description,
      resourceId,
      resourceType
    };

    this.activities.unshift(act); // Latest first
    this.saveToStorage();

    // Trigger an asynchronous Event Bus emission so DOMAIN-013 rules engine can evaluate
    EnterpriseEventBus.getInstance().publish({
      type: "DOMAIN_EVENT",
      source: "DOMAIN-014",
      name: `COLLAB_ACTIVITY_${type}`,
      payload: {
        activityId: act.id,
        description,
        userId: this.currentUserId,
        domain
      }
    });
  }

  public getActivities(filters?: {
    domain?: string;
    type?: Activity['type'];
    userId?: string;
    searchTerm?: string;
  }): Activity[] {
    let result = this.activities;

    if (filters?.domain) {
      result = result.filter(a => a.domain === filters.domain);
    }
    if (filters?.type) {
      result = result.filter(a => a.type === filters.type);
    }
    if (filters?.userId) {
      result = result.filter(a => a.userId === filters.userId);
    }
    if (filters?.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      result = result.filter(a =>
        a.description.toLowerCase().includes(q) ||
        a.userName.toLowerCase().includes(q) ||
        a.resourceType.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // --- PRESENCE & CURSOR ORCHESTRATION (PHASE 7) ---
  public getPresences(): Presence[] {
    return this.presences;
  }

  public updatePresence(
    userId: string,
    userName: string,
    role: WorkspaceRole,
    status: Presence['status'],
    activeView?: string,
    coords?: { x: number; y: number }
  ): void {
    const idx = this.presences.findIndex(p => p.userId === userId);
    if (idx !== -1) {
      this.presences[idx] = {
        ...this.presences[idx],
        status,
        lastSeen: new Date().toISOString(),
        activeView: activeView ?? this.presences[idx].activeView,
        cursorCoordinates: coords ?? this.presences[idx].cursorCoordinates
      };
    } else {
      this.presences.push({
        userId,
        userName,
        role,
        status,
        lastSeen: new Date().toISOString(),
        activeView,
        cursorCoordinates: coords
      });
    }
    this.saveToStorage();
  }

  // Shared sessions
  public getSharedSessions(workspaceId: string): SharedSession[] {
    return this.sharedSessions.filter(s => s.workspaceId === workspaceId && !s.isDeleted);
  }

  public createSharedSession(
    workspaceId: string,
    title: string,
    resourceRef: SharedSession['resourceRef']
  ): SharedSession {
    const sess: SharedSession = {
      id: `session_${Math.random().toString(36).substring(2, 11)}`,
      version: 1,
      workspaceId,
      title,
      hostId: this.currentUserId,
      activeParticipantIds: [this.currentUserId],
      resourceRef,
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      metadata: {}
    };

    this.sharedSessions.push(sess);
    this.logActivity(
      "DOMAIN-014",
      "APPROVAL",
      `Initiated joint collaboration session for "${title}"`,
      sess.id,
      "SHARED_SESSION"
    );

    this.saveToStorage();
    return sess;
  }

  public joinSharedSession(sessionId: string, userId: string): void {
    const s = this.sharedSessions.find(sess => sess.id === sessionId);
    if (s && !s.activeParticipantIds.includes(userId)) {
      s.activeParticipantIds.push(userId);
      this.saveToStorage();
    }
  }

  // --- SEARCH & DISCOVERY (PHASE 10) ---
  public searchCollaborationResources(
    query: string,
    filters?: {
      workspaceId?: string;
      type?: 'THREAD' | 'COMMENT' | 'ANNOTATION' | 'MEMBER' | 'ATTACHMENT';
    }
  ) {
    const q = query.toLowerCase();
    const results: any[] = [];

    // Thread Search
    if (!filters?.type || filters.type === "THREAD") {
      this.threads
        .filter(t => !t.isDeleted && (!filters?.workspaceId || t.workspaceId === filters.workspaceId))
        .forEach(t => {
          if (t.title.toLowerCase().includes(q) || t.resourceRef?.label.toLowerCase().includes(q)) {
            results.push({
              id: t.id,
              type: "THREAD",
              title: t.title,
              subtitle: `In ${t.resourceRef?.domain || "General"} Workspace`,
              linkId: t.id,
              date: t.createdAt
            });
          }
        });
    }

    // Comment Search
    if (!filters?.type || filters.type === "COMMENT") {
      this.comments
        .filter(c => !c.isDeleted)
        .forEach(c => {
          if (c.content.toLowerCase().includes(q)) {
            const thread = this.threads.find(t => t.id === c.threadId);
            results.push({
              id: c.id,
              type: "COMMENT",
              title: `Comment inside "${thread?.title || "Active Thread"}"`,
              subtitle: c.content,
              linkId: c.threadId,
              date: c.createdAt
            });
          }
        });
    }

    // Annotation Search
    if (!filters?.type || filters.type === "ANNOTATION") {
      this.annotations
        .filter(a => !a.isDeleted && (!filters?.workspaceId || a.workspaceId === filters.workspaceId))
        .forEach(a => {
          if (a.content.toLowerCase().includes(q) || a.resourceRef.label.toLowerCase().includes(q)) {
            results.push({
              id: a.id,
              type: "ANNOTATION",
              title: `CAD/Report Annotation: "${a.content}"`,
              subtitle: `Linked to ${a.resourceRef.resourceType} - ${a.resourceRef.label}`,
              linkId: a.id,
              date: a.createdAt
            });
          }
        });
    }

    // Member Search
    if (!filters?.type || filters.type === "MEMBER") {
      this.members
        .filter(m => !m.isDeleted && (!filters?.workspaceId || m.workspaceId === filters.workspaceId))
        .forEach(m => {
          if (m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)) {
            results.push({
              id: m.id,
              type: "MEMBER",
              title: `${m.email}`,
              subtitle: `Role: ${m.role} | Status: ${m.status}`,
              linkId: m.id,
              date: m.joinedAt
            });
          }
        });
    }

    // Attachment Search
    if (!filters?.type || filters.type === "ATTACHMENT") {
      this.comments.forEach(c => {
        c.attachments.forEach(att => {
          if (att.name.toLowerCase().includes(q)) {
            results.push({
              id: att.id,
              type: "ATTACHMENT",
              title: att.name,
              subtitle: `File size: ${(att.sizeBytes / 1024).toFixed(1)} KB | Uploaded by ${att.uploadedBy}`,
              linkId: c.threadId,
              date: att.uploadedAt
            });
          }
        });
      });
    }

    return results;
  }

  public getSavedSearches() {
    return this.savedSearches;
  }

  public saveSearch(name: string, query: string, filters: any) {
    const saved = {
      id: `save_${Math.random().toString(36).substring(2, 8)}`,
      name,
      query,
      filters
    };
    this.savedSearches.push(saved);
    this.saveToStorage();
  }
}
