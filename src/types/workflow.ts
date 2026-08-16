// Enterprise Consultant Workflow Engine Types
// URJAFLUX AI OS - Client Interaction & Consultation Management

export type ConsultationWorkflowStage =
  | "VISITOR"
  | "LEAD_CREATED"
  | "IDENTITY_VERIFIED"
  | "FREE_ANALYSIS"
  | "CONSULTATION_REQUESTED"
  | "CONSULTATION_SCHEDULED"
  | "CONSULTATION_CONFIRMED"
  | "CONSULTATION_IN_PROGRESS"
  | "ANALYSIS_COMPLETE"
  | "REPORT_DRAFT"
  | "REPORT_REVIEWED"
  | "REPORT_DELIVERED"
  | "REMEDY_TRACKING"
  | "FOLLOW_UP_SCHEDULED"
  | "FOLLOW_UP_COMPLETED"
  | "ANNUAL_REVIEW"
  | "REPEAT_CONSULTATION";

export interface WorkflowStageState {
  stage: ConsultationWorkflowStage;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "CANCELLED";
  ownerId: string;
  startDate?: string;
  endDate?: string;
  durationMinutes?: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  progressPercentage: number; // 0 to 100
  notes: string;
  attachments: string[]; // URLs or file names
  checklist: { item: string; done: boolean }[];
  history: { timestamp: string; changedBy: string; updateMessage: string }[];
}

export interface ConsultationWorkflow {
  id: string; // Unified workflow ID
  identityId: string; // Reference to core Identity
  currentStage: ConsultationWorkflowStage;
  stagesState: Record<ConsultationWorkflowStage, WorkflowStageState>;
  overallProgress: number; // calculated progress metric
  createdAt: string;
  updatedAt: string;
  version: number;
}

// PART 3: CONSULTATION ENTITY
export type ConsultationType = "ASTROLOGY" | "VASTU" | "NUMEROLOGY" | "COMBINED";
export type MeetingMode = "ONLINE" | "OFFLINE" | "SITE_VISIT" | "PHONE" | "VIDEO";

export interface Consultation {
  id: string; // Consultation ID
  identityId: string; // Core Identity ID
  consultantId: string;
  propertyId?: string; // Optional Vastu Property ID
  type: ConsultationType;
  mode: MeetingMode;
  durationMinutes: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  outcome?: string;
  recommendations: string[];
  nextAction?: string;
  createdAt: string;
  updatedAt: string;
}

// PART 4: TASK ENGINE
export interface ConsultationTask {
  id: string;
  consultationId?: string; // Optional link to specific Consultation
  identityId: string; // Linked to core Identity
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate: string;
  assignedUserId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dependencies: string[]; // List of task IDs that must complete first
  recurringPattern?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUALLY";
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// PART 5: APPOINTMENT ENGINE
export interface Appointment {
  id: string;
  identityId: string;
  consultationId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timezone: string;
  mode: MeetingMode;
  location?: string; // Physical location or meeting link
  reminderSchedule: "NONE" | "15_MIN" | "1_HOUR" | "1_DAY" | "CUSTOM";
  attendance: "PENDING" | "ATTENDED" | "NO_SHOW" | "CANCELLED";
  status: "SCHEDULED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// PART 6: FOLLOW-UP ENGINE
export interface FollowUp {
  id: string;
  consultationId: string;
  identityId: string;
  reason: string;
  dueDate: string;
  reminderDate?: string;
  completedDate?: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "OVERDUE";
  notes: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

// PART 7: CONSULTATION NOTES (With Version History)
export interface NoteVersion {
  version: number;
  content: string;
  updatedBy: string;
  timestamp: string;
}

export interface ConsultationNote {
  id: string;
  consultationId?: string;
  identityId: string;
  title: string;
  content: string; // Rich Text or plain markdown
  attachments: { name: string; url: string; type: "IMAGE" | "PDF" | "FLOOR_PLAN" | "OTHER" }[];
  isPrivate: boolean; // True: Private consultant notes, False: Shared client notes
  authorId: string;
  createdAt: string;
  updatedAt: string;
  versionHistory: NoteVersion[];
}

// PART 9: WORKFLOW TIMELINE
export type TimelineEventType =
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_UPDATED"
  | "CONSULTATION_STARTED"
  | "CONSULTATION_COMPLETED"
  | "REPORT_GENERATED"
  | "REPORT_DELIVERED"
  | "FOLLOW_UP_CREATED"
  | "TASK_COMPLETED"
  | "REMINDER_SENT"
  | "STAGE_TRANSITION";

export interface TimelineEvent {
  id: string;
  identityId: string;
  consultationId?: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  authorId: string;
  timestamp: string;
}

// PART 11: WORKFLOW AUTOMATION RULE ARCHITECTURE (Architecture placeholder)
export interface AutomationRule {
  id: string;
  triggerEvent: "CONSULTATION_COMPLETED" | "REPORT_DELIVERED" | "ANNUAL_REVIEW_REACHED" | "NO_RESPONSE";
  actionType: "GENERATE_DRAFT" | "SCHEDULE_FOLLOW_UP" | "CREATE_REMINDER" | "CREATE_TASK";
  config: Record<string, any>;
  isActive: boolean;
}
