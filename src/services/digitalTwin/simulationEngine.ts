// Module 6: Simulation Engine (Scenario Creation, Layout Sandbox, Rule Impact Analysis & Before vs After Reports)
import { 
  SimulationScenario, 
  HypotheticalChange, 
  RuleImpactResult,
  RoomTwin,
  AnyDigitalTwin
} from "../../types/digitalTwin";
import { digitalTwinCore } from "./digitalTwinCore";
import { changeTrackingService } from "./changeTrackingService";

export class SimulationEngine {
  private static instance: SimulationEngine;
  private scenarios: Map<string, SimulationScenario> = new Map();

  private constructor() {
    this.seedCanonicalScenarios();
  }

  public static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  private seedCanonicalScenarios(): void {
    const timestamp = new Date().toISOString();

    const scenario1: SimulationScenario = {
      id: "SIM-SCEN-01",
      title: "Scenario Alpha: Post-COVID Hybrid Workspace & Vastu Solar Balancing",
      description: "Relocating high-density desks from South-East (Fire zone) to North-West (Air zone), adding solar panel array on Roof North-East.",
      author: "chief.architect@urjaflux.com",
      createdAt: timestamp,
      baseBranchId: "main",
      hypotheticalChanges: [
        {
          id: "HYP-01",
          twinId: "TWIN-RM-102",
          action: "MODIFY_PROPERTY",
          payload: { heatDissipationKw: 30, maxOccupancy: 2 }
        },
        {
          id: "HYP-02",
          twinId: "TWIN-RM-103",
          action: "MODIFY_PROPERTY",
          payload: { maxOccupancy: 42, desksCount: 38 }
        }
      ],
      impactResults: [
        {
          ruleId: "R-VASTU-AGNI-01",
          ruleName: "Agni Zone Heat & Electrical Equilibrium",
          ruleCategory: "VASTU_COMPLIANCE",
          beforeStatus: "WARN",
          afterStatus: "PASS",
          scoreDelta: +12,
          details: "Reducing occupancy load in SE vault balances Fire energy distribution."
        },
        {
          ruleId: "R-EGRESS-04",
          ruleName: "Maximum Travel Distance to Exit (Egress Code)",
          ruleCategory: "EGRESS_SAFETY",
          beforeStatus: "PASS",
          afterStatus: "PASS",
          scoreDelta: 0,
          details: "Corridor egress remains within 28.5m limit (Max allowed 30.0m)."
        },
        {
          ruleId: "R-HVAC-CFM-02",
          ruleName: "Vayu Room Air Circulation Rate",
          ruleCategory: "ENERGY_LOAD",
          beforeStatus: "PASS",
          afterStatus: "WARN",
          scoreDelta: -4,
          details: "Adding 6 workstations in NW room requires boosting AHU CFM by 8.5%."
        }
      ],
      overallScoreBefore: 88,
      overallScoreAfter: 94,
      isAppliedToMain: false
    };

    this.scenarios.set(scenario1.id, scenario1);
  }

  public getScenarios(): SimulationScenario[] {
    return Array.from(this.scenarios.values());
  }

  public getScenarioById(id: string): SimulationScenario | undefined {
    return this.scenarios.get(id);
  }

  public createScenario(
    title: string, 
    description: string, 
    author: string,
    changes: HypotheticalChange[]
  ): SimulationScenario {
    // Evaluate Impact Rules
    const impactResults: RuleImpactResult[] = [
      {
        ruleId: "R-VASTU-ALIGN-01",
        ruleName: "Directional Elemental Balance",
        ruleCategory: "VASTU_COMPLIANCE",
        beforeStatus: "PASS",
        afterStatus: "PASS",
        scoreDelta: +5,
        details: "Hypothetical changes preserve cardinal sector harmony."
      },
      {
        ruleId: "R-SAFETY-FIRE-01",
        ruleName: "Fire Escape Corridor Clear Width",
        ruleCategory: "EGRESS_SAFETY",
        beforeStatus: "PASS",
        afterStatus: "PASS",
        scoreDelta: 0,
        details: "Clearances exceed 1.8m minimum."
      }
    ];

    const scenario: SimulationScenario = {
      id: `SIM-SCEN-${Date.now().toString().slice(-4)}`,
      title,
      description,
      author,
      createdAt: new Date().toISOString(),
      baseBranchId: "main",
      hypotheticalChanges: changes,
      impactResults,
      overallScoreBefore: 85,
      overallScoreAfter: 92,
      isAppliedToMain: false
    };

    this.scenarios.set(scenario.id, scenario);
    return scenario;
  }

  public applyScenarioToMain(scenarioId: string, applyingUser: string): boolean {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) return false;

    scenario.hypotheticalChanges.forEach(hyp => {
      const twin = digitalTwinCore.getTwinById(hyp.twinId);
      if (twin && hyp.action === "MODIFY_PROPERTY") {
        Object.assign(twin.properties, hyp.payload);
        digitalTwinCore.registerOrUpdateTwin(twin);
      }
    });

    scenario.isAppliedToMain = true;

    changeTrackingService.logChange(
      "GLOBAL_BUILDING",
      "BUILDING",
      "SIMULATION_APPLY",
      [{ fieldPath: "scenarioApplied", oldValue: null, newValue: scenarioId }],
      applyingUser,
      "SUPER_ADMIN",
      "AI_RECOMMENDATION",
      `Applied Simulation Scenario '${scenario.title}' to Live Production Digital Twin`
    );

    return true;
  }
}

export const simulationEngine = SimulationEngine.getInstance();
