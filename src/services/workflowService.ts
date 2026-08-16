import { WorkflowRepository } from "../repositories/workflowRepository";
import {
  ConsultationWorkflow,
  ConsultationWorkflowStage,
  WorkflowStageState,
  Consultation,
  ConsultationType,
  MeetingMode,
  ConsultationTask,
  Appointment,
  FollowUp,
  ConsultationNote,
  TimelineEvent,
  TimelineEventType
} from "../types/workflow";

// ---------------------------------------------------------------------------
// 1. WORKFLOW TIMELINE SERVICE
// ---------------------------------------------------------------------------
export class WorkflowTimelineService {
  private static instance: WorkflowTimelineService;
  private repo = WorkflowRepository.getInstance();

  private constructor() {}

  public static getInstance(): WorkflowTimelineService {
    if (!WorkflowTimelineService.instance) {
      WorkflowTimelineService.instance = new WorkflowTimelineService();
    }
    return WorkflowTimelineService.instance;
  }

  public getEvents(identityId: string): TimelineEvent[] {
    return this.repo.getTimelineEventsByIdentity(identityId);
  }

  public logEvent(params: {
    identityId: string;
    consultationId?: string;
    eventType: TimelineEventType;
    title: string;
    description: string;
    authorId: string;
  }): TimelineEvent {
    const id = `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newEvent: TimelineEvent = {
      id,
      ...params,
      timestamp: new Date().toISOString()
    };
    return this.repo.addTimelineEvent(newEvent);
  }
}
export const workflowTimelineService = WorkflowTimelineService.getInstance();


// ---------------------------------------------------------------------------
// 2. TASK SERVICE
// ---------------------------------------------------------------------------
export class TaskService {
  private static instance: TaskService;
  private repo = WorkflowRepository.getInstance();

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  public getTasksForIdentity(identityId: string): ConsultationTask[] {
    return this.repo.getTasksByIdentity(identityId);
  }

  public getTasksForConsultation(consultationId: string): ConsultationTask[] {
    return this.repo.getTasks().filter(t => t.consultationId === consultationId);
  }

  public createTask(params: {
    consultationId?: string;
    identityId: string;
    title: string;
    description?: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    dueDate: string;
    assignedUserId: string;
    dependencies?: string[];
    recurringPattern?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUALLY";
  }): ConsultationTask {
    const id = `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newTask: ConsultationTask = {
      id,
      ...params,
      status: "PENDING",
      dependencies: params.dependencies || [],
      recurringPattern: params.recurringPattern || "NONE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const task = this.repo.saveTask(newTask);

    // Log to Timeline
    workflowTimelineService.logEvent({
      identityId: params.identityId,
      consultationId: params.consultationId,
      eventType: "FOLLOW_UP_CREATED", // mapping close action
      title: `Task Created: ${params.title}`,
      description: `Task assigned to user: ${params.assignedUserId}. Due date: ${params.dueDate}`,
      authorId: params.assignedUserId
    });

    return task;
  }

  public updateTaskStatus(taskId: string, status: ConsultationTask["status"], changedBy: string): ConsultationTask {
    const list = this.repo.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) throw new Error("Task not found");

    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (status === "COMPLETED") {
      task.completedDate = new Date().toISOString();
    }

    const updated = this.repo.saveTask(task);

    if (status === "COMPLETED") {
      workflowTimelineService.logEvent({
        identityId: task.identityId,
        consultationId: task.consultationId,
        eventType: "TASK_COMPLETED",
        title: `Task Completed: ${task.title}`,
        description: `Operational task marked done by ${changedBy}`,
        authorId: changedBy
      });
    }

    return updated;
  }
}
export const taskService = TaskService.getInstance();


// ---------------------------------------------------------------------------
// 3. APPOINTMENT SERVICE
// ---------------------------------------------------------------------------
export class AppointmentService {
  private static instance: AppointmentService;
  private repo = WorkflowRepository.getInstance();

  private constructor() {}

