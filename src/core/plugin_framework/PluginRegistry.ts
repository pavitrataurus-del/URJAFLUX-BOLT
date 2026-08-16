import {
  Plugin,
  PluginStatus,
  ExtensionPoint,
  ExtensionPointType,
  Extension,
  PluginPermission,
  MarketplaceListing,
  DeveloperAccount,
  PluginAuditLog
} from "./types";

export class PluginRegistry {
  private static instance: PluginRegistry | null = null;

  private plugins: Plugin[] = [];
  private extensionPoints: ExtensionPoint[] = [];
  private extensions: Extension[] = [];
  private marketplaceListings: MarketplaceListing[] = [];
  private developerAccount: DeveloperAccount | null = null;
  private auditLogs: PluginAuditLog[] = [];

  private constructor() {
    this.seedDeveloperAccount();
    this.seedExtensionPoints();
    this.seedMarketplace();
    this.seedInstalledPlugins();
  }

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  private seedDeveloperAccount() {
    this.developerAccount = {
      id: "dev-pavitra",
      name: "Pavitra Taurus",
      email: "pavitra.taurus@gmail.com",
      company: "Taurus Cosmic Labs Ltd",
      isVerified: true,
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      publicationsCount: 2,
      apiKeys: ["uf-dev-key-928374928-taurus"]
    };
  }

  private seedExtensionPoints() {
    this.extensionPoints = [
      {
        id: "ep-dash-widget",
        type: ExtensionPointType.DASHBOARD_WIDGET,
        name: "Enterprise Custom Dashboard Widget",
        description: "Enables external plugins to mount customized React panels on the primary Analytics overview dashboard.",
        targetDomain: "DOMAIN-016",
        schemaInterface: "IDashboardWidget"
      },
      {
        id: "ep-workflow-step",
        type: ExtensionPointType.WORKFLOW_STEP,
        name: "UrjaOrchestrator Step Processor",
        description: "Injects dynamic, customized serverless activities directly into active business workflow pipelines.",
        targetDomain: "DOMAIN-013",
        schemaInterface: "IWorkflowActivity"
      },
      {
        id: "ep-consultation-tool",
        type: ExtensionPointType.CONSULTATION_TOOL,
        name: "AstroConsultation Utility",
        description: "Enables custom chat assistants, planetary widgets, or resonance triggers inside the live audio consultation portal.",
        targetDomain: "DOMAIN-009",
        schemaInterface: "IUIExtension"
      },
      {
        id: "ep-spatial-tool",
        type: ExtensionPointType.SPATIAL_TOOL,
        name: "CAD Spatial Layer Vectorizer",
        description: "Injects customized architectural zoning calculations or specific local energetic remedy algorithms into the CAD plan engine.",
        targetDomain: "DOMAIN-011",
        schemaInterface: "ISpatialExtension"
      },
      {
        id: "ep-vision-pipeline",
        type: ExtensionPointType.VISION_PIPELINE,
        name: "AuraVision Video Filter",
        description: "Custom computer vision node to inspect raw photographic or streaming video inputs for specific energetic object shapes.",
        targetDomain: "DOMAIN-012",
        schemaInterface: "IVisionExtension"
      }
    ];
  }

