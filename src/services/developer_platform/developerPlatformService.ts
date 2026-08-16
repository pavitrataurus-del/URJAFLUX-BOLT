import { 
  DeveloperApplication, 
  ApiKeyRecord, 
  WebhookEndpoint, 
  SdkMetadata, 
  CliCommandDef, 
  PluginTemplate, 
  ApiSandboxRequest, 
  ApiSandboxResponse, 
  RegisteredPackage, 
  MarketplaceSubmission, 
  CicdTemplate, 
  DeveloperAnalyticsMetrics 
} from "../../types/developerPlatform";

export const INITIAL_DEVELOPER_APPS: DeveloperApplication[] = [
  {
    id: "APP-URJA-DEV-001",
    tenantId: "TENANT-URJA-CORP",
    name: "UrjaFlux CAD Spatial Sync Plugin",
    description: "High-performance plugin that synchronizes AutoCAD and Revit BIM layers with UrjaFlux Digital Twin.",
    publisherName: "Aether Spatial Solutions",
    appType: "PLUGIN_EXTENSION",
    status: "ACTIVE",
    createdAt: "2026-01-15",
    apiKeysCount: 2,
    webhooksCount: 1,
    monthlyApiRequests: 142000
  },
  {
    id: "APP-URJA-DEV-002",
    tenantId: "TENANT-URJA-CORP",
    name: "Vastu Energy Analytics Bot",
    description: "Automated AI agent bot for executing weekly Vastu heat map audits and IoT sensor balance checks.",
    publisherName: "UrjaFlux System Integrators",
    appType: "AUTOMATION_BOT",
    status: "ACTIVE",
    createdAt: "2026-03-10",
    apiKeysCount: 1,
    webhooksCount: 2,
    monthlyApiRequests: 89500
  },
  {
    id: "APP-URJA-DEV-003",
    tenantId: "TENANT-URJA-CORP",
    name: "Enterprise ERP Connector Gateway",
    description: "Custom OAuth client connecting SAP S/4HANA supply chain orders with UrjaFlux CAD Bill of Materials.",
    publisherName: "Global SAP Integrations Ltd",
    appType: "WEB_APP",
    status: "PENDING_REVIEW",
    createdAt: "2026-06-01",
    apiKeysCount: 1,
    webhooksCount: 0,
    monthlyApiRequests: 12000
  }
];

export const INITIAL_API_KEYS: ApiKeyRecord[] = [
  {
    id: "KEY-001",
    appId: "APP-URJA-DEV-001",
    keyPrefix: "urja_live_9f8a...",
    label: "Production CAD Sync Key",
    scopes: ["cad:read", "cad:write", "twin:sync", "ai:query"],
    createdAt: "2026-01-16",
    lastUsedAt: "2026-07-27 14:10:00",
    active: true
  },
  {
    id: "KEY-002",
    appId: "APP-URJA-DEV-002",
    keyPrefix: "urja_live_3b1c...",
    label: "Vastu Bot API Token",
    scopes: ["vastu:audit", "iot:read", "ai:execute"],
    createdAt: "2026-03-11",
    lastUsedAt: "2026-07-27 12:45:00",
    active: true
  }
];

export const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: "HOOK-001",
    appId: "APP-URJA-DEV-001",
    targetUrl: "https://api.aetherspatial.com/webhooks/urjaflux",
    eventsSubscribed: ["twin.telemetry.alert", "vastu.audit.completed", "approval.status.changed"],
    secretToken: "whsec_99a8b7c6d5e4f3a2b1",
    status: "HEALTHY",
    lastDeliveredAt: "2026-07-27 14:05:22",
    successRate: 99.8
  }
];

