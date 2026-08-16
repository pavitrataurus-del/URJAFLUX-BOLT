import { 
  AgentConfig, 
  AiTask, 
  HumanApprovalRequest, 
  ProjectMemoryItem, 
  ConversationContext, 
  ExecutionPolicy, 
  ModelRouteConfig, 
  ReasoningPipelineStep, 
  ScheduledAiTask, 
  AgentObservabilityMetrics, 
  AgentId 
} from "../../types/autonomousAi";

// Initial 10 Specialized Agents
export const INITIAL_AGENT_REGISTRY: AgentConfig[] = [
  {
    id: "AGENT_SPATIAL_ANALYSIS",
    name: "Spatial & Cad Analysis Agent",
    title: "Spatial Intelligence Specialist",
    category: "ANALYTICAL font",
    capabilities: [
      { id: "cap_spatial_cad", name: "CAD Layout Parsing", description: "Extracts CAD wall, door, and spatial orientation boundaries", requiredPermission: "spatial:read", inputTypes: ["CAD_JSON", "DWG"], outputTypes: ["SPATIAL_VECTOR"] },
      { id: "cap_vastu_grid", name: "3x3 Vastu Grid Alignment", description: "Evaluates directional grid balance and elemental zones", requiredPermission: "spatial:analyze", inputTypes: ["SPATIAL_VECTOR"], outputTypes: ["GRID_SCORES"] }
    ],
    permissions: ["spatial:read", "spatial:analyze", "cad:parse"],
    inputs: ["CAD Floorplans", "Spatial Coordinates", "Directional Vectors"],
    outputs: ["Vastu Energy Maps", "Spatial Compliance Scores", "CAD Annotations"],
    dependencies: [],
    status: "ONLINE",
    healthScore: 99,
    totalExecutions: 1420,
    successRate: 98.4
  },
  {
    id: "AGENT_KNOWLEDGE",
    name: "Enterprise Knowledge Agent",
    title: "Knowledge Retrieval & Vector Engine",
    category: "COGNITIVE",
    capabilities: [
      { id: "cap_vector_search", name: "Vector Embedding Search", description: "Performs dense retrieval across indexed PDF/DOCX corpora", requiredPermission: "knowledge:query", inputTypes: ["TEXT_QUERY"], outputTypes: ["CITATIONS"] },
      { id: "cap_citation_verify", name: "Citation Verification", description: "Validates factuality and evidence grounding against primary sources", requiredPermission: "knowledge:verify", inputTypes: ["CLAIMS"], outputTypes: ["VERIFIED_CITATIONS"] }
    ],
    permissions: ["knowledge:query", "knowledge:read", "knowledge:verify"],
    inputs: ["Text Queries", "Knowledge Base References", "Domain Manuals"],
    outputs: ["Verified Citations", "Synthesized Literature Summaries", "Explanations"],
    dependencies: [],
    status: "ONLINE",
    healthScore: 100,
    totalExecutions: 3890,
    successRate: 99.2
  },
  {
    id: "AGENT_COMPLIANCE",
    name: "Enterprise Compliance & Safety Agent",
    title: "Regulatory & AI Safety Guard",
    category: "GOVERNANCE",
    capabilities: [
      { id: "cap_policy_audit", name: "Policy Violation Audit", description: "Evaluates action safety against RBAC and tenant security rules", requiredPermission: "governance:audit", inputTypes: ["ACTION_INTENT"], outputTypes: ["RISK_SCORE"] },
      { id: "cap_iso_check", name: "ISO 27001 Safety Guard", description: "Validates zero PII data leakage in outbound prompts", requiredPermission: "security:verify", inputTypes: ["PROMPT"], outputTypes: ["SANITIZED_PROMPT"] }
    ],
    permissions: ["governance:audit", "security:verify", "compliance:override"],
    inputs: ["Proposed System Actions", "User Prompts", "Tenant Security Rules"],
    outputs: ["Risk Assessment Reports", "Sanitization Logs", "Gatekeeper Approvals"],
    dependencies: [],
    status: "ONLINE",
    healthScore: 98,
    totalExecutions: 2750,
    successRate: 99.8
  },
  {
    id: "AGENT_REPORT_GENERATION",
    name: "Report Generation Agent",
    title: "Executive PDF & Analytics Synthesizer",
    category: "ANALYTICAL font",
    capabilities: [
      { id: "cap_pdf_synth", name: "Multi-Module Report Compiler", description: "Generates branded PDF audit reports with vector charts", requiredPermission: "reports:generate", inputTypes: ["RAW_METRICS"], outputTypes: ["PDF_BLOB"] }
    ],
    permissions: ["reports:generate", "pdf:export"],
    inputs: ["Spatial Scores", "Twin Metrics", "Compliance Audits"],
    outputs: ["Executive PDF Reports", "Markdown Summaries"],
    dependencies: ["AGENT_KNOWLEDGE", "AGENT_SPATIAL_ANALYSIS"],
    status: "ONLINE",
    healthScore: 97,
    totalExecutions: 890,
    successRate: 97.6
  },
  {
    id: "AGENT_DIGITAL_TWIN",
    name: "Digital Twin & Sensor Agent",
    title: "3D Spatial & Telemetry Engine",
    category: "OPERATIONAL",
    capabilities: [
      { id: "cap_telemetry_stream", name: "IoT Telemetry Stream Parser", description: "Monitors MQTT/OPC-UA sensor telemetry streams in 3D canvas", requiredPermission: "twin:telemetry", inputTypes: ["SENSOR_DATA"], outputTypes: ["3D_HEATMAP"] }
    ],
    permissions: ["twin:telemetry", "twin:control"],
    inputs: ["NVMe Asset Data", "IoT Telemetry Feeds", "3D Coordinates"],
    outputs: ["3D Anomaly Warnings", "Spatial Asset Health Indexes"],
    dependencies: ["AGENT_SPATIAL_ANALYSIS"],
    status: "ONLINE",
    healthScore: 96,
    totalExecutions: 1120,
    successRate: 98.1
  },
  {
    id: "AGENT_WORKFLOW_AUTOMATION",
    name: "Workflow Automation Agent",
    title: "Orchestration & Event Automator",
    category: "AUTONOMOUS",
    capabilities: [
      { id: "cap_event_trigger", name: "Multi-Stage Workflow Execution", description: "Executes automated sequence triggers across system pipelines", requiredPermission: "workflow:execute", inputTypes: ["EVENT_PAYLOAD"], outputTypes: ["JOB_STATUS"] }
    ],
    permissions: ["workflow:execute", "workflow:write"],
    inputs: ["System Events", "Cron Triggers", "Task Queues"],
    outputs: ["Pipeline Results", "Task Cascade Logs"],
    dependencies: ["AGENT_COMPLIANCE"],
    status: "ONLINE",
    healthScore: 100,
    totalExecutions: 4500,
    successRate: 99.5
  },
  {
    id: "AGENT_CUSTOMER_SUCCESS",
    name: "Customer Success & Adoption Agent",
    title: "Health Score & Renewal Advisor",
    category: "AUTONOMOUS",
    capabilities: [
      { id: "cap_health_radar", name: "Customer Health Radar Calculation", description: "Evaluates account DAU/MAU adoption and renewal risk", requiredPermission: "success:read", inputTypes: ["USAGE_TELEMETRY"], outputTypes: ["HEALTH_SCORE"] }
    ],
    permissions: ["success:read", "success:notify"],
    inputs: ["Tenant Telemetry", "Support Ticket Frequencies"],
    outputs: ["Customer Health Warnings", "Automated Outreach Triggers"],
    dependencies: [],
    status: "ONLINE",
    healthScore: 98,
    totalExecutions: 670,
    successRate: 99.0
  },
  {
    id: "AGENT_DEPLOYMENT_ADVISOR",
    name: "Deployment Advisor Agent",
    title: "Container & SRE Infrastructure Guard",
    category: "OPERATIONAL",
    capabilities: [
      { id: "cap_sre_preflight", name: "Cloud Run Pre-Flight Validation", description: "Checks container sockets, NVMe IOPS, and memory limits", requiredPermission: "deploy:validate", inputTypes: ["INFRA_CONFIG"], outputTypes: ["PREFLIGHT_STATUS"] }
    ],
    permissions: ["deploy:validate", "infra:read"],
    inputs: ["Cloud Run Configs", "Port 3000 Ingress Rules"],
    outputs: ["Infrastructure Diagnostic Matrix", "Deployment Go/No-Go"],
    dependencies: [],
    status: "ONLINE",
    healthScore: 99,
    totalExecutions: 540,
    successRate: 98.9
  },
  {
    id: "AGENT_PLUGIN_ADVISOR",
    name: "Plugin SDK Advisor Agent",
    title: "Extensibility & Sandbox Auditor",
    category: "GOVERNANCE",
    capabilities: [
      { id: "cap_plugin_sandbox", name: "Wasm/JS Sandbox Compliance", description: "Audits third-party plugin extensions for security boundary leaks", requiredPermission: "plugin:audit", inputTypes: ["PLUGIN_CODE"], outputTypes: ["SANDBOX_VERDICT"] }
    ],
    permissions: ["plugin:audit", "plugin:register"],
    inputs: ["TypeScript Plugin Manifests", "Custom Hooks"],
    outputs: ["Sandbox Audit Verdicts", "API Permission Grants"],
    dependencies: ["AGENT_COMPLIANCE"],
    status: "ONLINE",
    healthScore: 97,
    totalExecutions: 310,
    successRate: 96.8
  },
  {
    id: "AGENT_OPERATIONS",
    name: "Operations & Observability Agent",
    title: "SLA & Cost Telemetry Monitor",
    category: "OPERATIONAL",
    capabilities: [
      { id: "cap_cost_calc", name: "Token & Compute Cost Tracking", description: "Monitors API token usage and calculates projected cloud costs", requiredPermission: "ops:telemetry", inputTypes: ["TOKEN_LOGS"], outputTypes: ["COST_BREAKDOWN"] }
    ],
    permissions: ["ops:telemetry", "system:monitor"],
    inputs: ["Execution Logs", "API Gateway Telemetry"],
    outputs: ["SLA Violation Warnings", "Token Cost Breakdowns"],
    dependencies: [],
    status: "ONLINE",
    healthScore: 100,
    totalExecutions: 6200,
    successRate: 99.9
  }
];