  public static getInstance(): AppointmentService {
    if (!AppointmentService.instance) {
      AppointmentService.instance = new AppointmentService();
    }
    return AppointmentService.instance;
  }

  public getAppointmentsForIdentity(identityId: string): Appointment[] {
    return this.repo.getAppointmentsByIdentity(identityId);
  }

  public scheduleAppointment(params: {
    identityId: string;
    consultationId?: string;
    date: string;
    time: string;
    timezone: string;
    mode: MeetingMode;
    location?: string;
    reminderSchedule: Appointment["reminderSchedule"];
    notes?: string;
    authorId: string;
  }): Appointment {
    const id = `appt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newAppt: Appointment = {
      id,
      ...params,
      attendance: "PENDING",
      status: "SCHEDULED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const appt = this.repo.saveAppointment(newAppt);

    workflowTimelineService.logEvent({
      identityId: params.identityId,
      consultationId: params.consultationId,
      eventType: "APPOINTMENT_CREATED",
      title: `Meeting Scheduled (${params.mode})`,
      description: `Meeting set on ${params.date} at ${params.time} (${params.timezone}). Mode: ${params.mode}`,
      authorId: params.authorId
    });

    return appt;
  }

  public updateAppointmentStatus(
    apptId: string,
    status: Appointment["status"],
    attendance: Appointment["attendance"],
    changedBy: string
  ): Appointment {
    const list = this.repo.getAppointments();
    const appt = list.find(a => a.id === apptId);
    if (!appt) throw new Error("Appointment not found");

    appt.status = status;
    appt.attendance = attendance;
    appt.updatedAt = new Date().toISOString();

    const updated = this.repo.saveAppointment(appt);

    workflowTimelineService.logEvent({
      identityId: appt.identityId,
      consultationId: appt.consultationId,
      eventType: "APPOINTMENT_UPDATED",
      title: `Appointment Status Update: ${status}`,
      description: `Appointment updated by ${changedBy}. Attendance mark: ${attendance}`,
      authorId: changedBy
    });

    return updated;
  }
}
export const appointmentService = AppointmentService.getInstance();


// ---------------------------------------------------------------------------
// 4. FOLLOW-UP SERVICE
// ---------------------------------------------------------------------------
export class FollowUpService {
  private static instance: FollowUpService;
  private repo = WorkflowRepository.getInstance();

  private constructor() {}

  public static getInstance(): FollowUpService {
    if (!FollowUpService.instance) {
      FollowUpService.instance = new FollowUpService();
    }
    return FollowUpService.instance;
  }

  public getFollowUpsForIdentity(identityId: string): FollowUp[] {
    return this.repo.getFollowUpsByIdentity(identityId);
  }

  public createFollowUp(params: {
    consultationId: string;
    identityId: string;
    reason: string;
    dueDate: string;
    reminderDate?: string;
    notes: string;
    authorId: string;
  }): FollowUp {
    const id = `fup_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newFup: FollowUp = {
      id,
      ...params,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const fup = this.repo.saveFollowUp(newFup);

    workflowTimelineService.logEvent({
      identityId: params.identityId,
      consultationId: params.consultationId,
      eventType: "FOLLOW_UP_CREATED",
      title: "Follow-Up Action Logged",
      description: `Follow-up required on ${params.dueDate} for: ${params.reason}`,
      authorId: params.authorId
    });

    return fup;
  }

  public completeFollowUp(fupId: string, outcome: string, notes: string, changedBy: string): FollowUp {
    const list = this.repo.getFollowUps();
    const fup = list.find(f => f.id === fupId);
    if (!fup) throw new Error("FollowUp not found");

    fup.status = "COMPLETED";
    fup.outcome = outcome;
    fup.notes = notes;
    fup.completedDate = new Date().toISOString().split("T")[0];
    fup.updatedAt = new Date().toISOString();

    const updated = this.repo.saveFollowUp(fup);

    workflowTimelineService.logEvent({
      identityId: fup.identityId,
      consultationId: fup.consultationId,
      eventType: "TASK_COMPLETED", // mapping outcome closure
      title: "Follow-Up Action Complete",
      description: `Outcome: ${outcome}`,
      authorId: changedBy
    });

    return updated;
  }
}
export const followUpService = FollowUpService.getInstance();


// ---------------------------------------------------------------------------
// 5. CONSULTATION SERVICE
// ---------------------------------------------------------------------------
export class ConsultationService {
  private static instance: ConsultationService;
  private repo = WorkflowRepository.getInstance();