  private seedInstalledPlugins() {
    this.plugins = [
      {
        id: "plg-vastu-ar-viewer",
        name: "Astro-Vastu AR Blueprint Overlay",
        description: "Injects live virtual 3D energetic overlays into standard floor plan diagnostics using mobile viewport coordinates.",
        category: "Spatial Intelligence",
        publisherId: "dev-pavitra",
        latestVersion: "1.2.0",
        currentVersion: "1.2.0",
        status: PluginStatus.ACTIVE,
        isVerified: true,
        isSuspended: false,
        downloads: 840,
        rating: 4.8,
        permissions: [
          { permission: PluginPermission.UI_INJECT, granted: true },
          { permission: PluginPermission.STORAGE_READ, granted: true },
          { permission: PluginPermission.NETWORK_ACCESS, granted: false }
        ],
        manifest: {
          id: "plg-vastu-ar-viewer",
          name: "Astro-Vastu AR Blueprint Overlay",
          version: "1.2.0",
          description: "Injects live virtual 3D energetic overlays into standard floor plan diagnostics.",
          publisher: "Taurus Cosmic Labs Ltd",
          minCoreVersion: "3.5.0",
          dependencies: [],
          permissions: [PluginPermission.UI_INJECT, PluginPermission.STORAGE_READ],
          entryPoint: "dist/vastu-ar-viewer.js",
          extensionPoints: [
            {
              pointType: ExtensionPointType.SPATIAL_TOOL,
              pointId: "ep-spatial-tool",
              config: { viewportMode: "AR_RENDERER", defaultOpacity: 0.75 }
            }
          ]
        },
        digitalSignature: "SIG-sha256-4293840293a84b02e9cfd7bca8e890e03ef92",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["ar", "floorplan", "overlay"]
      },
      {
        id: "plg-chakra-sound-generator",
        name: "Bio-Resonance Solfeggio Tuner",
        description: "Custom audio synthesizer triggering pure mathematical sine waves correlated to chakra alignment frequencies.",
        category: "Wellness & Meditation",
        publisherId: "dev-external-meditate",
        latestVersion: "1.0.5",
        currentVersion: "1.0.0",
        status: PluginStatus.ACTIVE, // active, but upgradable
        isVerified: true,
        isSuspended: false,
        downloads: 310,
        rating: 4.4,
        permissions: [
          { permission: PluginPermission.UI_INJECT, granted: true },
          { permission: PluginPermission.AI_EXECUTION, granted: true }
        ],
        manifest: {
          id: "plg-chakra-sound-generator",
          name: "Bio-Resonance Solfeggio Tuner",
          version: "1.0.0",
          description: "Custom audio synthesizer triggering pure mathematical sine waves correlated to chakra alignment frequencies.",
          publisher: "Satyam Meditative Inc",
          minCoreVersion: "3.2.0",
          dependencies: [],
          permissions: [PluginPermission.UI_INJECT, PluginPermission.AI_EXECUTION],
          entryPoint: "dist/chakra-sound-generator.js",
          extensionPoints: [
            {
              pointType: ExtensionPointType.CONSULTATION_TOOL,
              pointId: "ep-consultation-tool",
              config: { baseFrequencyHz: 432, autostart: false }
            }
          ]
        },
        digitalSignature: "SIG-sha256-9123840192df830e0bc87f1ea09b2e04da8fb",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["sound", "chakra", "resonance"]
      }
    ];

    // Build active extensions index
    this.rebuildExtensionsIndex();

    // Log startup audits
    this.auditLogs = [
      {
        id: "log-sys-start-1",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        pluginId: "plg-vastu-ar-viewer",
        userId: "pavitra.taurus@gmail.com",
        action: "INSTALL",
        severity: "INFO",
        details: "Plugin 'Astro-Vastu AR Blueprint Overlay' successfully downloaded and validated signature.",
        status: "SUCCESS"
      },
      {
        id: "log-sys-start-2",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        pluginId: "plg-chakra-sound-generator",
        userId: "system",
        action: "ENABLE",
        severity: "INFO",
        details: "Enabling Solfeggio resonance sound generator extension points.",
        status: "SUCCESS"
      }
    ];
  }

