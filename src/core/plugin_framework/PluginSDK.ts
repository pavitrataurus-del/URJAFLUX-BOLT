import { PluginPermission } from "./types";
import { PluginSandbox } from "./PluginSandbox";
import { PluginRegistry } from "./PluginRegistry";

// Phase 2 - Plugin SDK interfaces
export interface IUIExtension {
  componentId: string;
  targetContainerId: string;
  render: (props: any) => string; // Returns HTML string or markup representation
}

export interface ICommand {
  commandId: string;
  displayName: string;
  execute: (context: Record<string, any>) => any;
}

export interface IMenuContribution {
  menuId: string;
  label: string;
  icon: string;
  actionId: string;
}

export interface IToolbarItem {
  id: string;
  tooltip: string;
  icon: string;
  commandId: string;
}

export interface IReportTemplate {
  templateId: string;
  name: string;
  formatData: (rawData: any) => string;
}

export interface IDashboardWidget {
  widgetId: string;
  title: string;
  renderWidget: (metrics: any) => any;
}

export interface IWorkflowActivity {
  activityId: string;
  run: (inputs: Record<string, any>) => Promise<Record<string, any>>;
}

export interface IAIExtension {
  providerId: string;
  processPrompt: (prompt: string, context: any) => Promise<string>;
}

export interface IAnalyticsExtension {
  calculatorId: string;
  computeMetrics: (dataset: any[]) => Record<string, number>;
}

export interface ISpatialExtension {
  remedyId: string;
  calculateSpatialRemedy: (floorPlanData: any) => any;
}

export interface IVisionExtension {
  pipelineId: string;
  processFrame: (imageBuffer: ArrayBuffer) => any;
}

/**
 * Enterprise Plugin SDK Proxy
 * Any plugin interacting with URJAFLUX AI OS MUST use this class.
 * It prevents direct access to core internal domain models and acts as a security guard.
 */
export class PluginSDK {
  private static instance: PluginSDK | null = null;

  private registeredCommands: Map<string, ICommand> = new Map();
  private registeredWidgets: Map<string, IDashboardWidget> = new Map();
  private registeredActivities: Map<string, IWorkflowActivity> = new Map();

  private constructor() {}

  public static getInstance(): PluginSDK {
    if (!PluginSDK.instance) {
      PluginSDK.instance = new PluginSDK();
    }
    return PluginSDK.instance;
  }

  /**
   * Securely execute a query against core astrology/vastu knowledge bases (Public API).
   */
  public queryPublicLibrary(pluginId: string, queryType: "VASTU" | "CHAKRA" | "PLANETARY", parameters: any): any {
    // 1. Sandbox permission gate check
    const sandbox = PluginSandbox.getInstance();
    const sandboxResult = sandbox.executeTask(
      pluginId,
      `queryPublicLibrary:${queryType}`,
      parameters,
      [PluginPermission.CORE_API_READ]
    );

    if (!sandboxResult.success) {
      throw new Error(`SDK Exception: Access Denied. ${sandboxResult.error}`);
    }

    // 2. Perform safe data lookup (No direct internal objects)
    if (queryType === "VASTU") {
      return {
        direction: parameters.direction || "North-East",
        primaryElement: "Water",
        governingPlanet: "Jupiter",
        allowableRemedies: ["Water fountain", "Brass pyramid", "Light colors"],
        disallowedRemedies: ["Heavy brick walls", "Kitchen stoves", "Toilets"]
      };
    }

    if (queryType === "CHAKRA") {
      return {
        chakra: parameters.chakraName || "Anahata",
        vibrationFrequency: "528 Hz",
        associatedColor: "Green",
        remedialStones: ["Emerald", "Malachite", "Green Jade"]
      };
    }

    return {
      planet: parameters.planetName || "Saturn",
      housePosition: parameters.house || 4,
      influence: "Sleeping energy, delays domestic decisions",
      friendlyPlanets: ["Mercury", "Venus"],
      adversaryPlanets: ["Sun", "Moon", "Mars"]
    };
  }

  /**
   * Safe registration channel for Custom Menu items (Public API).
   */
  public registerCommand(pluginId: string, command: ICommand) {
    const sandbox = PluginSandbox.getInstance();
    const check = sandbox.executeTask(pluginId, "registerCommand", { commandId: command.commandId }, [PluginPermission.UI_INJECT]);
    if (!check.success) {
      throw new Error(`SDK Command Registration Blocked: ${check.error}`);
    }

    this.registeredCommands.set(command.commandId, command);
    PluginRegistry.getInstance().logAudit({
      pluginId,
      userId: "plugin-sdk",
      action: "API_EXECUTION",
      severity: "INFO",
      details: `Successfully bound command ID '${command.commandId}' to extension context.`,
      status: "SUCCESS"
    });
  }

  /**
   * Securely write dynamic data to the project audit trail without exposing local filesystem elements (Public API).
   */
  public logPluginEvent(pluginId: string, message: string, severity: "INFO" | "WARNING" | "CRITICAL" = "INFO") {
    PluginRegistry.getInstance().logAudit({
      pluginId,
      userId: "plugin-code",
      action: "API_EXECUTION",
      severity,
      details: `[SDK LOG] ${message}`,
      status: "SUCCESS"
    });
  }

  public getCommands(): ICommand[] {
    return Array.from(this.registeredCommands.values());
  }
}
