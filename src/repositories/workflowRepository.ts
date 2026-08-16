import {
  ConsultationWorkflow,
  Consultation,
  ConsultationTask,
  Appointment,
  FollowUp,
  ConsultationNote,
  TimelineEvent,
  ConsultationWorkflowStage,
  WorkflowStageState
} from "../types/workflow";

const WORKFLOWS_KEY = "urjaflux_workflows";
const CONSULTATIONS_KEY = "urjaflux_consultations";
const TASKS_KEY = "urjaflux_tasks";
const APPOINTMENTS_KEY = "urjaflux_appointments";
const FOLLOWUPS_KEY = "urjaflux_followups";
const NOTES_KEY = "urjaflux_notes";
const TIMELINE_KEY = "urjaflux_timeline";

const STAGE_CHRONOLOGY: ConsultationWorkflowStage[] = [
  "VISITOR",
  "LEAD_CREATED",
  "IDENTITY_VERIFIED",
  "FREE_ANALYSIS",
  "CONSULTATION_REQUESTED",
  "CONSULTATION_SCHEDULED",
  "CONSULTATION_CONFIRMED",
  "CONSULTATION_IN_PROGRESS",
  "ANALYSIS_COMPLETE",
  "REPORT_DRAFT",
  "REPORT_REVIEWED",
  "REPORT_DELIVERED",
  "REMEDY_TRACKING",
  "FOLLOW_UP_SCHEDULED",
  "FOLLOW_UP_COMPLETED",
  "ANNUAL_REVIEW",
  "REPEAT_CONSULTATION"
];

