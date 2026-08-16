// Module 10: Marketplace Foundation Engine
import { MarketplaceItem } from "../../types/integrationPlatform";
import { PluginSdkRuntimeEngine } from "./PluginSdkRuntimeEngine";

export class MarketplaceEngineStore {
  private items: Map<string, MarketplaceItem> = new Map();

  constructor() {
    this.seedMarketplace();
  }

  private seedMarketplace(): void {
    const defaultItems: MarketplaceItem[] = [
      {
        id: "MKT-PLG-001",
        type: "PLUGIN",
        title: "Solar PV Roof Vastu Alignment Plugin",
        publisher: "URJAFLUX Engineering",
        isVerifiedPublisher: true,
        version: "1.4.0",
        description: "Calculates solar panel load vectors and cardinal alignment relative to Brahmasthan clearance rules.",
        category: "Energy & Vastu",
        rating: 4.9,
        reviewsCount: 38,
        downloadsCount: 1420,
        compatibilityMinOsVersion: "2.0.0",
        reviews: [
          { id: "REV-1", authorName: "Principal Architect S. Sharma", rating: 5, comment: "Essential for corporate tech park solar roof designs.", createdAt: new Date(Date.now() - 86400000 * 10).toISOString() }
        ],
        manifestOrData: {
          id: "com.urjaflux.solar-pv-vastu",
          name: "Solar PV Roof Vastu Alignment Plugin",
          version: "1.4.0",
          publisher: "URJAFLUX Engineering",
          entryPoint: "index.js",
          minOsVersion: "2.0.0",
          permissions: ["READ_PROJECTS", "EXECUTE_VASTU_RULES", "ACCESS_STORAGE"],
          extensionPoints: [],
          sandboxConfig: { memoryLimitMb: 128, cpuQuotaPercent: 20, timeoutMs: 5000, allowNetworkAccess: false },
          signedChecksum: "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      },
      {
        id: "MKT-KPK-002",
        type: "KNOWLEDGE_PACK",
        title: "Mayamatam Classical Master Rulebook",
        publisher: "Heritage Vastu Council",
        isVerifiedPublisher: true,
        version: "2.0.0",
        description: "Complete canonical rulepack containing 400+ indexed formulas for Ayadi Aya/Vyaya and cardinal orientations.",
        category: "Classical Vastu",
        rating: 5.0,
        reviewsCount: 92,
        downloadsCount: 3890,
        compatibilityMinOsVersion: "2.0.0",
        reviews: [
          { id: "REV-2", authorName: "Vastu Master R. K. Varma", rating: 5, comment: "Zero hallucination verified canonical source.", createdAt: new Date(Date.now() - 86400000 * 15).toISOString() }
        ],
        manifestOrData: { packId: "MAYAMATAM-MASTER-2026", category: "Classical Vastu" }
      },
      {
        id: "MKT-WFT-003",
        type: "WORKFLOW_TEMPLATE",
        title: "Enterprise Incident Bridge to Slack & Teams",
        publisher: "Automation Studio",
        isVerifiedPublisher: true,
        version: "1.1.0",
        description: "Automated low-code workflow template connecting CAD defects directly to Slack and Microsoft Teams.",
        category: "Workflow Automation",
        rating: 4.8,
        reviewsCount: 24,
        downloadsCount: 890,
        compatibilityMinOsVersion: "2.0.0",
        reviews: [],
        manifestOrData: { templateId: "WF-INCIDENT-SLACK-TEAMS" }
      }
    ];

    defaultItems.forEach(i => this.items.set(i.id, i));
  }

  public installMarketplaceItem(itemId: string): { success: boolean; message: string } {
    const item = this.items.get(itemId);
    if (!item) {
      return { success: false, message: "Marketplace item not found." };
    }

    if (item.type === "PLUGIN") {
      const manifest = item.manifestOrData as any;
      return PluginSdkRuntimeEngine.installPlugin(manifest);
    }

    item.downloadsCount += 1;
    return { success: true, message: `Successfully installed ${item.type.toLowerCase().replace("_", " ")}: ${item.title}` };
  }

  public getMarketplaceItems(category?: string): MarketplaceItem[] {
    const list = Array.from(this.items.values());
    if (!category || category === "ALL") return list;
    return list.filter(i => i.category === category);
  }
}

export const MarketplaceEngine = new MarketplaceEngineStore();