  private constructor() {}

  public static getInstance(): ConsultationService {
    if (!ConsultationService.instance) {
      ConsultationService.instance = new ConsultationService();
    }
    return ConsultationService.instance;
  }

  public getConsultationsByIdentity(identityId: string): Consultation[] {
    return this.repo.getConsultationsByIdentity(identityId);
  }

  public createConsultation(params: {
    identityId: string;
    consultantId: string;
    propertyId?: string;
    type: ConsultationType;
    mode: MeetingMode;
    durationMinutes: number;
    authorId: string;
  }): Consultation {
    const id = `cons_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCons: Consultation = {
      id,
      ...params,
      status: "SCHEDULED",
      recommendations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const cons = this.repo.saveConsultation(newCons);

    workflowTimelineService.logEvent({
      identityId: params.identityId,
      consultationId: id,
      eventType: "CONSULTATION_STARTED",
      title: `Consultation Slotted (${params.type})`,
      description: `New ${params.type} scheduled by consultant ${params.consultantId}. Mode: ${params.mode}`,
      authorId: params.authorId
    });

    // FUTURE AUTOMATION TRIGGER EXAMPLES
    // After consultation created -> auto register initial document task
    taskService.createTask({
      consultationId: id,
      identityId: params.identityId,
      title: `Review Core Space / Astro Grids for ${params.type}`,
      description: "Analyze directions and native birth chart in parallel prior to meeting.",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0],
      assignedUserId: params.consultantId
    });

    return cons;
  }

  public updateConsultationOutcome(
    consId: string,
    status: Consultation["status"],
    outcome: string,
    recommendations: string[],
    nextAction: string,
    changedBy: string
  ): Consultation {
    const list = this.repo.getConsultations();
    const cons = list.find(c => c.id === consId);
    if (!cons) throw new Error("Consultation not found");

    cons.status = status;
    cons.outcome = outcome;
    cons.recommendations = recommendations;
    cons.nextAction = nextAction;
    cons.updatedAt = new Date().toISOString();

    const updated = this.repo.saveConsultation(cons);

    workflowTimelineService.logEvent({
      identityId: cons.identityId,
      consultationId: cons.id,
      eventType: "CONSULTATION_COMPLETED",
      title: `Consultation Concluded`,
      description: `Outcome: ${outcome}. Recommended actions updated.`,
      authorId: changedBy
    });

    // AUTOMATION ARCHITECTURE SIMULATION (Triggering aftermath workflow events)
    if (status === "COMPLETED") {
      this.triggerPostConsultationAutomations(cons, changedBy);
    }

    return updated;
  }

  private triggerPostConsultationAutomations(cons: Consultation, changedBy: string) {
    console.log(`[AUTOMATION OS] Executing post-consultation rules for Consultation: ${cons.id}`);
    
    // Automation Rule 1: After Consultation Completed -> Generate Draft Report Task
    taskService.createTask({
      consultationId: cons.id,
      identityId: cons.identityId,
      title: `Draft Core Vastu / Astro Report Package`,
      description: `Compile recommendations: ${cons.recommendations.join("; ")}`,
      priority: "HIGH",
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      assignedUserId: cons.consultantId
    });

    // Automation Rule 2: After Consultation Completed -> Queue Remedy Placement Verify Checklist Task
    taskService.createTask({
      consultationId: cons.id,
      identityId: cons.identityId,
      title: `Verify Elemental Remedial Foils Placement`,
      description: "Verify physical copper/zinc elements layout in the property structure.",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
      assignedUserId: cons.consultantId
    });
  }

  // NOTE MANAGEMENT (WITH ARCHITECTURAL VERSION HISTORY)
  public getNotesForIdentity(identityId: string): ConsultationNote[] {
    return this.repo.getNotesByIdentity(identityId);
  }

  public createNote(params: {
    consultationId?: string;
    identityId: string;
    title: string;
    content: string;
    attachments?: ConsultationNote["attachments"];
    isPrivate: boolean;
    authorId: string;
  }): ConsultationNote {
    const id = `note_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newNote: ConsultationNote = {
      id,
      ...params,
      attachments: params.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versionHistory: [
        {
          version: 1,
          content: params.content,
          updatedBy: params.authorId,
          timestamp: new Date().toISOString()
        }
      ]
    };

    return this.repo.saveNote(newNote);
  }