  private seedMarketplace() {
    this.marketplaceListings = [
      {
        id: "mkt-lalkitab-scheduler",
        pluginId: "plg-lalkitab-scheduler",
        name: "Lal Kitab Dasha Remedy Scheduler",
        description: "Creates automated daily and weekly system scheduler reminders for critical 43-day milk planetary remedies.",
        publisherName: "AstroTech Global Ltd",
        category: "Workflow Automation",
        downloads: 1420,
        rating: 4.9,
        isVerifiedPublisher: true,
        sizeKb: 340,
        licenseType: "Commercial License",
        priceUsd: 19.99,
        versions: ["1.0.0", "1.1.0", "1.2.0"],
        reviews: [
          { user: "rishi.k@outlook.com", rating: 5, comment: "Keeps my clients tightly on track with their planetary alignments! Perfect integration.", date: "2026-07-10" }
        ]
      },
      {
        id: "mkt-numerology-charts",
        pluginId: "plg-numerology-charts",
        name: "Pythagorean Name Grid Visualizer",
        description: "Generates stunning interactive webcharts and grid reports for Pythagorean, Chaldean, and Vedic name vibrations.",
        publisherName: "Numeron Labs",
        category: "Data Visualization",
        downloads: 650,
        rating: 4.6,
        isVerifiedPublisher: false,
        sizeKb: 512,
        licenseType: "MIT Open Source",
        priceUsd: 0,
        versions: ["1.0.0"],
        reviews: [
          { user: "archana.sharma@gmail.com", rating: 4, comment: "Excellent custom grids, fits perfectly into our report exports.", date: "2026-06-28" }
        ]
      },
      {
        id: "mkt-ocr-palm",
        pluginId: "plg-ocr-palm",
        name: "Aura-Palm Vector Line Recognizer",
        description: "Integrates specialized image processing models to automatically extract primary life, head, heart, and mount lines from uploaded palm photographs.",
        publisherName: "Siddha Vision AI Inc",
        category: "Vision Intelligence",
        downloads: 2310,
        rating: 4.7,
        isVerifiedPublisher: true,
        sizeKb: 1240,
        licenseType: "Enterprise Proprietary",
        priceUsd: 149.00,
        versions: ["2.0.0", "2.1.0"],
        reviews: [
          { user: "expert.palmist@gmail.com", rating: 5, comment: "Saves hours of manually mapping client hand prints. Extremely accurate vector extraction.", date: "2026-07-15" }
        ]
      }
    ];
  }

  private rebuildExtensionsIndex() {
    this.extensions = [];
    this.plugins.forEach(p => {
      if (p.status === PluginStatus.ACTIVE) {
        p.manifest.extensionPoints.forEach(ep => {
          this.extensions.push({
            id: `ext-${p.id}-${ep.pointId}`,
            pluginId: p.id,
            extensionPointId: ep.pointId,
            name: `${p.name} -> ${ep.pointType}`,
            config: ep.config,
            status: "ACTIVE"
          });
        });
      }
    });
  }

  public getPlugins(): Plugin[] {
    return this.plugins;
  }

  public getExtensionPoints(): ExtensionPoint[] {
    return this.extensionPoints;
  }

  public getActiveExtensions(): Extension[] {
    return this.extensions;
  }

  public getMarketplaceListings(): MarketplaceListing[] {
    return this.marketplaceListings;
  }

  public getDeveloperAccount(): DeveloperAccount | null {
    return this.developerAccount;
  }

  public getAuditLogs(): PluginAuditLog[] {
    return this.auditLogs;
  }

  public logAudit(log: Omit<PluginAuditLog, "id" | "timestamp">) {
    const newLog: PluginAuditLog = {
      ...log,
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
  }

  public togglePluginStatus(id: string): boolean {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin) return false;

    if (plugin.status === PluginStatus.ACTIVE) {
      plugin.status = PluginStatus.DISABLED;
      this.logAudit({
        pluginId: id,
        userId: "pavitra.taurus@gmail.com",
        action: "DISABLE",
        severity: "WARNING",
        details: `Plugin '${plugin.name}' deactivated. Dismounting associated extension points.`,
        status: "SUCCESS"
      });
    } else {
      plugin.status = PluginStatus.ACTIVE;
      this.logAudit({
        pluginId: id,
        userId: "pavitra.taurus@gmail.com",
        action: "ENABLE",
        severity: "INFO",
        details: `Plugin '${plugin.name}' activated. Mounting all verified extension contracts.`,
        status: "SUCCESS"
      });
    }

    plugin.updatedAt = new Date().toISOString();
    this.rebuildExtensionsIndex();
    return true;
  }

  public uninstallPlugin(id: string): boolean {
    const idx = this.plugins.findIndex(p => p.id === id);
    if (idx === -1) return false;

    const name = this.plugins[idx].name;
    this.plugins.splice(idx, 1);
    this.logAudit({
      pluginId: id,
      userId: "pavitra.taurus@gmail.com",
      action: "UNINSTALL",
      severity: "WARNING",
      details: `Plugin '${name}' removed. Purged binary binaries from localized security storage.`,
      status: "SUCCESS"
    });

    this.rebuildExtensionsIndex();
    return true;
  }