export const OFFICIAL_SDKS: SdkMetadata[] = [
  {
    language: "TYPESCRIPT",
    version: "v3.2.0-GA",
    sdkType: "HANDWRITTEN",
    packageUrl: "@urjaflux/sdk-ts",
    docsUrl: "https://docs.urjaflux.io/sdks/typescript",
    supportsWebsocket: true,
    supportsRetryLogic: true,
    monthlyDownloads: 48200
  },
  {
    language: "PYTHON",
    version: "v3.1.4-GA",
    sdkType: "HANDWRITTEN",
    packageUrl: "urjaflux-sdk",
    docsUrl: "https://docs.urjaflux.io/sdks/python",
    supportsWebsocket: true,
    supportsRetryLogic: true,
    monthlyDownloads: 32100
  },
  {
    language: "JAVA",
    version: "v3.0.1-GA",
    sdkType: "GENERATED",
    packageUrl: "io.urjaflux:urjaflux-sdk-java",
    docsUrl: "https://docs.urjaflux.io/sdks/java",
    supportsWebsocket: false,
    supportsRetryLogic: true,
    monthlyDownloads: 14500
  },
  {
    language: "DOTNET",
    version: "v3.0.0-GA",
    sdkType: "GENERATED",
    packageUrl: "UrjaFlux.Sdk.Net",
    docsUrl: "https://docs.urjaflux.io/sdks/dotnet",
    supportsWebsocket: false,
    supportsRetryLogic: true,
    monthlyDownloads: 9800
  },
  {
    language: "GO",
    version: "v3.1.0-GA",
    sdkType: "HYBRID",
    packageUrl: "github.com/urjaflux/urjaflux-go-sdk",
    docsUrl: "https://docs.urjaflux.io/sdks/go",
    supportsWebsocket: true,
    supportsRetryLogic: true,
    monthlyDownloads: 18900
  }
];

export const CLI_COMMAND_DEFS: CliCommandDef[] = [
  {
    command: "urjaflux login",
    description: "Authenticate CLI developer context via OAuth2 PKCE or API Key token.",
    subcommands: ["--token", "--profile"],
    options: [
      { name: "--profile", type: "string", description: "Specify workspace profile name" }
    ],
    exampleUsage: "urjaflux login --profile enterprise-dev"
  },
  {
    command: "urjaflux project",
    description: "Initialize, validate, or build an UrjaFlux plugin extension project.",
    subcommands: ["init", "build", "validate", "test"],
    options: [
      { name: "--template", type: "string", description: "Template framework (cad-sync, twin-widget, vastu-ai)" }
    ],
    exampleUsage: "urjaflux project init my-cad-plugin --template cad-sync"
  },
  {
    command: "urjaflux plugin",
    description: "Manage local plugins, run hot reload sandbox, or inspect manifest specs.",
    subcommands: ["dev", "pack", "sign", "install"],
    options: [
      { name: "--port", type: "number", description: "Local sandbox dev server port" }
    ],
    exampleUsage: "urjaflux plugin dev --port 3000"
  },
  {
    command: "urjaflux digital-twin",
    description: "Query spatial sensors, trigger live actuator state, or stream telemetry.",
    subcommands: ["query", "sensors", "override"],
    options: [
      { name: "--zone", type: "string", description: "Spatial zone identifier (e.g. ZONE-NE-01)" }
    ],
    exampleUsage: "urjaflux digital-twin sensors --zone ZONE-NE-01"
  },
  {
    command: "urjaflux deploy",
    description: "Bundle and publish plugin package directly to the UrjaFlux Package Registry.",
    subcommands: ["staging", "production"],
    options: [
      { name: "--channel", type: "string", description: "Release channel (beta, stable, lts)" }
    ],
    exampleUsage: "urjaflux deploy --channel beta"
  },
  {
    command: "urjaflux doctor",
    description: "Run diagnostic system checks on local CLI environment, Node.js version, and API auth.",
    subcommands: ["--verbose"],
    options: [
      { name: "--verbose", type: "boolean", description: "Display full network response logs" }
    ],
    exampleUsage: "urjaflux doctor --verbose"
  }
];