  public updateNoteContent(noteId: string, newContent: string, updatedBy: string): ConsultationNote {
    const notes = this.repo.getNotes();
    const note = notes.find(n => n.id === noteId);
    if (!note) throw new Error("Note record not found");

    const newVersionNumber = note.versionHistory.length + 1;
    
    // Add to historical track
    note.versionHistory.push({
      version: newVersionNumber,
      content: note.content, // save current as history
      updatedBy,
      timestamp: new Date().toISOString()
    });

    note.content = newContent;
    note.updatedAt = new Date().toISOString();

    return this.repo.saveNote(note);
  }
}
export const consultationService = ConsultationService.getInstance();


// ---------------------------------------------------------------------------
// 6. WORKFLOW SERVICE
// ---------------------------------------------------------------------------
export class WorkflowService {
  private static instance: WorkflowService;
  private repo = WorkflowRepository.getInstance();

  private constructor() {}

  public static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  public getOrCreateWorkflowForIdentity(identityId: string): ConsultationWorkflow {
    let wf = this.repo.getWorkflowByIdentity(identityId);
    if (!wf) {
      wf = {
        id: `wf_${Date.now()}`,
        identityId,
        currentStage: "VISITOR",
        stagesState: this.repo.createInitialStages(),
        overallProgress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };
      
      // Auto active first stage
      wf.stagesState["VISITOR"].status = "IN_PROGRESS";
      wf.stagesState["VISITOR"].startDate = new Date().toISOString();
      wf.stagesState["VISITOR"].progressPercentage = 30;

      this.repo.saveWorkflow(wf);
    }
    return wf;
  }

  public advanceWorkflowStage(
    identityId: string,
    nextStage: ConsultationWorkflowStage,
    updateNotes: string,
    changedBy: string
  ): ConsultationWorkflow {
    const wf = this.getOrCreateWorkflowForIdentity(identityId);
    const current = wf.currentStage;

    // Check if stage is already in desired
    if (current === nextStage) return wf;

    // Conclude current stage state
    const currentStageState = wf.stagesState[current];
    currentStageState.status = "COMPLETED";
    currentStageState.progressPercentage = 100;
    currentStageState.endDate = new Date().toISOString();
    currentStageState.notes = updateNotes;
    currentStageState.history.push({
      timestamp: new Date().toISOString(),
      changedBy,
      updateMessage: `Stage concluded. Transitioned to next step: ${nextStage}`
    });

    // Start next stage state
    const nextStageState = wf.stagesState[nextStage];
    nextStageState.status = "IN_PROGRESS";
    nextStageState.progressPercentage = 20;
    nextStageState.startDate = new Date().toISOString();
    nextStageState.history.push({
      timestamp: new Date().toISOString(),
      changedBy,
      updateMessage: `Stage activated automatically during transition.`
    });

    // Update overall workflow metadata
    wf.currentStage = nextStage;
    wf.updatedAt = new Date().toISOString();
    wf.version += 1;
    wf.overallProgress = this.calculateOverallProgress(wf);

    const saved = this.repo.saveWorkflow(wf);

    // Log to chronological timeline
    workflowTimelineService.logEvent({
      identityId,
      eventType: "STAGE_TRANSITION",
      title: `Workflow Stage Transition: ${nextStage.replace(/_/g, " ")}`,
      description: `Central record moved to new lifecycle checkpoint. Details: ${updateNotes}`,
      authorId: changedBy
    });

    // Execute mock automations based on stage changes
    this.triggerStageAutomations(nextStage, identityId, changedBy);

    return saved;
  }

