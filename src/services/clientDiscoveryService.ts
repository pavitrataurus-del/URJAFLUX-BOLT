/**
 * KIE Sprint-2 Module 1: Client Discovery Service (Founder Edition)
 * Securely collects, validates, and stores Client Discovery information.
 * Features a Provider-Independent Storage Architecture & Automatic Identity Management.
 * Follows Frozen KIE Architecture.
 */

import { 
  ClientDiscoveryRecord, 
  ClientDiscoveryValidationResult,
  ConsultationPurpose,
  PropertyConstraint,
  ClientPreference,
  PropertyType,
  PropertyOwnership,
  ExpandedPropertyCategory,
  ReportLanguage,
  ReportTypePreference,
  DiscoverySummary,
  IClientDiscoveryStorageProvider
} from "../types/clientDiscovery";
import { RuntimeEvaluationSessionStore } from "../core/session/RuntimeEvaluationSession";

const STORAGE_KEY = "urjaflux_kie_client_discovery_v1";

/**
 * Helper to generate automatic Client ID: CLT-YYYYMMDD-XXXX
 */
export function generateClientId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CLT-${dateStr}-${rand}`;
}

/**
 * Helper to generate automatic Consultation ID: CNS-YYYYMMDD-XXXX
 */
export function generateConsultationId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CNS-${dateStr}-${rand}`;
}

/**
 * Derive legacy PropertyType and SubType from ExpandedPropertyCategory for backwards compatibility
 */
export function deriveLegacyPropertyTypeAndSubType(category: ExpandedPropertyCategory): { type: PropertyType; subType: string } {
  const residentialCategories: ExpandedPropertyCategory[] = ["Apartment", "Independent House", "Villa", "Duplex", "Farm House"];
  const commercialCategories: ExpandedPropertyCategory[] = ["Shop", "Office", "Commercial Office", "Factory", "Warehouse", "Industrial Unit", "Clinic", "Hospital", "Hotel", "Restaurant", "School", "College", "Temple", "Mixed Use Property"];
  
  if (residentialCategories.includes(category)) {
    return { type: "Residential", subType: category };
  }
  if (commercialCategories.includes(category)) {
    return { type: "Commercial", subType: category };
  }
  if (category === "Plot") {
    return { type: "Plot", subType: "Plot" };
  }
  return { type: "Other", subType: category };
}

/**
 * Builds a clean, structured Discovery Summary for downstream KIE reasoning engines
 */
export function buildDiscoverySummary(record: ClientDiscoveryRecord): DiscoverySummary {
  const occ = record.occupants;
  const breakdownParts: string[] = [];
  if (occ.adults > 0) breakdownParts.push(`${occ.adults} Adults`);
  if (occ.children > 0) breakdownParts.push(`${occ.children} Children`);
  if (occ.seniorCitizens > 0) breakdownParts.push(`${occ.seniorCitizens} Senior Citizens`);
  if (occ.workingProfessionals > 0) breakdownParts.push(`${occ.workingProfessionals} Professionals`);
  if (occ.students > 0) breakdownParts.push(`${occ.students} Students`);

  return {
    clientId: record.clientId,
    consultationId: record.consultationId,
    clientName: record.clientInfo.clientName || "Unassigned Client",
    cityAndCountry: `${record.clientInfo.city || "Unknown City"}, ${record.clientInfo.country || "India"}`,
    propertyCategory: record.propertyCategory,
    ownership: record.propertyOwnership,
    primaryProblems: record.primaryPurposes,
    primaryGoals: record.clientGoal,
    familySummary: {
      totalMembers: occ.totalMembers,
      breakdownText: breakdownParts.join(", ") || `${occ.totalMembers} Members`
    },
    propertyConstraints: record.constraints,
    clientPreferences: record.preferences,
    preferredLanguage: record.preferredLanguage,
    preferredReportType: record.preferredReportType,
    additionalNotes: record.additionalNotes,
    generatedAtFormatted: new Date(record.timestamp || Date.now()).toLocaleString()
  };
}

