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
  LeadLifecycleStatus,
  OtpVerificationAttempt
} from "../types/identity";

const OTP_STORAGE_KEY = "urjaflux_simulated_otps";

function getOtpList(): OtpVerificationAttempt[] {
  const stored = localStorage.getItem(OTP_STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
}

function saveOtpList(list: OtpVerificationAttempt[]) {
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(list));
}

export class IdentityService {
  private static instance: IdentityService;
  private repo = IdentityRepository.getInstance();

  private constructor() {
    this.seedInitialIdentities();
  }

  public static getInstance(): IdentityService {
    if (!IdentityService.instance) {
      IdentityService.instance = new IdentityService();
    }
    return IdentityService.instance;
  }

  // Generate unique ID
  public generateIdentityId(): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "ID-";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // OTP ARCHITECTURE SIMULATOR
  // ---------------------------------------------------------------------------
  public async requestOtp(mobileNumber: string): Promise<string> {
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 90000).toString();
    const attempt: OtpVerificationAttempt = {
      mobileNumber,
      codeSent: code,
      status: "SENT",
      timestamp: new Date().toISOString()
    };

    const current = getOtpList();
    current.push(attempt);
    saveOtpList(current);

    console.log(`[URJAFLUX IDENTITY ENGINE] OTP verification sent for ${mobileNumber}. Simulated Code: ${code}`);
    return code; // Return the code for UI display simulation
  }

  public async verifyOtp(mobileNumber: string, code: string): Promise<boolean> {
    const list = getOtpList();
    
    let attemptIndex = -1;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].mobileNumber === mobileNumber && list[i].status === "SENT") {
        attemptIndex = i;
        break;
      }
    }
    
    if (attemptIndex === -1) return false;
    
    const attempt = list[attemptIndex];
    
    // Check if within 5 minutes
    const sentTime = new Date(attempt.timestamp).getTime();
    const diff = (Date.now() - sentTime) / 1000;
    
    if (diff > 300) {
      attempt.status = "EXPIRED";
      list[attemptIndex] = attempt;
      saveOtpList(list);
      return false;
    }

    if (attempt.codeSent === code) {
      attempt.status = "VERIFIED";
      list[attemptIndex] = attempt;
      saveOtpList(list);
      return true;
    } else {
      attempt.status = "FAILED";
      list[attemptIndex] = attempt;
      saveOtpList(list);
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // LEAD LOGIC & LIFE LIFE CYCLES
  // ---------------------------------------------------------------------------
  public async createVisitorLead(params: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    dob?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    privacyPolicyAccepted: boolean;
    termsAccepted: boolean;
    otpVerified: boolean;
  }): Promise<Identity> {
    // Perform strict validation
    if (!params.fullName || params.fullName.trim() === "") {
      throw new Error("Full Name is mandatory before starting any analysis.");
    }
    if (!params.mobileNumber || params.mobileNumber.trim() === "") {
      throw new Error("Mobile Number is mandatory before starting any analysis.");
    }
    if (!params.privacyPolicyAccepted || !params.termsAccepted) {
      throw new Error("Privacy Policy and Terms of Service must be explicitly accepted.");
    }
    if (!params.otpVerified) {
      throw new Error("OTP verification is mandatory before analysis can begin.");
    }

    // Check if identity already exists by phone
    const existing = await this.repo.getIdentityByMobile(params.mobileNumber);
    if (existing) {
      // If found, update properties if they were empty
      const updated: Identity = {
        ...existing,
        fullName: params.fullName,
        email: params.email || existing.email,
        dob: params.dob || existing.dob,
        timeOfBirth: params.timeOfBirth || existing.timeOfBirth,
        placeOfBirth: params.placeOfBirth || existing.placeOfBirth,
        otpVerified: true,
        updatedAt: new Date().toISOString()
      };
      return await this.repo.saveIdentity(updated);
    }

    const id = this.generateIdentityId();
    const newIdentity: Identity = {
      id,
      type: "VISITOR",
      status: "LEAD_CREATED",
      fullName: params.fullName,
      mobileNumber: params.mobileNumber,
      email: params.email,
      dob: params.dob,
      timeOfBirth: params.timeOfBirth,
      placeOfBirth: params.placeOfBirth,
      privacyPolicyAccepted: true,
      termsAccepted: true,
      otpVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.repo.saveIdentity(newIdentity);
  }

  public async updateLifecycleStatus(identityId: string, status: LeadLifecycleStatus): Promise<Identity> {
    const identity = await this.repo.getIdentity(identityId);
    if (!identity) throw new Error("Identity not found.");

    let type: IdentityType = identity.type;

    // Auto-align Type according to life cycle state
    if (status === "CLIENT" || status === "REPEAT_CLIENT") {
      type = "CLIENT";
    } else if (status === "INACTIVE") {
      type = "LEAD";
    }

    const updated: Identity = {
      ...identity,
      status,
      type,
      updatedAt: new Date().toISOString()
    };

    // Store historic tracking in a dedicated Note record to prevent deletion
    const trackingNote: IdentityNote = {
      id: `note_lifecycle_${Date.now()}`,
      identityId,
      content: `Lifecycle Status updated to: ${status} (Type: ${type})`,
      author: "System Engine",
      createdAt: new Date().toISOString()
    };

    await this.repo.saveNote(trackingNote);
    return await this.repo.saveIdentity(updated);
  }

  // ---------------------------------------------------------------------------
  // PROPERTIES OR FLOW DETAILS
  // ---------------------------------------------------------------------------
  public async addPropertyToIdentity(params: {
    identityId: string;
    propertyName: string;
    propertyType: string;
    address: string;
    city: string;
    state: string;
    country: string;
    floorPlanUrl?: string;
    drawnFloorPlan?: boolean;
  }): Promise<IdentityProperty> {
    const id = `prop_${Date.now()}`;
    const newProp: IdentityProperty = {
      id,
      ...params,
      createdAt: new Date().toISOString()
    };
    return await this.repo.saveProperty(newProp);
  }

  // Reports
  public async addReportToIdentity(params: {
    identityId: string;
    title: string;
    type: "VASTU" | "NUMEROLOGY" | "LAL_KITAB" | "COMPREHENSIVE";
    notes?: string;
  }): Promise<IdentityReport> {
    const id = `rep_${Date.now()}`;
    const newReport: IdentityReport = {
      id,
      ...params,
      status: "PUBLISHED",
      dateCreated: new Date().toISOString().split("T")[0]
    };
    return await this.repo.saveReport(newReport);
  }

  // Consultations
  public async addConsultationToIdentity(params: {
    identityId: string;
    consultantId: string;
    notes: string;
  }): Promise<IdentityConsultation> {
    const id = `cons_${Date.now()}`;
    const newConsultation: IdentityConsultation = {
      id,
      ...params,
      date: new Date().toISOString().split("T")[0],
      status: "COMPLETED"
    };
    return await this.repo.saveConsultation(newConsultation);
  }

  // Follow-ups
  public async addFollowUpToIdentity(params: {
    identityId: string;
    topic: string;
    notes?: string;
  }): Promise<IdentityFollowUp> {
    const id = `fup_${Date.now()}`;
    const newFollowUp: IdentityFollowUp = {
      id,
      ...params,
      date: new Date().toISOString().split("T")[0],
      status: "PENDING"
    };
    return await this.repo.saveFollowUp(newFollowUp);
  }

  // Notes
  public async addNoteToIdentity(params: {
    identityId: string;
    content: string;
    author: string;
  }): Promise<IdentityNote> {
    const id = `note_${Date.now()}`;
    const newNote: IdentityNote = {
      id,
      ...params,
      createdAt: new Date().toISOString()
    };
    return await this.repo.saveNote(newNote);
  }

  // Appointments
  public async addAppointmentToIdentity(params: {
    identityId: string;
    dateTime: string;
    durationMinutes: number;
    type: string;
    notes?: string;
  }): Promise<IdentityAppointment> {
    const id = `appt_${Date.now()}`;
    const newAppt: IdentityAppointment = {
      id,
      ...params,
      status: "CONFIRMED"
    };
    return await this.repo.saveAppointment(newAppt);
  }

  // ---------------------------------------------------------------------------
  // SEED INITIAL DATA
  // ---------------------------------------------------------------------------
  public async seedInitialIdentities(): Promise<void> {
    const existing = await this.repo.getAllIdentities();
    if (existing && existing.length > 0) return;

    // Seed 1: Shreya Sharma (Active Client with deep relationships)
    const i1: Identity = {
      id: "ID-VASTU901",
      type: "CLIENT",
      status: "REPEAT_CLIENT",
      fullName: "Shreya Sharma",
      mobileNumber: "9876543210",
      email: "shreya.sharma@example.com",
      dob: "1992-05-14",
      timeOfBirth: "08:45",
      placeOfBirth: "New Delhi, India",
      privacyPolicyAccepted: true,
      termsAccepted: true,
      otpVerified: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Seed 2: Vikram Aditya (Fresh Lead with a created analysis)
    const i2: Identity = {
      id: "ID-LEAD304",
      type: "LEAD",
      status: "FREE_ANALYSIS_COMPLETED",
      fullName: "Vikram Aditya",
      mobileNumber: "9123456780",
      email: "vikram.aditya@example.com",
      dob: "1988-11-23",
      timeOfBirth: "14:15",
      placeOfBirth: "Mumbai, Maharashtra",
      privacyPolicyAccepted: true,
      termsAccepted: true,
      otpVerified: true,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Seed 3: Ananya Patel (New Visitor checking out system)
    const i3: Identity = {
      id: "ID-VISIT012",
      type: "VISITOR",
      status: "VISITOR",
      fullName: "Ananya Patel",
      mobileNumber: "9988776655",
      privacyPolicyAccepted: true,
      termsAccepted: true,
      otpVerified: true,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.repo.saveIdentity(i1);
    await this.repo.saveIdentity(i2);
    await this.repo.saveIdentity(i3);

    // Seed Relations for Shreya Sharma
    const p1: IdentityProperty = {
      id: "prop_901a",
      identityId: "ID-VASTU901",
      propertyName: "Lotus Heights Residence",
      propertyType: "Residential Flat",
      address: "B-402, Sector 15, Dwarka",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      drawnFloorPlan: true,
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString()
    };
    const p2: IdentityProperty = {
      id: "prop_901b",
      identityId: "ID-VASTU901",
      propertyName: "Aura Diagnostics Center",
      propertyType: "Commercial Clinic",
      address: "Shop 12, Main Huda Market",
      city: "Gurugram",
      state: "Haryana",
      country: "India",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    };

    await this.repo.saveProperty(p1);
    await this.repo.saveProperty(p2);

    const r1: IdentityReport = {
      id: "rep_901a",
      identityId: "ID-VASTU901",
      title: "Comprehensive 16-Zone Dwarka Flat Vastu Report",
      type: "COMPREHENSIVE",
      status: "PUBLISHED",
      dateCreated: new Date(Date.now() - 25 * 86400000).toISOString().split("T")[0],
      notes: "Identified kitchen defect in NE; placed remedial zinc plate."
    };
    await this.repo.saveReport(r1);

    const c1: IdentityConsultation = {
      id: "cons_901a",
      identityId: "ID-VASTU901",
      consultantId: "ID-CONSULTANT-001",
      date: new Date(Date.now() - 26 * 86400000).toISOString().split("T")[0],
      notes: "Reviewed Dwarka flat floor plan; explained entrance effects.",
      status: "COMPLETED"
    };
    await this.repo.saveConsultation(c1);

    const f1: IdentityFollowUp = {
      id: "fup_901a",
      identityId: "ID-VASTU901",
      date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      status: "PENDING",
      topic: "Verify kitchen remedy and element balancing feedback.",
      notes: "Call client to confirm if zinc plate installation was successful."
    };
    await this.repo.saveFollowUp(f1);

    const n1: IdentityNote = {
      id: "note_901a",
      identityId: "ID-VASTU901",
      content: "Client was extremely cooperative. Intending to consult for commercial clinic next week.",
      author: "Senior Consultant",
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
    };
    await this.repo.saveNote(n1);

    const a1: IdentityAppointment = {
      id: "appt_901a",
      identityId: "ID-VASTU901",
      dateTime: new Date(Date.now() + 3 * 86400000).toISOString(),
      durationMinutes: 45,
      type: "Zoom Consultation",
      status: "CONFIRMED",
      notes: "Follow-up verification check."
    };
    await this.repo.saveAppointment(a1);

    // Seed Relations for Vikram Aditya
    const p3: IdentityProperty = {
      id: "prop_304a",
      identityId: "ID-LEAD304",
      propertyName: "Aditya Villa",
      propertyType: "Residential House",
      address: "Rowhouse No. 5, Silver Oak Rowhouses",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
    };
    await this.repo.saveProperty(p3);
  }
}
export const identityService = IdentityService.getInstance();