// Initial Tasks
export const INITIAL_AI_TASKS: AiTask[] = [
  {
    id: "TASK-1001",
    tenantId: "TENANT-URJA-CORP",
    title: "Autonomous Vastu & CAD Blueprint Safety Audit",
    description: "Analyze uploaded CAD layout for main entrance directional alignment and structural load compliance.",
    priority: "HIGH",
    status: "COMPLETED",
    primaryAgentId: "AGENT_SPATIAL_ANALYSIS",
    collaboratingAgentIds: ["AGENT_KNOWLEDGE", "AGENT_COMPLIANCE"],
    riskLevel: "MEDIUM",
    requiresHumanApproval: false,
    dependencies: [],
    inputContext: { floorplanId: "cad_layout_302", scale: "1:100" },
    outputResult: {
      summary: "Cad layout parsed with 94/100 Vastu directional harmony score.",
      explanation: "Main entrance is aligned to North-East (Ishan). Kitchen is positioned in South-East (Agneya). All directional zones comply with enterprise spatial guidelines.",
      citations: ["Vastu Manual Vol. 4, Section 12", "URJAFLUX Architectural Code 2026.1"],
      confidenceScore: 96,
      artifactsGenerated: ["vastu_heat_map.png", "spatial_report.pdf"]
    },
    retryCount: 0,
    maxRetries: 3,
    createdAt: "2026-07-27 10:15:00",
    startedAt: "2026-07-27 10:15:02",
    completedAt: "2026-07-27 10:15:18",
    executionLogs: [
      { timestamp: "10:15:00", stepName: "Queue Ingestion", status: "INFO", message: "Task queued by user admin" },
      { timestamp: "10:15:02", stepName: "Agent Selection", status: "SUCCESS", message: "Assigned AGENT_SPATIAL_ANALYSIS with priority HIGH" },
      { timestamp: "10:15:18", stepName: "Execution Finished", status: "SUCCESS", message: "Generated Vastu Heat Map with 96% confidence score" }
    ]
  },
  {
    id: "TASK-1002",
    tenantId: "TENANT-URJA-CORP",
    title: "High-Risk IoT Digital Twin Actuator Calibration",
    description: "Automated real-time adjustment of HVAC ventilation damps in 3D Digital Twin Zone 4 based on sensor heat spikes.",
    priority: "CRITICAL",
    status: "AWAITING_APPROVAL",
    primaryAgentId: "AGENT_DIGITAL_TWIN",
    collaboratingAgentIds: ["AGENT_COMPLIANCE", "AGENT_WORKFLOW_AUTOMATION"],
    riskLevel: "CRITICAL",
    requiresHumanApproval: true,
    approvalRequestId: "APP-9001",
    dependencies: [],
    inputContext: { zoneId: "Zone_4_Server_Room", temperatureCelsius: 38.5 },
    retryCount: 0,
    maxRetries: 2,
    createdAt: "2026-07-27 14:30:00",
    executionLogs: [
      { timestamp: "14:30:00", stepName: "Sensor Spike Detected", status: "WARNING", message: "Temperature exceeded 35.0C threshold" },
      { timestamp: "14:30:02", stepName: "Policy Check", status: "WARNING", message: "Action classified as CRITICAL risk. Halting for Human Approval." }
    ]
  }
];

