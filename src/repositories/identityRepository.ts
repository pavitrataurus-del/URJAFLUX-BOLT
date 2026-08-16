import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  where 
} from "firebase/firestore";
import { safeSetDoc } from "../utils/firestoreSanitizer";
import { db, isFirebaseConfigured } from "../firebase";
import { 
  Identity, 
  IdentityProperty, 
  IdentityReport, 
  IdentityConsultation, 
  IdentityFollowUp, 
  IdentityNote, 
  IdentityAppointment 
} from "../types/identity";

const STORAGE_KEYS = {
  IDENTITIES: "urjaflux_identities",
  PROPERTIES: "urjaflux_identity_properties",
  REPORTS: "urjaflux_identity_reports",
  CONSULTATIONS: "urjaflux_identity_consultations",
  FOLLOW_UPS: "urjaflux_identity_follow_ups",
  NOTES: "urjaflux_identity_notes",
  APPOINTMENTS: "urjaflux_identity_appointments"
};

// ---------------------------------------------------------------------------
// LOCAL STORAGE GET / SAVE HELPERS
// ---------------------------------------------------------------------------
function getLocalList<T>(key: string): T[] {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`[URJAFLUX IDENTITY] Error parsing local key: ${key}`, e);
    }
  }
  return [];
}

function saveLocalList<T>(key: string, list: T[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

// ---------------------------------------------------------------------------
// ARCHITECTURAL IDENTITY REPOSITORY
// ---------------------------------------------------------------------------
export class IdentityRepository {
  private static instance: IdentityRepository;

  private constructor() {}

  public static getInstance(): IdentityRepository {
    if (!IdentityRepository.instance) {
      IdentityRepository.instance = new IdentityRepository();
    }
    return IdentityRepository.instance;
  }

  // ---------------------------------------------------------------------------
  // IDENTITY ENGINE (Core Human Entity)
  // ---------------------------------------------------------------------------
  public async getIdentity(id: string): Promise<Identity | null> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identities"), where("id", "==", id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as Identity;
        }
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getIdentity failed, falling back:", err);
      }
    }
    const local = getLocalList<Identity>(STORAGE_KEYS.IDENTITIES);
    return local.find(i => i.id === id) || null;
  }

  public async getIdentityByMobile(mobileNumber: string): Promise<Identity | null> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identities"), where("mobileNumber", "==", mobileNumber));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as Identity;
        }
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getIdentityByMobile failed, falling back:", err);
      }
    }
    const local = getLocalList<Identity>(STORAGE_KEYS.IDENTITIES);
    return local.find(i => i.mobileNumber === mobileNumber) || null;
  }

  public async getAllIdentities(): Promise<Identity[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identities"));
        const snap = await getDocs(q);
        const list: Identity[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as Identity);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getAllIdentities failed, falling back:", err);
      }
    }
    return getLocalList<Identity>(STORAGE_KEYS.IDENTITIES);
  }

  public async saveIdentity(identity: Identity): Promise<Identity> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "identities", identity.id);
        await safeSetDoc(docRef, identity);
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore saveIdentity failed, falling back:", err);
      }
    }

    const local = getLocalList<Identity>(STORAGE_KEYS.IDENTITIES);
    const index = local.findIndex(i => i.id === identity.id);
    if (index >= 0) {
      local[index] = identity;
    } else {
      local.push(identity);
    }
    saveLocalList(STORAGE_KEYS.IDENTITIES, local);
    return identity;
  }

  // ---------------------------------------------------------------------------
  // IDENTITY PROPERTIES (One Identity -> Many Properties)
  // ---------------------------------------------------------------------------
  public async getProperties(identityId: string): Promise<IdentityProperty[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identity_properties"), where("identityId", "==", identityId));
        const snap = await getDocs(q);
        const list: IdentityProperty[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as IdentityProperty);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getProperties failed, falling back:", err);
      }
    }
    const local = getLocalList<IdentityProperty>(STORAGE_KEYS.PROPERTIES);
    return local.filter(p => p.identityId === identityId);
  }

  public async saveProperty(property: IdentityProperty): Promise<IdentityProperty> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "identity_properties", property.id);
        await safeSetDoc(docRef, property);
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore saveProperty failed, falling back:", err);
      }
    }

    const local = getLocalList<IdentityProperty>(STORAGE_KEYS.PROPERTIES);
    const index = local.findIndex(p => p.id === property.id);
    if (index >= 0) {
      local[index] = property;
    } else {
      local.push(property);
    }
    saveLocalList(STORAGE_KEYS.PROPERTIES, local);
    return property;
  }

  // ---------------------------------------------------------------------------
  // IDENTITY REPORTS (One Identity -> Many Reports)
  // ---------------------------------------------------------------------------
  public async getReports(identityId: string): Promise<IdentityReport[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identity_reports"), where("identityId", "==", identityId));
        const snap = await getDocs(q);
        const list: IdentityReport[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as IdentityReport);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getReports failed, falling back:", err);
      }
    }
    const local = getLocalList<IdentityReport>(STORAGE_KEYS.REPORTS);
    return local.filter(r => r.identityId === identityId);
  }

  public async saveReport(report: IdentityReport): Promise<IdentityReport> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "identity_reports", report.id);
        await safeSetDoc(docRef, report);
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore saveReport failed, falling back:", err);
      }
    }

    const local = getLocalList<IdentityReport>(STORAGE_KEYS.REPORTS);
    const index = local.findIndex(r => r.id === report.id);
    if (index >= 0) {
      local[index] = report;
    } else {
      local.push(report);
    }
    saveLocalList(STORAGE_KEYS.REPORTS, local);
    return report;
  }

  // ---------------------------------------------------------------------------
  // IDENTITY CONSULTATIONS (One Identity -> Many Consultations)
  // ---------------------------------------------------------------------------
  public async getConsultations(identityId: string): Promise<IdentityConsultation[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identity_consultations"), where("identityId", "==", identityId));
        const snap = await getDocs(q);
        const list: IdentityConsultation[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as IdentityConsultation);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getConsultations failed, falling back:", err);
      }
    }
    const local = getLocalList<IdentityConsultation>(STORAGE_KEYS.CONSULTATIONS);
    return local.filter(c => c.identityId === identityId);
  }

  public async saveConsultation(consultation: IdentityConsultation): Promise<IdentityConsultation> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "identity_consultations", consultation.id);
        await safeSetDoc(docRef, consultation);
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore saveConsultation failed, falling back:", err);
      }
    }

    const local = getLocalList<IdentityConsultation>(STORAGE_KEYS.CONSULTATIONS);
    const index = local.findIndex(c => c.id === consultation.id);
    if (index >= 0) {
      local[index] = consultation;
    } else {
      local.push(consultation);
    }
    saveLocalList(STORAGE_KEYS.CONSULTATIONS, local);
    return consultation;
  }

  // ---------------------------------------------------------------------------
  // IDENTITY FOLLOW UPS (One Identity -> Many Follow Ups)
  // ---------------------------------------------------------------------------
  public async getFollowUps(identityId: string): Promise<IdentityFollowUp[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identity_follow_ups"), where("identityId", "==", identityId));
        const snap = await getDocs(q);
        const list: IdentityFollowUp[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as IdentityFollowUp);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getFollowUps failed, falling back:", err);
      }
    }
    const local = getLocalList<IdentityFollowUp>(STORAGE_KEYS.FOLLOW_UPS);
    return local.filter(f => f.identityId === identityId);
  }

  public async saveFollowUp(followUp: IdentityFollowUp): Promise<IdentityFollowUp> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "identity_follow_ups", followUp.id);
        await safeSetDoc(docRef, followUp);
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore saveFollowUp failed, falling back:", err);
      }
    }

    const local = getLocalList<IdentityFollowUp>(STORAGE_KEYS.FOLLOW_UPS);
    const index = local.findIndex(f => f.id === followUp.id);
    if (index >= 0) {
      local[index] = followUp;
    } else {
      local.push(followUp);
    }
    saveLocalList(STORAGE_KEYS.FOLLOW_UPS, local);
    return followUp;
  }

  // ---------------------------------------------------------------------------
  // IDENTITY NOTES (One Identity -> Many Notes)
  // ---------------------------------------------------------------------------
  public async getNotes(identityId: string): Promise<IdentityNote[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identity_notes"), where("identityId", "==", identityId));
        const snap = await getDocs(q);
        const list: IdentityNote[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as IdentityNote);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getNotes failed, falling back:", err);
      }
    }
    const local = getLocalList<IdentityNote>(STORAGE_KEYS.NOTES);
    return local.filter(n => n.identityId === identityId);
  }

  public async saveNote(note: IdentityNote): Promise<IdentityNote> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "identity_notes", note.id);
        await safeSetDoc(docRef, note);
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore saveNote failed, falling back:", err);
      }
    }

    const local = getLocalList<IdentityNote>(STORAGE_KEYS.NOTES);
    const index = local.findIndex(n => n.id === note.id);
    if (index >= 0) {
      local[index] = note;
    } else {
      local.push(note);
    }
    saveLocalList(STORAGE_KEYS.NOTES, local);
    return note;
  }

  // ---------------------------------------------------------------------------
  // IDENTITY APPOINTMENTS (One Identity -> Many Appointments)
  // ---------------------------------------------------------------------------
  public async getAppointments(identityId: string): Promise<IdentityAppointment[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "identity_appointments"), where("identityId", "==", identityId));
        const snap = await getDocs(q);
        const list: IdentityAppointment[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as IdentityAppointment);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore getAppointments failed, falling back:", err);
      }
    }
    const local = getLocalList<IdentityAppointment>(STORAGE_KEYS.APPOINTMENTS);
    return local.filter(a => a.identityId === identityId);
  }

  public async saveAppointment(appointment: IdentityAppointment): Promise<IdentityAppointment> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "identity_appointments", appointment.id);
        await safeSetDoc(docRef, appointment);
      } catch (err) {
        console.warn("[URJAFLUX IDENTITY] Firestore saveAppointment failed, falling back:", err);
      }
    }

    const local = getLocalList<IdentityAppointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = local.findIndex(a => a.id === appointment.id);
    if (index >= 0) {
      local[index] = appointment;
    } else {
      local.push(appointment);
    }
    saveLocalList(STORAGE_KEYS.APPOINTMENTS, local);
    return appointment;
  }
}