export class WorkflowRepository {
  private static instance: WorkflowRepository;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): WorkflowRepository {
    if (!WorkflowRepository.instance) {
      WorkflowRepository.instance = new WorkflowRepository();
    }
    return WorkflowRepository.instance;
  }

  private load<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private save<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Helper to create blank stage state
  public createInitialStages(): Record<ConsultationWorkflowStage, WorkflowStageState> {
    const states = {} as Record<ConsultationWorkflowStage, WorkflowStageState>;
    STAGE_CHRONOLOGY.forEach((stage, index) => {
      states[stage] = {
        stage,
        status: "PENDING",
        ownerId: "consultant_01",
        priority: stage === "IDENTITY_VERIFIED" || stage === "CONSULTATION_CONFIRMED" ? "HIGH" : "MEDIUM",
        progressPercentage: 0,
        notes: `Initial state placeholder for stage: ${stage.replace(/_/g, " ")}`,
        attachments: [],
        checklist: this.getChecklistForStage(stage),
        history: [{ timestamp: new Date().toISOString(), changedBy: "System", updateMessage: "Stage initialized." }]
      };
    });
    return states;
  }

  private getChecklistForStage(stage: ConsultationWorkflowStage): { item: string; done: boolean }[] {
    switch (stage) {
      case "VISITOR":
        return [
          { item: "Accept terms & privacy policy", done: false },
          { item: "Submit mobile number", done: false }
        ];
      case "LEAD_CREATED":
        return [
          { item: "Profile demographic recorded", done: false },
          { item: "Initial analysis type requested", done: false }
        ];
      case "IDENTITY_VERIFIED":
        return [
          { item: "Simulated OTP transmission verified", done: false },
          { item: "Central identity record locked", done: false }
        ];
      case "FREE_ANALYSIS":
        return [
          { item: "Run elemental space alignment calculations", done: false },
          { item: "Deliver free Vastu or Numerology report preview", done: false }
        ];
      case "CONSULTATION_REQUESTED":
        return [
          { item: "Review client request details", done: false },
          { item: "Select core consultation type (Vastu/Combined)", done: false }
        ];
      case "CONSULTATION_SCHEDULED":
        return [
          { item: "Propose meeting slots via Zoom/On-Site", done: false },
          { item: "Confirm client date and time preferences", done: false }
        ];
      case "CONSULTATION_CONFIRMED":
        return [
          { item: "Receive consultation booking details", done: false },
          { item: "Assign Consultant Owner to interaction", done: false }
        ];
      case "CONSULTATION_IN_PROGRESS":
        return [
          { item: "Conduct live consultation and map core elements", done: false },
          { item: "Log initial space/astro remedy recommendations", done: false }
        ];
      case "ANALYSIS_COMPLETE":
        return [
          { item: "Complete thorough mathematical 16-zone or planetary grids", done: false },
          { item: "Formulate remedies (Zinc, brass, elemental foils)", done: false }
        ];
      case "REPORT_DRAFT":
        return [
          { item: "Generate complete PDF layout report", done: false },
          { item: "Log final consultation actions in repository", done: false }
        ];
      case "REPORT_REVIEWED":
        return [
          { item: "Peer review of elements and directional coordinates", done: false },
          { item: "Approve draft report layout", done: false }
        ];
      case "REPORT_DELIVERED":
        return [
          { item: "Deliver report package directly to client portal", done: false },
          { item: "Review main findings via walk-through phone call", done: false }
        ];
      case "REMEDY_TRACKING":
        return [
          { item: "Verify physical placement of copper / zinc foils", done: false },
          { item: "Confirm date of remedy activation", done: false }
        ];
      case "FOLLOW_UP_SCHEDULED":
        return [
          { item: "Set target date for remedy feedback verification", done: false }
        ];
      case "FOLLOW_UP_COMPLETED":
        return [
          { item: "Log client element balancing outcomes", done: false },
          { item: "Complete secondary consultation notes", done: false }
        ];
      default:
        return [{ item: "Review next action items", done: false }];
    }
  }

  // WORKFLOW CRUD
  public getWorkflowById(id: string): ConsultationWorkflow | undefined {
    return this.load<ConsultationWorkflow>(WORKFLOWS_KEY).find(w => w.id === id);
  }

  public getWorkflowByIdentity(identityId: string): ConsultationWorkflow | undefined {
    return this.load<ConsultationWorkflow>(WORKFLOWS_KEY).find(w => w.identityId === identityId);
  }

  public saveWorkflow(workflow: ConsultationWorkflow): ConsultationWorkflow {
    const list = this.load<ConsultationWorkflow>(WORKFLOWS_KEY);
    const idx = list.findIndex(w => w.id === workflow.id);
    if (idx !== -1) {
      list[idx] = workflow;
    } else {
      list.push(workflow);
    }
    this.save(WORKFLOWS_KEY, list);
    return workflow;
  }

  public getAllWorkflows(): ConsultationWorkflow[] {
    return this.load<ConsultationWorkflow>(WORKFLOWS_KEY);
  }

  // CONSULTATIONS CRUD
  public getConsultations(): Consultation[] {
    return this.load<Consultation>(CONSULTATIONS_KEY);
  }

  public getConsultationsByIdentity(identityId: string): Consultation[] {
    return this.getConsultations().filter(c => c.identityId === identityId);
  }

  public saveConsultation(c: Consultation): Consultation {
    const list = this.getConsultations();
    const idx = list.findIndex(item => item.id === c.id);
    if (idx !== -1) {
      list[idx] = c;
    } else {
      list.push(c);
    }
    this.save(CONSULTATIONS_KEY, list);
    return c;
  }

  // TASKS CRUD
  public getTasks(): ConsultationTask[] {
    return this.load<ConsultationTask>(TASKS_KEY);
  }

  public getTasksByIdentity(identityId: string): ConsultationTask[] {
    return this.getTasks().filter(t => t.identityId === identityId);
  }

  public saveTask(t: ConsultationTask): ConsultationTask {
    const list = this.getTasks();
    const idx = list.findIndex(item => item.id === t.id);
    if (idx !== -1) {
      list[idx] = t;
    } else {
      list.push(t);
    }
    this.save(TASKS_KEY, list);
    return t;
  }

  // APPOINTMENTS CRUD
  public getAppointments(): Appointment[] {
    return this.load<Appointment>(APPOINTMENTS_KEY);
  }

  public getAppointmentsByIdentity(identityId: string): Appointment[] {
    return this.getAppointments().filter(a => a.identityId === identityId);
  }

  public saveAppointment(a: Appointment): Appointment {
    const list = this.getAppointments();
    const idx = list.findIndex(item => item.id === a.id);
    if (idx !== -1) {
      list[idx] = a;
    } else {
      list.push(a);
    }
    this.save(APPOINTMENTS_KEY, list);
    return a;
  }

  // FOLLOW UPS CRUD
  public getFollowUps(): FollowUp[] {
    return this.load<FollowUp>(FOLLOWUPS_KEY);
  }

  public getFollowUpsByIdentity(identityId: string): FollowUp[] {
    return this.getFollowUps().filter(f => f.identityId === identityId);
  }

  public saveFollowUp(f: FollowUp): FollowUp {
    const list = this.getFollowUps();
    const idx = list.findIndex(item => item.id === f.id);
    if (idx !== -1) {
      list[idx] = f;
    } else {
      list.push(f);
    }
    this.save(FOLLOWUPS_KEY, list);
    return f;
  }

  // NOTES CRUD
  public getNotes(): ConsultationNote[] {
    return this.load<ConsultationNote>(NOTES_KEY);
  }

  public getNotesByIdentity(identityId: string): ConsultationNote[] {
    return this.getNotes().filter(n => n.identityId === identityId);
  }

  public saveNote(n: ConsultationNote): ConsultationNote {
    const list = this.getNotes();
    const idx = list.findIndex(item => item.id === n.id);
    if (idx !== -1) {
      list[idx] = n;
    } else {
      list.push(n);
    }
    this.save(NOTES_KEY, list);
    return n;
  }

  // TIMELINE EVENT CRUD
  public getTimelineEvents(): TimelineEvent[] {
    return this.load<TimelineEvent>(TIMELINE_KEY);
  }

  public getTimelineEventsByIdentity(identityId: string): TimelineEvent[] {
    return this.getTimelineEvents()
      .filter(e => e.identityId === identityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addTimelineEvent(e: TimelineEvent): TimelineEvent {
    const list = this.getTimelineEvents();
    list.push(e);
    this.save(TIMELINE_KEY, list);
    return e;
  }

  // INITIAL SEED DATA FOR DEMO ENHANCEMENT
  private ensureInitialized() {
    // If workflows are already seeded, skip.
    if (localStorage.getItem(WORKFLOWS_KEY)) return;

    // Seeds for Shreya Sharma (Active Client, deep workflow progress)
    const shreyaId = "ID-VASTU901";
    
    // Seed 1: Shreya Sharma Workflow
    const shreyaWorkflow: ConsultationWorkflow = {
      id: "wf_901",
      identityId: shreyaId,
      currentStage: "REMEDY_TRACKING",
      stagesState: this.createInitialStages(),
      overallProgress: 75,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    // Transition historical stages to complete
    const stagesToComplete: ConsultationWorkflowStage[] = [
      "VISITOR", "LEAD_CREATED", "IDENTITY_VERIFIED", "FREE_ANALYSIS",
      "CONSULTATION_REQUESTED", "CONSULTATION_SCHEDULED", "CONSULTATION_CONFIRMED",
      "CONSULTATION_IN_PROGRESS", "ANALYSIS_COMPLETE", "REPORT_DRAFT", "REPORT_REVIEWED", "REPORT_DELIVERED"
    ];

    stagesToComplete.forEach(stg => {
      const s = shreyaWorkflow.stagesState[stg];
      s.status = "COMPLETED";
      s.progressPercentage = 100;
      s.startDate = new Date(Date.now() - 28 * 86400000).toISOString();
      s.endDate = new Date(Date.now() - 25 * 86400000).toISOString();
      s.checklist = s.checklist.map(item => ({ ...item, done: true }));
      s.history.push({
        timestamp: new Date().toISOString(),
        changedBy: "Senior Consultant",
        updateMessage: `Stage ${stg} successfully verified and closed.`
      });
    });

    // Remedy Tracking active
    const remedyStage = shreyaWorkflow.stagesState["REMEDY_TRACKING"];
    remedyStage.status = "IN_PROGRESS";
    remedyStage.progressPercentage = 40;
    remedyStage.startDate = new Date(Date.now() - 10 * 86400000).toISOString();
    remedyStage.checklist[0].done = true; // verify foils placed

    this.saveWorkflow(shreyaWorkflow);

    // Seed Consultations for Shreya Sharma
    const shreyaCons: Consultation = {
      id: "cons_901",
      identityId: shreyaId,
      consultantId: "consultant_01",
      propertyId: "prop_901a",
      type: "VASTU",
      mode: "VIDEO",
      durationMinutes: 45,
      status: "COMPLETED",
      outcome: "Identified dual entry north entrance conflict. Elemental kitchen fire element weak.",
      recommendations: [
        "Place elemental zinc plate under north entrance.",
        "Add red lighting to south-east sector to activate fire element."
      ],
      nextAction: "Perform followup visual verify of element balancer placement.",
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 86400000).toISOString()
    };
    this.saveConsultation(shreyaCons);

    // Seed Tasks for Shreya Sharma
    const tasks: ConsultationTask[] = [
      {
        id: "task_901_1",
        consultationId: "cons_901",
        identityId: shreyaId,
        title: "Collect Blueprint Layout",
        description: "Obtain high-res floor plan of Dwarka flat",
        priority: "HIGH",
        dueDate: new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0],
        assignedUserId: "consultant_01",
        status: "COMPLETED",
        dependencies: [],
        completedDate: new Date(Date.now() - 28 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 28 * 86400000).toISOString()
      },
      {
        id: "task_901_2",
        consultationId: "cons_901",
        identityId: shreyaId,
        title: "Verify Entrance Remedial Plate",
        description: "Ensure the client has affixed the zinc plate inside the entrance channel",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        assignedUserId: "consultant_01",
        status: "IN_PROGRESS",
        dependencies: [],
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "task_901_3",
        consultationId: "cons_901",
        identityId: shreyaId,
        title: "Draft Combined Astro-Vastu Synthesis",
        description: "Co-relate native birth horoscope planetary positions with NE bathroom coordinates",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        assignedUserId: "consultant_01",
        status: "PENDING",
        dependencies: ["task_901_2"],
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    tasks.forEach(t => this.saveTask(t));

    // Seed Appointments
    const appointments: Appointment[] = [
      {
        id: "appt_901_1",
        identityId: shreyaId,
        consultationId: "cons_901",
        date: new Date(Date.now() - 25 * 86400000).toISOString().split("T")[0],
        time: "10:30",
        timezone: "Asia/Kolkata",
        mode: "VIDEO",
        location: "https://zoom.us/j/981726354",
        reminderSchedule: "1_DAY",
        attendance: "ATTENDED",
        status: "COMPLETED",
        notes: "Detailed element mapping walkthrough.",
        createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 86400000).toISOString()
      },
      {
        id: "appt_901_2",
        identityId: shreyaId,
        date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        time: "15:00",
        timezone: "Asia/Kolkata",
        mode: "PHONE",
        location: "+91 9876543210",
        reminderSchedule: "1_HOUR",
        attendance: "PENDING",
        status: "SCHEDULED",
        notes: "Remedy activation status review call.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    appointments.forEach(a => this.saveAppointment(a));

    // Seed Follow Ups
    const followUps: FollowUp[] = [
      {
        id: "fup_901_1",
        consultationId: "cons_901",
        identityId: shreyaId,
        reason: "ELEMENT BALANCING VERIFICATION",
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        reminderDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        status: "PENDING",
        notes: "Verify if north entrance alignment has improved energy flows in dwelling.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    followUps.forEach(f => this.saveFollowUp(f));

    // Seed Consultation Notes
    const notes: ConsultationNote[] = [
      {
        id: "note_901_1",
        consultationId: "cons_901",
        identityId: shreyaId,
        title: "North Entrance Zinc Correction Protocol",
        content: "A detailed breakdown of the exact zinc foil installation guidelines proposed. To be placed under the wooden threshold strip. The client is extremely receptive.",
        attachments: [{ name: "dwarka_dwg_plan.pdf", url: "https://example.com/plan.pdf", type: "FLOOR_PLAN" }],
        isPrivate: false,
        authorId: "consultant_01",
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        versionHistory: [
          {
            version: 1,
            content: "Initial draft notes created for north threshold.",
            updatedBy: "consultant_01",
            timestamp: new Date(Date.now() - 25 * 86400000).toISOString()
          }
        ]
      }
    ];
    notes.forEach(n => this.saveNote(n));

    // Seed Timeline Events
    const timeline: TimelineEvent[] = [
      {
        id: "t_evt_1",
        identityId: shreyaId,
        eventType: "APPOINTMENT_CREATED",
        title: "Initial Zoom Consultation Scheduled",
        description: "Video consultation slotted for 10:30 AM",
        authorId: "consultant_01",
        timestamp: new Date(Date.now() - 28 * 86400000).toISOString()
      },
      {
        id: "t_evt_2",
        identityId: shreyaId,
        consultationId: "cons_901",
        eventType: "CONSULTATION_STARTED",
        title: "Video Call Initiated",
        description: "Space mapping and horoscope correlations review started",
        authorId: "consultant_01",
        timestamp: new Date(Date.now() - 25 * 86400000).toISOString()
      },
      {
        id: "t_evt_3",
        identityId: shreyaId,
        consultationId: "cons_901",
        eventType: "CONSULTATION_COMPLETED",
        title: "Video Call Concluded",
        description: "Remedial actions registered under Dwarka flat profile",
        authorId: "consultant_01",
        timestamp: new Date(Date.now() - 25 * 86400000).toISOString()
      },
      {
        id: "t_evt_4",
        identityId: shreyaId,
        eventType: "STAGE_TRANSITION",
        title: "Transitioned to REMEDY_TRACKING",
        description: "Progress advanced following confirmation of report package delivery",
        authorId: "consultant_01",
        timestamp: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ];
    timeline.forEach(e => this.addTimelineEvent(e));


    // FRESH SEEDS FOR VIKRAM ADITYA
    const vikramId = "ID-LEAD304";
    const vikramWorkflow: ConsultationWorkflow = {
      id: "wf_304",
      identityId: vikramId,
      currentStage: "CONSULTATION_REQUESTED",
      stagesState: this.createInitialStages(),
      overallProgress: 25,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    const vCompleted: ConsultationWorkflowStage[] = ["VISITOR", "LEAD_CREATED", "IDENTITY_VERIFIED", "FREE_ANALYSIS"];
    vCompleted.forEach(stg => {
      const s = vikramWorkflow.stagesState[stg];
      s.status = "COMPLETED";
      s.progressPercentage = 100;
      s.checklist = s.checklist.map(item => ({ ...item, done: true }));
    });

    const requestedStage = vikramWorkflow.stagesState["CONSULTATION_REQUESTED"];
    requestedStage.status = "IN_PROGRESS";
    requestedStage.progressPercentage = 50;

    this.saveWorkflow(vikramWorkflow);

    const vikramEvents: TimelineEvent[] = [
      {
        id: "v_evt_1",
        identityId: vikramId,
        eventType: "STAGE_TRANSITION",
        title: "Free Analysis Completed",
        description: "Automated birth chart calculations generated",
        authorId: "system",
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: "v_evt_2",
        identityId: vikramId,
        eventType: "STAGE_TRANSITION",
        title: "Consultation Formally Requested",
        description: "Lead requested professional review of Aditya Villa plan",
        authorId: "system",
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];
    vikramEvents.forEach(e => this.addTimelineEvent(e));
  }
}