// Initial Approvals
export const INITIAL_APPROVAL_REQUESTS: HumanApprovalRequest[] = [
  {
    id: "APP-9001",
    taskId: "TASK-1002",
    tenantId: "TENANT-URJA-CORP",
    actionTitle: "Calibrate HVAC Actuators in Server Room Zone 4",
    requestorAgentId: "AGENT_DIGITAL_TWIN",
    riskLevel: "CRITICAL",
    riskDetails: "Modifying physical HVAC damper values may alter airflow across live server racks. Policy requires explicit human verification.",
    requiredRole: "SUPER_ADMIN",
    status: "PENDING",
    assignedToUser: "admin.pavitra@urjaflux.io",
    timeoutMinutes: 30,
    createdAt: "2026-07-27 14:30:02",
    auditTrail: [
      { timestamp: "14:30:02", action: "REQUEST_CREATED", actor: "AGENT_DIGITAL_TWIN", notes: "Triggered by Policy Rule POL-CRITICAL-01" }
    ]
  }
];

// Initial Project Memories
export const INITIAL_PROJECT_MEMORIES: ProjectMemoryItem[] = [
  {
    id: "MEM-01",
    tenantId: "TENANT-URJA-CORP",
    key: "preferred_vastu_orientations",
    category: "PREFERENCE",
    content: "Corporate tenant prefers North-East entrances and strict South-West master office placements.",
    citations: ["Tenant Preference Document v2.1"],
    confidence: 100,
    createdTime: "2026-07-20",
    lastAccessedTime: "2026-07-27",
    ttlDays: 365
  },
  {
    id: "MEM-02",
    tenantId: "TENANT-URJA-CORP",
    key: "twin_zone_4_safe_operating_temps",
    category: "TWIN",
    content: "Server Room Zone 4 safe temperature ceiling is 36.0 degrees Celsius before thermal throttling.",
    citations: ["SRE Infrastructure Specification"],
    confidence: 98,
    createdTime: "2026-07-22",
    lastAccessedTime: "2026-07-27",
    ttlDays: 180
  }
];