  public installFromMarketplace(listingId: string): boolean {
    const listing = this.marketplaceListings.find(m => m.id === listingId);
    if (!listing) return false;

    // Check if already installed
    if (this.plugins.some(p => p.id === listing.pluginId)) {
      return false;
    }

    // Map permissions
    const defaultPermissions = [
      { permission: PluginPermission.UI_INJECT, granted: true },
      { permission: PluginPermission.CORE_API_READ, granted: true }
    ];

    const newManifest = {
      id: listing.pluginId,
      name: listing.name,
      version: "1.0.0",
      description: listing.description,
      publisher: listing.publisherName,
      minCoreVersion: "3.6.0",
      dependencies: [],
      permissions: [PluginPermission.UI_INJECT, PluginPermission.CORE_API_READ],
      entryPoint: `dist/${listing.pluginId}.js`,
      extensionPoints: [
        {
          pointType: ExtensionPointType.DASHBOARD_WIDGET,
          pointId: "ep-dash-widget",
          config: { autoRefresh: true }
        }
      ]
    };

    const newPlugin: Plugin = {
      id: listing.pluginId,
      name: listing.name,
      description: listing.description,
      category: listing.category,
      publisherId: "dev-marketplace-publisher",
      latestVersion: "1.0.0",
      currentVersion: "1.0.0",
      status: PluginStatus.ACTIVE,
      isVerified: listing.isVerifiedPublisher,
      isSuspended: false,
      downloads: listing.downloads + 1,
      rating: listing.rating,
      permissions: defaultPermissions,
      manifest: newManifest,
      digitalSignature: `SIG-sha256-marketplace-${Math.random().toString(36).substr(2, 12)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [listing.category.toLowerCase().replace(" ", "-")]
    };

    this.plugins.push(newPlugin);
    this.logAudit({
      pluginId: listing.pluginId,
      userId: "pavitra.taurus@gmail.com",
      action: "INSTALL",
      severity: "INFO",
      details: `Marketplace purchase & package signature verified for '${listing.name}'. Successfully loaded in active sandbox.`,
      status: "SUCCESS"
    });

    this.rebuildExtensionsIndex();
    return true;
  }

  public updatePlugin(id: string): boolean {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin) return false;

    plugin.currentVersion = plugin.latestVersion;
    plugin.updatedAt = new Date().toISOString();
    this.logAudit({
      pluginId: id,
      userId: "pavitra.taurus@gmail.com",
      action: "UPDATE",
      severity: "INFO",
      details: `Hot-updated plugin '${plugin.name}' to latest verified package v${plugin.currentVersion}.`,
      status: "SUCCESS"
    });

    this.rebuildExtensionsIndex();
    return true;
  }

  public rollbackPlugin(id: string): boolean {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin) return false;

    plugin.currentVersion = "1.0.0";
    plugin.updatedAt = new Date().toISOString();
    this.logAudit({
      pluginId: id,
      userId: "pavitra.taurus@gmail.com",
      action: "UPDATE",
      severity: "WARNING",
      details: `Admin requested a roll-back on plugin '${plugin.name}'. Resetting to previous version 1.0.0.`,
      status: "SUCCESS"
    });

    this.rebuildExtensionsIndex();
    return true;
  }

  public suspendPlugin(id: string): boolean {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin) return false;

    plugin.isSuspended = !plugin.isSuspended;
    plugin.status = plugin.isSuspended ? PluginStatus.SUSPENDED : PluginStatus.ACTIVE;
    plugin.updatedAt = new Date().toISOString();

    this.logAudit({
      pluginId: id,
      userId: "admin",
      action: plugin.isSuspended ? "DISABLE" : "ENABLE",
      severity: "CRITICAL",
      details: plugin.isSuspended
        ? `Plugin '${plugin.name}' administratively suspended due to sandbox execution warnings.`
        : `Administrative suspension lifted on plugin '${plugin.name}'.`,
      status: "SUCCESS"
    });

    this.rebuildExtensionsIndex();
    return true;
  }
}
