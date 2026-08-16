// Centralized Identity Engine & Lead Intelligence Foundation Types
// URJAFLUX AI OS - Single Source of Truth for Human Entities

export type IdentityType = 
  | "VISITOR"
  | "LEAD"
  | "CLIENT"
  | "CONSULTANT"
  | "STAFF"
  | "SUPER_ADMIN";

export type LeadLifecycleStatus =
  | "VISITOR"
  | "LEAD_CREATED"
  | "FREE_ANALYSIS_COMPLETED"
  | "CONSULTATION_BOOKED"
  | "CONSULTATION_COMPLETED"
  | "CLIENT"
  | "REPEAT_CLIENT"
  | "INACTIVE";

export interface Identity {
  id: string; // Unified unique identity ID
  type: IdentityType;
  status: LeadLifecycleStatus;
  fullName: string;
  mobileNumber: string;
  email?: string;
  dob?: string;          // YYYY-MM-DD
  timeOfBirth?: string;  // HH:MM
  placeOfBirth?: string; // City, State, Country
  privacyPolicyAccepted: boolean;
  termsAccepted: boolean;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// RELATION MODELS (One Identity -> Many relationships)

export interface IdentityProperty {
  id: string;
  identityId: string;
  propertyName: string;
  propertyType: string; // Residential, Commercial, Industrial, etc.
  address: string;
  city: string;
  state: string;
  country: string;
  floorPlanUrl?: string; // From file upload
  drawnFloorPlan?: boolean; // True if canvas-drawn
  createdAt: string;
}

export interface IdentityReport {
  id: string;
  identityId: string;
  title: string;
  type: "VASTU" | "NUMEROLOGY" | "LAL_KITAB" | "COMPREHENSIVE";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  dateCreated: string;
  notes?: string;
}

export interface IdentityConsultation {
  id: string;
  identityId: string;
  consultantId: string;
  date: string;
  notes: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export interface IdentityFollowUp {
  id: string;
  identityId: string;
  date: string;
  status: "PENDING" | "DONE";
  topic: string;
  notes?: string;
}

export interface IdentityNote {
  id: string;
  identityId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface IdentityAppointment {
  id: string;
  identityId: string;
  dateTime: string;
  durationMinutes: number;
  type: string; // Phone, Site Visit, Zoom, etc.
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

// OTP verification structure
export interface OtpVerificationAttempt {
  mobileNumber: string;
  codeSent: string;
  status: "SENT" | "VERIFIED" | "FAILED" | "EXPIRED";
  timestamp: string;
}