// Initial Execution Policies
export const INITIAL_EXECUTION_POLICIES: ExecutionPolicy[] = [
  {
    id: "POL-LOW-01",
    tenantId: "TENANT-URJA-CORP",
    name: "Read-Only Knowledge & Spatial Queries",
    category: "SECURITY",
    riskLevel: "LOW",
    condition: "Action is read-only information retrieval or CAD visualization",
    actionRequired: "ALLOW",
    approvalTimeoutMinutes: 0,
    autoEscalateOnTimeout: false,
    active: true
  },
  {
    id: "POL-HIGH-01",
    tenantId: "TENANT-URJA-CORP",
    name: "System Configuration or License Modifications",
    category: "RISK",
    riskLevel: "HIGH",
    condition: "Action modifies workspace settings, seat allocations, or system parameters",
    actionRequired: "REQUIRE_APPROVAL",
    approvalTimeoutMinutes: 60,
    autoEscalateOnTimeout: true,
    active: true
  },
  {
    id: "POL-CRITICAL-01",
    tenantId: "TENANT-URJA-CORP",
    name: "Physical Hardware or Digital Twin Actuator Overrides",
    category: "APPROVAL",
    riskLevel: "CRITICAL",
    condition: "Action alters live IoT actuators or initiates bulk automated outreach",
    actionRequired: "REQUIRE_APPROVAL",
    approvalTimeoutMinutes: 15,
    autoEscalateOnTimeout: true,
    active: true
  }
];