export function createDefaultClientDiscovery(): ClientDiscoveryRecord {
  const category: ExpandedPropertyCategory = "Apartment";
  const { type, subType } = deriveLegacyPropertyTypeAndSubType(category);

  return {
    clientId: generateClientId(),
    consultationId: generateConsultationId(),
    discoveryId: `DISC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: Date.now(),
    isCompleted: false,
    clientInfo: {
      clientName: "",
      mobile: "",
      email: "",
      city: "",
      country: "India"
    },
    propertyCategory: category,
    propertyType: type,
    propertySubType: subType,
    propertyOwnership: "Self Owned",
    primaryPurposes: ["Financial Growth", "Health", "Mental Peace"],
    clientGoal: "",
    occupants: {
      totalMembers: 4,
      adults: 2,
      children: 2,
      seniorCitizens: 0,
      workingProfessionals: 2,
      students: 2
    },
    constraints: ["No Demolition", "Moderate Budget"],
    preferences: ["Only Practical Remedies", "Non-Invasive Remedies Only"],
    preferredLanguage: "English",
    preferredReportType: "Homeowner Report",
    additionalNotes: ""
  };
}

export function createSamplePresetClientDiscovery(): ClientDiscoveryRecord {
  const category: ExpandedPropertyCategory = "Apartment";
  const { type, subType } = deriveLegacyPropertyTypeAndSubType(category);

  const record: ClientDiscoveryRecord = {
    clientId: generateClientId(),
    consultationId: generateConsultationId(),
    discoveryId: `DISC-PRESET-${Date.now()}`,
    timestamp: Date.now(),
    isCompleted: true,
    clientInfo: {
      clientName: "Pavitra Taurus",
      mobile: "+91 98765 43210",
      email: "pavitra.taurus@gmail.com",
      city: "Mumbai",
      country: "India"
    },
    propertyCategory: category,
    propertyType: type,
    propertySubType: subType,
    propertyOwnership: "Self Owned",
    primaryPurposes: ["Financial Growth", "Debt Problems", "Health", "Mental Peace"],
    clientGoal: "Accelerate business revenue growth, resolve lingering financial stress, and maintain family physical health & emotional peace without major structural demolition.",
    occupants: {
      totalMembers: 4,
      adults: 2,
      children: 1,
      seniorCitizens: 1,
      workingProfessionals: 2,
      students: 1
    },
    constraints: ["No Demolition", "Moderate Budget", "Society Restrictions"],
    preferences: ["Only Practical Remedies", "Non-Invasive Remedies Only", "Traditional Remedies Accepted"],
    preferredLanguage: "English",
    preferredReportType: "Homeowner Report",
    additionalNotes: "Property faces East entrance. Master bedroom located in South-West. Living area center has dining arrangement."
  };

  record.summary = buildDiscoverySummary(record);
  return record;
}

/**
 * Helper to sanitize ClientDiscoveryRecord with clean defaults for missing/blank fields
 */
export function sanitizeClientDiscoveryRecord(record: ClientDiscoveryRecord): ClientDiscoveryRecord {
  const clientId = record.clientId || generateClientId();
  const consultationId = record.consultationId || generateConsultationId();

  const clientName = (record.clientInfo?.clientName || "").trim() || `Client ${clientId.slice(-4)}`;
  const city = (record.clientInfo?.city || "").trim() || "Mumbai";
  const country = (record.clientInfo?.country || "").trim() || "India";
  const mobile = (record.clientInfo?.mobile || "").trim() || "+91 98765 43210";
  const email = (record.clientInfo?.email || "").trim() || "client@urjaflux.com";

  const propertyCategory = record.propertyCategory || "Apartment";
  const propertyOwnership = record.propertyOwnership || "Self Owned";
  const primaryPurposes: ConsultationPurpose[] = (record.primaryPurposes && record.primaryPurposes.length > 0)
    ? record.primaryPurposes
    : ["Financial Growth", "Health", "Mental Peace"];

  const rawGoal = (record.clientGoal || "").trim();
  const clientGoal = rawGoal.length >= 5
    ? rawGoal
    : "General Vastu analysis and spatial alignment for prosperity and vitality.";

  const occ = record.occupants || { totalMembers: 4, adults: 2, children: 2, seniorCitizens: 0, workingProfessionals: 2, students: 2 };
  const totalMembers = occ.totalMembers > 0 ? occ.totalMembers : 4;
  const adults = occ.adults >= 0 ? occ.adults : 2;
  const children = occ.children >= 0 ? occ.children : 2;
  const seniorCitizens = occ.seniorCitizens >= 0 ? occ.seniorCitizens : 0;
  const workingProfessionals = occ.workingProfessionals >= 0 ? occ.workingProfessionals : 2;
  const students = occ.students >= 0 ? occ.students : 2;

  const constraints: PropertyConstraint[] = (record.constraints && record.constraints.length > 0)
    ? record.constraints
    : ["No Demolition", "Moderate Budget"];

  const preferences: ClientPreference[] = (record.preferences && record.preferences.length > 0)
    ? record.preferences
    : ["Only Practical Remedies"];

  const preferredLanguage = record.preferredLanguage || "English";
  const preferredReportType = record.preferredReportType || "Homeowner Report";

  const { type, subType } = deriveLegacyPropertyTypeAndSubType(propertyCategory);

  return {
    ...record,
    clientId,
    consultationId,
    discoveryId: record.discoveryId || `DISC-${Date.now()}`,
    timestamp: record.timestamp || Date.now(),
    clientInfo: {
      clientName,
      mobile,
      email,
      city,
      country
    },
    propertyCategory,
    propertyType: type,
    propertySubType: subType,
    propertyOwnership,
    primaryPurposes,
    clientGoal,
    occupants: {
      totalMembers,
      adults,
      children,
      seniorCitizens,
      workingProfessionals,
      students
    },
    constraints,
    preferences,
    preferredLanguage,
    preferredReportType,
    additionalNotes: record.additionalNotes || ""
  };
}

export function validateClientDiscovery(record: ClientDiscoveryRecord): ClientDiscoveryValidationResult {
  const errors: Record<string, string> = {};
  let completedSections = 0;
  const totalSections = 10;

  // Section 1: Client Info
  if (!record.clientInfo.clientName.trim()) {
    errors.clientName = "Client name is required";
  }
  if (!record.clientInfo.city.trim()) {
    errors.city = "City is required";
  }
  if (!record.clientInfo.country.trim()) {
    errors.country = "Country is required";
  }
  if (record.clientInfo.clientName.trim() && record.clientInfo.city.trim() && record.clientInfo.country.trim()) {
    completedSections++;
  }

  // Section 2: Property Category
  if (record.propertyCategory) {
    completedSections++;
  } else {
    errors.propertyCategory = "Property category must be selected";
  }

  // Section 3: Property Ownership
  if (record.propertyOwnership) {
    completedSections++;
  } else {
    errors.propertyOwnership = "Property ownership must be selected";
  }

  // Section 4: Primary Purpose
  if (!record.primaryPurposes || record.primaryPurposes.length === 0) {
    errors.primaryPurposes = "Select at least one consultation purpose";
  } else {
    completedSections++;
  }

  // Section 5: Client Goal
  if (!record.clientGoal || record.clientGoal.trim().length < 5) {
    errors.clientGoal = "Please state the client goal (at least 5 characters)";
  } else {
    completedSections++;
  }

  // Section 6: Occupants
  if (record.occupants.totalMembers <= 0) {
    errors.occupants = "Total family members count must be at least 1";
  } else {
    completedSections++;
  }

  // Section 7: Constraints
  if (!record.constraints || record.constraints.length === 0) {
    errors.constraints = "Select at least one property constraint";
  } else {
    completedSections++;
  }

  // Section 8: Preferences
  if (!record.preferences || record.preferences.length === 0) {
    errors.preferences = "Select at least one client preference";
  } else {
    completedSections++;
  }

  // Section 9: Preferred Language & Report Type
  if (record.preferredLanguage && record.preferredReportType) {
    completedSections++;
  } else {
    errors.preferredLanguage = "Report language & type preference required";
  }

  // Section 10: Additional Notes (Optional but counted as completed)
  completedSections++;

  const isValid = Object.keys(errors).length === 0;
  const summary = isValid ? buildDiscoverySummary(record) : undefined;

  return {
    isValid,
    completedSectionsCount: completedSections,
    totalSectionsCount: totalSections,
    errors,
    summary
  };
}

// ==========================================
// PROVIDER-INDEPENDENT STORAGE IMPLEMENTATIONS
// ==========================================

/**
 * 1. Default LocalStorage Provider
 */
export class LocalStorageDiscoveryStorageProvider implements IClientDiscoveryStorageProvider {
  public saveDiscovery(record: ClientDiscoveryRecord): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      console.error("LocalStorageDiscoveryStorageProvider: Failed to save record:", e);
    }
  }

  public loadDiscovery(): ClientDiscoveryRecord | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ClientDiscoveryRecord;
      }
    } catch (e) {
      console.warn("LocalStorageDiscoveryStorageProvider: Failed to load record:", e);
    }
    return null;
  }

  public clearDiscovery(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("LocalStorageDiscoveryStorageProvider: Failed to clear record:", e);
    }
  }

  public getProviderName(): string {
    return "LocalStorageProvider";
  }
}

/**
 * 2. Skeleton Firebase Provider (Ready for future Firebase/Firestore backend binding)
 */
export class FirebaseDiscoveryStorageProvider implements IClientDiscoveryStorageProvider {
  public async saveDiscovery(record: ClientDiscoveryRecord): Promise<void> {
    console.log("[FirebaseStorageProvider] Mock saving Client Discovery to Firestore doc:", record.consultationId);
  }

  public async loadDiscovery(): Promise<ClientDiscoveryRecord | null> {
    console.log("[FirebaseStorageProvider] Mock loading Client Discovery from Firestore");
    return null;
  }

  public async clearDiscovery(): Promise<void> {
    console.log("[FirebaseStorageProvider] Mock clearing Client Discovery document");
  }

  public getProviderName(): string {
    return "FirebaseFirestoreProvider";
  }
}

// ==========================================
// CLIENT DISCOVERY SERVICE MANAGER
// ==========================================

class ClientDiscoveryServiceManager {
  private storageProvider: IClientDiscoveryStorageProvider = new LocalStorageDiscoveryStorageProvider();
  private currentDiscovery: ClientDiscoveryRecord = this.initFromStorage();
  private listeners: Set<() => void> = new Set();

  private initFromStorage(): ClientDiscoveryRecord {
    const rawLoaded = this.storageProvider.loadDiscovery();
    // Handle synchronous return from LocalStorage or sync providers
    if (rawLoaded && !(rawLoaded instanceof Promise)) {
      const loaded = rawLoaded as ClientDiscoveryRecord;
      if (loaded.clientInfo) {
        // Ensure automatic IDs exist if loading legacy records
        if (!loaded.clientId) loaded.clientId = generateClientId();
        if (!loaded.consultationId) loaded.consultationId = generateConsultationId();
        if (!loaded.propertyCategory) loaded.propertyCategory = "Apartment";
        if (!loaded.preferredLanguage) loaded.preferredLanguage = "English";
        if (!loaded.preferredReportType) loaded.preferredReportType = "Homeowner Report";
        
        const { type, subType } = deriveLegacyPropertyTypeAndSubType(loaded.propertyCategory);
        loaded.propertyType = type;
        loaded.propertySubType = subType;
        
        if (loaded.isCompleted) {
          loaded.summary = buildDiscoverySummary(loaded);
        }
        return loaded;
      }
    }
    return createDefaultClientDiscovery();
  }

  public setStorageProvider(provider: IClientDiscoveryStorageProvider): void {
    console.log(`[ClientDiscoveryService] Switched storage provider to: ${provider.getProviderName()}`);
    this.storageProvider = provider;
  }

  public getActiveStorageProviderName(): string {
    return this.storageProvider.getProviderName();
  }

  public getDiscovery(): ClientDiscoveryRecord {
    return { ...this.currentDiscovery };
  }

  public isCompleted(): boolean {
    if (this.currentDiscovery.isCompleted) return true;
    const sanitized = sanitizeClientDiscoveryRecord(this.currentDiscovery);
    return validateClientDiscovery(sanitized).isValid;
  }

  public saveDiscovery(record: ClientDiscoveryRecord, autoFillMissing: boolean = true): ClientDiscoveryValidationResult {
    const recordToSave = autoFillMissing ? sanitizeClientDiscoveryRecord(record) : record;
    const validation = validateClientDiscovery(recordToSave);
    
    // Automatic derivations
    const { type, subType } = deriveLegacyPropertyTypeAndSubType(recordToSave.propertyCategory);
    
    const updatedRecord: ClientDiscoveryRecord = {
      ...recordToSave,
      clientId: recordToSave.clientId || generateClientId(),
      consultationId: recordToSave.consultationId || generateConsultationId(),
      propertyType: type,
      propertySubType: subType,
      timestamp: Date.now(),
      isCompleted: autoFillMissing ? true : validation.isValid,
      summary: validation.summary || buildDiscoverySummary(recordToSave)
    };

    this.currentDiscovery = updatedRecord;

    // Persist via active provider
    this.storageProvider.saveDiscovery(updatedRecord);

    // Synchronize with RuntimeEvaluationSessionStore
    const session = RuntimeEvaluationSessionStore.getSession();
    RuntimeEvaluationSessionStore.setSession({
      ...session,
      clientName: updatedRecord.clientInfo.clientName || session.clientName,
      propertyName: `${updatedRecord.propertyCategory} (${updatedRecord.propertyOwnership})`,
      clientDiscovery: updatedRecord,
      isDiscoveryCompleted: updatedRecord.isCompleted
    });

    this.notify();
    return validation;
  }

  public loadPresetSample(): ClientDiscoveryRecord {
    const sample = createSamplePresetClientDiscovery();
    this.saveDiscovery(sample);
    return sample;
  }

  public resetDiscovery(): ClientDiscoveryRecord {
    const fresh = createDefaultClientDiscovery();
    this.saveDiscovery(fresh);
    return fresh;
  }

  public getDiscoverySummary(): DiscoverySummary | null {
    if (!this.isCompleted()) return null;
    return this.currentDiscovery.summary || buildDiscoverySummary(this.currentDiscovery);
  }

  public getDiscoveryContextForAnalysis(): string {
    const disc = this.currentDiscovery;
    if (!disc.isCompleted) {
      return "CLIENT DISCOVERY STATUS: INCOMPLETE";
    }

    const summary = disc.summary || buildDiscoverySummary(disc);

    return [
      `=== OFFICIAL KIE CLIENT DISCOVERY CONTEXT ===`,
      `Client ID: ${summary.clientId} | Consultation ID: ${summary.consultationId}`,
      `Client Name: ${summary.clientName} (${summary.cityAndCountry})`,
      `Property Category: ${summary.propertyCategory} (${summary.ownership})`,
      `Primary Purpose / Problems: ${summary.primaryProblems.join(", ")}`,
      `Client Goal & Vision: "${summary.primaryGoals}"`,
      `Occupants: ${summary.familySummary.totalMembers} Total (${summary.familySummary.breakdownText})`,
      `Property Constraints: ${summary.propertyConstraints.join(", ")}`,
      `Client Preferences: ${summary.clientPreferences.join(", ")}`,
      `Preferred Language: ${summary.preferredLanguage}`,
      `Preferred Report Type: ${summary.preferredReportType}`,
      summary.additionalNotes ? `Additional Notes: ${summary.additionalNotes}` : ""
    ].filter(Boolean).join("\n");
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }
}

export const clientDiscoveryService = new ClientDiscoveryServiceManager();