export const PDK_TEMPLATES: PluginTemplate[] = [
  {
    id: "TMPL-CAD-01",
    name: "CAD Geometry & Layers Extractor",
    category: "CAD_EXTENSION",
    version: "1.2.0",
    author: "UrjaFlux Core Team",
    minOsVersion: "v3.0.0",
    lifecycleHooks: ["onLoad", "onCadFileParsed", "onWallVectorExport", "onUnload"],
    requiredPermissions: ["cad:read", "cad:write"]
  },
  {
    id: "TMPL-TWIN-02",
    name: "Digital Twin Real-Time Sensor Gauge",
    category: "TWIN_WIDGET",
    version: "2.0.1",
    author: "UrjaFlux Core Team",
    minOsVersion: "v3.0.0",
    lifecycleHooks: ["onMount", "onTelemetryDataReceived", "onThresholdExceeded"],
    requiredPermissions: ["iot:read", "twin:sync"]
  },
  {
    id: "TMPL-WORKFLOW-03",
    name: "Custom Vastu Audit Pipeline Node",
    category: "WORKFLOW_NODE",
    version: "1.0.0",
    author: "Community Marketplace",
    minOsVersion: "v3.0.0",
    lifecycleHooks: ["onNodeTriggered", "onAiAgentResponse", "onAuditResultPass"],
    requiredPermissions: ["vastu:audit", "ai:execute"]
  }
];

export const INITIAL_REGISTERED_PACKAGES: RegisteredPackage[] = [
  {
    id: "PKG-001",
    packageName: "@urjaflux/plugin-autocad-sync",
    packageType: "PLUGIN",
    version: "2.1.0",
    authorPublisher: "Aether Spatial Solutions",
    signatureVerified: true,
    dependencies: ["@urjaflux/sdk-ts@^3.2.0", "three@^0.160.0"],
    downloadCount: 14200,
    createdAt: "2026-02-10",
    status: "PUBLISHED"
  },
  {
    id: "PKG-002",
    packageName: "@urjaflux/knowledge-vastu-master-pack",
    packageType: "KNOWLEDGE_PACK",
    version: "1.0.0",
    authorPublisher: "UrjaFlux Knowledge Institute",
    signatureVerified: true,
    dependencies: [],
    downloadCount: 38900,
    createdAt: "2026-03-22",
    status: "PUBLISHED"
  },
  {
    id: "PKG-003",
    packageName: "@urjaflux/workflow-solar-roof-estimator",
    packageType: "WORKFLOW_TEMPLATE",
    version: "1.4.2",
    authorPublisher: "SolarTech System Integrators",
    signatureVerified: true,
    dependencies: ["@urjaflux/sdk-python@^3.1.4"],
    downloadCount: 8200,
    createdAt: "2026-05-18",
    status: "PUBLISHED"
  }
];

export const INITIAL_MARKETPLACE_SUBMISSIONS: MarketplaceSubmission[] = [
  {
    id: "SUB-001",
    packageName: "@urjaflux/plugin-autocad-sync",
    version: "2.1.0",
    publisherName: "Aether Spatial Solutions",
    submissionDate: "2026-07-20",
    validationStatus: "PASSED",
    securityScanResult: {
      vulnerabilitiesFound: 0,
      requiresExternalScanner: true,
      scannerToolName: "Snyk / SonarQube Enterprise Engine",
      details: "Scan completed by Snyk SAST runner. Zero critical vulnerabilities detected."
    },
    approvalState: "APPROVED",
    releaseChannel: "STABLE"
  },
  {
    id: "SUB-002",
    packageName: "@urjaflux/plugin-revit-bim-connector",
    version: "1.0.0-beta",
    publisherName: "BIM Dynamics Inc.",
    submissionDate: "2026-07-26",
    validationStatus: "SECURITY_SCANNING",
    securityScanResult: {
      vulnerabilitiesFound: 1,
      requiresExternalScanner: true,
      scannerToolName: "Veracode Static Analysis Engine",
      details: "Scan in progress via external CI runner pipeline."
    },
    approvalState: "PENDING_APPROVAL",
    releaseChannel: "BETA"
  }
];