// Initial Model Routes
export const INITIAL_MODEL_ROUTES: ModelRouteConfig[] = [
  {
    id: "ROUTE-GEMINI-FLASH",
    provider: "GEMINI",
    modelName: "gemini-3.6-flash",
    capabilityMatch: ["SPATIAL_ANALYSIS", "KNOWLEDGE_SYNTHESIS", "REASONING"],
    costPer1kTokensUsd: 0.00015,
    latencyMs: 180,
    healthStatus: "HEALTHY",
    isFallback: false,
    isExternalDependency: true
  },
  {
    id: "ROUTE-OPENAI-GPT4O",
    provider: "OPENAI",
    modelName: "gpt-4o-mini",
    capabilityMatch: ["REPORT_GENERATION", "CODE_AUDIT"],
    costPer1kTokensUsd: 0.00030,
    latencyMs: 250,
    healthStatus: "HEALTHY",
    isFallback: true,
    isExternalDependency: true
  },
  {
    id: "ROUTE-LOCAL-MISTRAL",
    provider: "LOCAL_LLM",
    modelName: "mistral-7b-instruct-v0.3-q4",
    capabilityMatch: ["SANITY_CHECK", "FAST_CLASSIFICATION"],
    costPer1kTokensUsd: 0.0000,
    latencyMs: 90,
    healthStatus: "HEALTHY",
    isFallback: true,
    isExternalDependency: false
  }
];

// Initial Scheduled Autonomous AI Workflows
export const INITIAL_SCHEDULED_WORKFLOWS: ScheduledAiTask[] = [
  {
    id: "SCHED-01",
    tenantId: "TENANT-URJA-CORP",
    title: "Daily Automated Vastu & Compliance Safety Sweep",
    cronExpression: "0 0 * * *", // midnight
    targetAgentId: "AGENT_COMPLIANCE",
    category: "COMPLIANCE_SWEEP",
    lastRunTimestamp: "2026-07-27 00:00:00",
    nextRunTimestamp: "2026-07-28 00:00:00",
    enabled: true,
    status: "IDLE"
  },
  {
    id: "SCHED-02",
    tenantId: "TENANT-URJA-CORP",
    title: "Real-Time Digital Twin IoT Anomaly Detection Loop",
    cronExpression: "*/15 * * * *", // every 15 mins
    targetAgentId: "AGENT_DIGITAL_TWIN",
    category: "TWIN_MONITOR",
    lastRunTimestamp: "2026-07-27 14:45:00",
    nextRunTimestamp: "2026-07-27 15:00:00",
    enabled: true,
    status: "IDLE"
  }
];

// Initial Observability Metrics
export const INITIAL_OBSERVABILITY_METRICS: AgentObservabilityMetrics = {
  totalTasksExecuted: 22850,
  activeQueueLength: 1,
  avgTaskLatencyMs: 240,
  avgApprovalLatencyMinutes: 4.2,
  failureRatePercentage: 0.35,
  policyViolationsPrevented: 142,
  estimatedMonthlyCostUsd: 12.80
};

// Standard 12-Step Reasoning Pipeline definition
export const STANDARD_REASONING_PIPELINE: ReasoningPipelineStep[] = [
  { stepNumber: 1, stepName: "User Request Ingestion", description: "Receive natural language query and context payloads", status: "PENDING" },
  { stepNumber: 2, stepName: "Intent Detection & Classification", description: "Map user query to task domain and target agent capabilities", status: "PENDING" },
  { stepNumber: 3, stepName: "Knowledge Base Retrieval", description: "Query indexed enterprise manuals for ground-truth citations", status: "PENDING" },
  { stepNumber: 4, stepName: "Spatial Context Resolution", description: "Extract CAD coordinates, wall vectors, and direction grids", status: "PENDING" },
  { stepNumber: 5, stepName: "Digital Twin Telemetry Check", description: "Inspect active 3D IoT sensor states and operational metrics", status: "PENDING" },
  { stepNumber: 6, stepName: "Policy Engine Validation", description: "Check RBAC rules, risk classification (Low/Medium/High/Critical)", status: "PENDING" },
  { stepNumber: 7, stepName: "Evidence & Citation Verification", description: "Cross-validate claims against primary knowledge references", status: "PENDING" },
  { stepNumber: 8, stepName: "Multi-Agent Collaboration", description: "Coordinate specialized sub-agents to compute final answers", status: "PENDING" },
  { stepNumber: 9, stepName: "Human Approval Gatekeeping", description: "Pause execution if action exceeds risk threshold or alters live hardware", status: "PENDING" },
  { stepNumber: 10, stepName: "Task Execution", description: "Run primary agent computation and assemble output payload", status: "PENDING" },
  { stepNumber: 11, stepName: "Synthesized Output & Citation Assembly", description: "Generate concise, explainable result with verifiable citations", status: "PENDING" },
  { stepNumber: 12, stepName: "Immutable Audit Log Logging", description: "Record complete execution trail into tenant audit ledger", status: "PENDING" }
];