  private triggerStageAutomations(stage: ConsultationWorkflowStage, identityId: string, changedBy: string) {
    if (stage === "REPORT_DELIVERED") {
      // Create follow up automatically 7 days later
      const targetDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
      
      // Look for active consultation
      const consultations = consultationService.getConsultationsByIdentity(identityId);
      const activeConsId = consultations.length > 0 ? consultations[0].id : "manual_fup";

      followUpService.createFollowUp({
        consultationId: activeConsId,
        identityId,
        reason: "POST REPORT REMEDY PLACEMENT SYNC",
        dueDate: targetDate,
        notes: "Automated trigger: Follow-up created 7 days after digital report package delivery.",
        authorId: "AUTOMATION_ENGINE"
      });
    } else if (stage === "ANNUAL_REVIEW") {
      // Create reminder task
      taskService.createTask({
        identityId,
        title: "Schedule 12-Month Space Re-balancing",
        description: "Analyze changes in household structure or external construction to verify directional flows.",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        assignedUserId: changedBy
      });
    }
  }

  public updateStageChecklistItem(
    identityId: string,
    stage: ConsultationWorkflowStage,
    itemIndex: number,
    done: boolean,
    changedBy: string
  ): ConsultationWorkflow {
    const wf = this.getOrCreateWorkflowForIdentity(identityId);
    const stageState = wf.stagesState[stage];
    
    if (stageState.checklist[itemIndex]) {
      stageState.checklist[itemIndex].done = done;
      stageState.history.push({
        timestamp: new Date().toISOString(),
        changedBy,
        updateMessage: `Checklist item [${stageState.checklist[itemIndex].item}] marked as ${done ? 'DONE' : 'PENDING'}`
      });

      // Recalculate progress of this stage
      const doneCount = stageState.checklist.filter(item => item.done).length;
      stageState.progressPercentage = Math.round((doneCount / stageState.checklist.length) * 100);

      wf.updatedAt = new Date().toISOString();
      wf.overallProgress = this.calculateOverallProgress(wf);
      this.repo.saveWorkflow(wf);
    }
    return wf;
  }

  public updateStageNotes(
    identityId: string,
    stage: ConsultationWorkflowStage,
    notes: string,
    changedBy: string
  ): ConsultationWorkflow {
    const wf = this.getOrCreateWorkflowForIdentity(identityId);
    const stageState = wf.stagesState[stage];
    
    stageState.notes = notes;
    stageState.history.push({
      timestamp: new Date().toISOString(),
      changedBy,
      updateMessage: `Stage notes updated.`
    });

    wf.updatedAt = new Date().toISOString();
    this.repo.saveWorkflow(wf);
    return wf;
  }

  private calculateOverallProgress(wf: ConsultationWorkflow): number {
    const stages = Object.keys(wf.stagesState) as ConsultationWorkflowStage[];
    let completedCount = 0;
    stages.forEach(stg => {
      if (wf.stagesState[stg].status === "COMPLETED") {
        completedCount++;
      }
    });
    // Give weight to active stage
    const activeProgress = wf.stagesState[wf.currentStage]?.progressPercentage || 0;
    const baseProgress = (completedCount / stages.length) * 100;
    const total = baseProgress + (activeProgress / stages.length);
    return Math.min(Math.round(total), 100);
  }
}
export const workflowService = WorkflowService.getInstance();