export const CICD_TEMPLATES: CicdTemplate[] = [
  {
    provider: "GITHUB_ACTIONS",
    fileName: ".github/workflows/urjaflux-plugin-ci.yml",
    requiresExternalRunner: true,
    description: "Automated GitHub Actions workflow for building, testing, linting, and publishing UrjaFlux plugins.",
    yamlContent: `name: UrjaFlux Plugin CI/CD Pipeline

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Dependencies
        run: npm ci
      - name: Validate Plugin Manifest
        run: npx urjaflux project validate
      - name: Run Plugin Tests
        run: npm test
      - name: Build Production Bundle
        run: npm run build
      - name: Publish to UrjaFlux Registry
        if: github.ref == 'refs/heads/main'
        env:
          URJAFLUX_API_TOKEN: \${{ secrets.URJAFLUX_PUBLISH_TOKEN }}
        run: npx urjaflux deploy --channel stable`
  },
  {
    provider: "GITLAB_CI",
    fileName: ".gitlab-ci.yml",
    requiresExternalRunner: true,
    description: "GitLab CI stage definition for manifest verification, static security scanning, and registry artifact push.",
    yamlContent: `stages:
  - test
  - security
  - publish

manifest_check:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npx urjaflux project validate

security_snyk_scan:
  stage: security
  image: snyk/snyk-cli:npm
  script:
    - snyk test --severity-threshold=high

publish_package:
  stage: publish
  only:
    - tags
  script:
    - npx urjaflux deploy --channel production`
  }
];

export const INITIAL_DEVELOPER_METRICS: DeveloperAnalyticsMetrics = {
  totalRegisteredDevs: 1240,
  totalActiveApps: 382,
  totalMonthlyApiRequests: 4850000,
  totalSdkDownloads: 123500,
  marketplacePackagesCount: 48,
  avgApiLatencyMs: 24,
  apiErrorRatePercentage: 0.04
};

// API Sandbox Mock Execution Helper
export function executeApiSandboxCall(req: ApiSandboxRequest): ApiSandboxResponse {
  const startTime = Date.now();
  let responseData: any = {};
  let statusCode = 200;

  if (req.endpoint.includes("/cad/layers")) {
    responseData = {
      status: "success",
      totalLayers: 14,
      layers: ["WALL_OUTER", "WALL_INNER", "PILLARS", "ELECTRICAL_GRID", "PLUMBING_RISERS"],
      cadFormat: "DWG_2026",
      spatialGridReference: "VASTU_NORTH_EAST_GRID"
    };
  } else if (req.endpoint.includes("/twin/telemetry")) {
    responseData = {
      status: "success",
      zoneId: req.queryParams.zoneId || "ZONE-NE-01",
      temperatureCelsius: 22.4,
      humidityPercentage: 45.2,
      magneticGridMicroTesla: 42.1,
      actuatorState: "OPTIMAL",
      lastUpdated: new Date().toISOString()
    };
  } else if (req.endpoint.includes("/ai/vastu-audit")) {
    responseData = {
      status: "success",
      complianceScore: 94,
      directionAnalysis: {
        northEast: "Northeast water element clear of obstruction",
        southWest: "Heavy load placed in Southwest quadrant (Compliant)"
      },
      recommendedActions: ["Maintain clear airflow in East quadrant"],
      timestamp: new Date().toISOString()
    };
  } else {
    responseData = {
      status: "success",
      message: `Executed API request on endpoint: ${req.endpoint}`,
      method: req.method,
      receivedHeaders: req.headers,
      timestamp: new Date().toISOString()
    };
  }

  return {
    statusCode,
    statusText: "OK",
    latencyMs: Date.now() - startTime + 18,
    rateLimitRemaining: 9942,
    rateLimitResetSec: 3600,
    responseHeaders: {
      "content-type": "application/json; charset=utf-8",
      "x-urjaflux-trace-id": `trc_${Math.floor(100000 + Math.random() * 900000)}`,
      "x-ratelimit-limit": "10000"
    },
    bodyData: responseData
  };
}
