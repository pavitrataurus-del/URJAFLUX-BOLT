import { PromptTemplate, PromptVersion, PromptApprovalStatus } from "./types";

export class PromptRegistry {
  private static instance: PromptRegistry | null = null;
  private templates = new Map<string, PromptTemplate>();
  private versions = new Map<string, PromptVersion[]>();

  private constructor() {
    this.seedDefaultTemplates();
  }

  public static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  private seedDefaultTemplates() {
    // 1. Vastu Analysis Prompt Template
    const template1: PromptTemplate = {
      id: "tmpl-vastu-analyser",
      name: "UrjaFlux Astro-Vastu Diagnostic",
      description: "Generates high-precision, non-invasive Astro-Vastu diagnostics and targeted remedies.",
      category: "Vastu",
      activeVersionId: "ver-vastu-1-0",
      variables: ["building_blueprint_data", "birth_details", "location_profile"],
      isApproved: true,
      approvalStatus: PromptApprovalStatus.APPROVED,
      approvedBy: "pavitra.taurus@gmail.com",
      approvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "astrologer_lead_01",
      updatedBy: "pavitra.taurus@gmail.com",
      version: "1.0.0",
      status: "ACTIVE",
      tags: ["vastu", "remedies", "diagnostics"],
      metadata: { department: "Vastu Science" }
    };

    const ver1_0: PromptVersion = {
      id: "ver-vastu-1-0",
      templateId: "tmpl-vastu-analyser",
      promptText: "You are the UrjaFlux AI Engine, an elite Astro-Vastu & Spatial Intelligence Kernel. Analyze this blueprint: {building_blueprint_data} and the client's natal charts: {birth_details} situated at {location_profile}. Recommend remedies.",
      changeSummary: "Initial high-precision diagnostic prompt release.",
      testCases: [
        { building_blueprint_data: "Toilets in Northeast", birth_details: "Saturn in 4th house", location_profile: "New Delhi", expected: "North-West alternative suggestion" }
      ],
      createdAt: template1.createdAt,
      updatedAt: template1.createdAt,
      createdBy: "astrologer_lead_01",
      updatedBy: "astrologer_lead_01",
      version: "1.0.0",
      status: "ACTIVE",
      tags: ["stable"],
      metadata: {}
    };

    // Pre-seed a candidate version for diff / comparison demo
    const ver1_1: PromptVersion = {
      id: "ver-vastu-1-1",
      templateId: "tmpl-vastu-analyser",
      promptText: "You are the specialized UrjaFlux AI Core, integrating Vedic Astro-Vastu logic and scientific geo-magnetic principles. Evaluate the following spatial parameters: {building_blueprint_data}, cosmic natal properties: {birth_details}, and geo-spatial vectors: {location_profile}. Output actionable remedies categorized by priority.",
      changeSummary: "Incorporate geo-magnetic science vectors and structured priorities.",
      testCases: [
        { building_blueprint_data: "Toilets in Northeast", birth_details: "Saturn in 4th house", location_profile: "New Delhi", expected: "Immediate shielding or relocation recommendation" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "astrologer_lead_01",
      updatedBy: "astrologer_lead_01",
      version: "1.1.0",
      status: "PENDING",
      tags: ["beta", "priority-grouped"],
      metadata: {}
    };

    this.templates.set(template1.id, template1);
    this.versions.set(template1.id, [ver1_0, ver1_1]);

    // 2. Lal Kitab Planetary Analysis Template
    const template2: PromptTemplate = {
      id: "tmpl-lalkitab-analyser",
      name: "Lal Kitab Planet Strength Solver",
      description: "Automates Lal Kitab chart calculations, planetary placements, and specific house remedies.",
      category: "Lal Kitab",
      activeVersionId: "ver-lalkitab-1-0",
      variables: ["planetary_positions", "current_dasha", "client_age"],
      isApproved: true,
      approvalStatus: PromptApprovalStatus.APPROVED,
      approvedBy: "pavitra.taurus@gmail.com",
      approvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "lalkitab_scholar_01",
      updatedBy: "lalkitab_scholar_01",
      version: "1.0.0",
      status: "ACTIVE",
      tags: ["lalkitab", "astro", "remedies"],
      metadata: {}
    };

    const verLal1_0: PromptVersion = {
      id: "ver-lalkitab-1-0",
      templateId: "tmpl-lalkitab-analyser",
      promptText: "Analyze the planetary alignment: {planetary_positions} for current Mahadasha cycle: {current_dasha} at current client age: {client_age}. Solve planetary strengths and map corrective non-invasive Lal Kitab items.",
      changeSummary: "First release of planetary strength calculator prompt.",
      testCases: [],
      createdAt: template2.createdAt,
      updatedAt: template2.createdAt,
      createdBy: "lalkitab_scholar_01",
      updatedBy: "lalkitab_scholar_01",
      version: "1.0.0",
      status: "ACTIVE",
      tags: [],
      metadata: {}
    };

    this.templates.set(template2.id, template2);
    this.versions.set(template2.id, [verLal1_0]);
  }

  public getTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  public getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  public getVersions(templateId: string): PromptVersion[] {
    return this.versions.get(templateId) || [];
  }

  public getPromptVersion(versionId: string): PromptVersion | undefined {
    for (const [_, vers] of this.versions.entries()) {
      const v = vers.find(x => x.id === versionId);
      if (v) return v;
    }
    return undefined;
  }

  public createTemplate(template: Omit<PromptTemplate, "id" | "createdAt" | "updatedAt" | "activeVersionId" | "isApproved" | "approvalStatus">, initialPromptText: string): PromptTemplate {
    const templateId = `tmpl-${Math.random().toString(36).substr(2, 9)}`;
    const versionId = `ver-${Math.random().toString(36).substr(2, 9)}`;

    // Parse variables e.g. {var}
    const variables: string[] = [];
    const regex = /\{([a-zA-Z0-9_]+)\}/g;
    let match;
    while ((match = regex.exec(initialPromptText)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    const newTemplate: PromptTemplate = {
      ...template,
      id: templateId,
      activeVersionId: versionId,
      variables,
      isApproved: false,
      approvalStatus: PromptApprovalStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "1.0.0"
    };

    const newVersion: PromptVersion = {
      id: versionId,
      templateId,
      promptText: initialPromptText,
      changeSummary: "Initial Draft release",
      testCases: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: template.createdBy,
      updatedBy: template.updatedBy,
      version: "1.0.0",
      status: "DRAFT",
      tags: ["draft"],
      metadata: {}
    };

    this.templates.set(templateId, newTemplate);
    this.versions.set(templateId, [newVersion]);
    return newTemplate;
  }

  public addVersion(templateId: string, promptText: string, changeSummary: string, creator: string): PromptVersion | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const currentVersions = this.versions.get(templateId) || [];
    const nextSubVersion = currentVersions.length + 1;
    const versionId = `ver-${Math.random().toString(36).substr(2, 9)}`;

    const variables: string[] = [];
    const regex = /\{([a-zA-Z0-9_]+)\}/g;
    let match;
    while ((match = regex.exec(promptText)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    // update template variables
    template.variables = Array.from(new Set([...template.variables, ...variables]));
    template.updatedAt = new Date().toISOString();
    template.updatedBy = creator;

    const newVersion: PromptVersion = {
      id: versionId,
      templateId,
      promptText,
      changeSummary,
      testCases: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: creator,
      updatedBy: creator,
      version: `1.${nextSubVersion}.0`,
      status: "DRAFT",
      tags: [],
      metadata: {}
    };

    currentVersions.push(newVersion);
    this.versions.set(templateId, currentVersions);
    return newVersion;
  }

  public approveVersion(templateId: string, versionId: string, approver: string): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    const versionsList = this.versions.get(templateId) || [];
    const targetVersion = versionsList.find(v => v.id === versionId);
    if (!targetVersion) return false;

    // Update old active version to status 'HISTORIC'
    versionsList.forEach(v => {
      if (v.id === template.activeVersionId) {
        v.status = "HISTORIC";
      }
    });

    targetVersion.status = "ACTIVE";
    template.activeVersionId = versionId;
    template.isApproved = true;
    template.approvalStatus = PromptApprovalStatus.APPROVED;
    template.approvedBy = approver;
    template.approvedAt = new Date().toISOString();
    template.updatedAt = new Date().toISOString();
    template.updatedBy = approver;

    return true;
  }

  public rollbackToVersion(templateId: string, versionId: string, operator: string): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    const versionsList = this.versions.get(templateId) || [];
    const targetVersion = versionsList.find(v => v.id === versionId);
    if (!targetVersion) return false;

    template.activeVersionId = versionId;
    template.updatedAt = new Date().toISOString();
    template.updatedBy = operator;
    template.isApproved = true;
    template.approvalStatus = PromptApprovalStatus.APPROVED;

    // log historic rollback event
    return true;
  }

  public compile(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(`Prompt template '${templateId}' not found in registry.`);

    const versionsList = this.versions.get(templateId) || [];
    const activeVersion = versionsList.find(v => v.id === template.activeVersionId);
    if (!activeVersion) throw new Error(`No active version found for prompt template '${templateId}'.`);

    let prompt = activeVersion.promptText;
    for (const key of Object.keys(variables)) {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, "g"), variables[key]);
    }
    return prompt;
  }
}
