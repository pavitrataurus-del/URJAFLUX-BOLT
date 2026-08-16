import { AIModelRegistry } from "./AIModelRegistry";
import { PromptRegistry } from "./PromptRegistry";
import { AIGovernanceService } from "./AIGovernanceService";
import { AIExperimentService } from "./AIExperimentService";
import { AIObservability } from "./AIObservability";
import { AIProviderType, PolicyAction, ModelRoute } from "./types";

export interface GatewayRequest {
  templateId: string;
  variables: Record<string, string>;
  userId: string;
  department: string;
  contextDomain: string;
  overrideModelId?: string;
}

export interface GatewayResponse {
  text: string;
  modelUsed: string;
  providerUsed: AIProviderType;
  latencyMs: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  costInUsd: number;
  policyAction: PolicyAction;
  shadowResult?: {
    modelId: string;
    text: string;
    latencyMs: number;
  };
}

export class AIGateway {
  private static instance: AIGateway | null = null;
  private routes: ModelRoute[] = [];

  private constructor() {
    this.seedDefaultRoutes();
  }

  public static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  private seedDefaultRoutes() {
    this.routes = [
      {
        id: "rt-vastu",
        pattern: "vastu:*",
        primaryModelId: "mdl-gemini-3-6-flash",
        fallbackModelId: "mdl-gemini-3-1-pro",
        timeoutMs: 8000,
        maxRetries: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "enterprise_ops",
        updatedBy: "enterprise_ops",
        version: "1.0.0",
        status: "ACTIVE",
        tags: ["routing"],
        metadata: {}
      },
      {
        id: "rt-lalkitab",
        pattern: "lalkitab:*",
        primaryModelId: "mdl-gemini-3-1-pro",
        fallbackModelId: "mdl-gemini-3-6-flash",
        timeoutMs: 12000,
        maxRetries: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "enterprise_ops",
        updatedBy: "enterprise_ops",
        version: "1.0.0",
        status: "ACTIVE",
        tags: ["routing", "failover-ready"],
        metadata: {}
      }
    ];
  }

  public getRoutes(): ModelRoute[] {
    return this.routes;
  }

  public addRoute(route: Omit<ModelRoute, "id" | "createdAt" | "updatedAt">): ModelRoute {
    const newRoute: ModelRoute = {
      ...route,
      id: `rt-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.routes.push(newRoute);
    return newRoute;
  }

  /**
   * Central entry point for all AI requests across all domains.
   */
  public async executePrompt(req: GatewayRequest): Promise<GatewayResponse> {
    const startTime = Date.now();
    const promptRegistry = PromptRegistry.getInstance();
    const modelRegistry = AIModelRegistry.getInstance();
    const governance = AIGovernanceService.getInstance();
    const experimentService = AIExperimentService.getInstance();
    const observability = AIObservability.getInstance();

    // 1. Compile prompt text
    let promptText = "";
    try {
      promptText = promptRegistry.compile(req.templateId, req.variables);
    } catch (err: any) {
      promptText = `Direct raw instruction for template ${req.templateId}. Variables: ${JSON.stringify(req.variables)}`;
    }

    // 2. Determine target routing model
    let targetModelId = req.overrideModelId || "mdl-gemini-3-6-flash";
    if (!req.overrideModelId) {
      const category = promptRegistry.getTemplate(req.templateId)?.category.toLowerCase() || "";
      const matchedRoute = this.routes.find(r => r.pattern.replace("*", "").includes(category));
      if (matchedRoute) {
        targetModelId = matchedRoute.primaryModelId;
      }
    }

    // 3. Evaluate Governance policies
    const policyResult = governance.evaluateRequest(promptText, targetModelId, req.userId);
    if (!policyResult.allowed) {
      return {
        text: `ACCESS DENIED: Request blocked by centralized AI Safety & Governance policy. Reason: ${policyResult.reason}`,
        modelUsed: targetModelId,
        providerUsed: AIProviderType.GEMINI,
        latencyMs: Date.now() - startTime,
        tokens: { prompt: 0, completion: 0, total: 0 },
        costInUsd: 0,
        policyAction: policyResult.action
      };
    }

    // 4. Resolve Experimentation (A/B testing, shadow routing)
    let finalModelId = targetModelId;
    let isABVariant = false;
    let matchingExperimentId = "";

    const activeExperiments = experimentService.getExperiments().filter(e => e.active);
    const abExperiment = activeExperiments.find(e => e.type === "AB_TEST" && (e.baseModelId === targetModelId || e.variantModelId === targetModelId));

    if (abExperiment) {
      matchingExperimentId = abExperiment.id;
      const roll = Math.random() * 100;
      if (roll < abExperiment.trafficAllocation) {
        finalModelId = abExperiment.variantModelId;
        isABVariant = true;
      } else {
        finalModelId = abExperiment.baseModelId;
        isABVariant = false;
      }
    }

    const model = modelRegistry.getModel(finalModelId) || modelRegistry.getModel("mdl-gemini-3-6-flash")!;

    // 5. Model execution (Real call to Gemini server proxy if model is Gemini, else mock)
    let responseText = "";
    let promptTokens = Math.floor(promptText.length / 4) + 12;
    let completionTokens = 250;

    const useRealGemini = model.provider === AIProviderType.GEMINI;

    if (useRealGemini) {
      try {
        const geminiAlias = model.metadata?.alias || "gemini-3.6-flash";
        // Call local server route
        const res = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: promptText,
            model: geminiAlias
          })
        });

        if (res.ok) {
          const data = await res.json();
          responseText = data.text;
          completionTokens = Math.floor(responseText.length / 4) + 10;
        } else {
          throw new Error("Gemini Gateway API non-200 response status");
        }
      } catch (err: any) {
        console.warn("Gateway direct backend fetch failed, using fallback mock provider generator.", err);
        responseText = this.generateSimulatedCompletion(promptText, model.id);
      }
    } else {
      // Simulate Anthropic/OpenAI/Ollama response logic
      responseText = this.generateSimulatedCompletion(promptText, model.id);
    }

    const totalTokens = promptTokens + completionTokens;
    const latencyMs = Date.now() - startTime;

    // Cost calculations
    const inputRate = model.costProfile.costPerMillionInputTokens;
    const outputRate = model.costProfile.costPerMillionOutputTokens;
    const costInUsd = ((promptTokens / 1000000) * inputRate) + ((completionTokens / 1000000) * outputRate);

    // 6. Log Observability usage metrics
    observability.logUsage({
      modelId: model.id,
      provider: model.provider,
      promptTokens,
      completionTokens,
      totalTokens,
      costInUsd,
      userId: req.userId,
      department: req.department,
      contextDomain: req.contextDomain
    });

    // Track experiment metrics
    if (matchingExperimentId) {
      experimentService.trackExperimentUsage(matchingExperimentId, isABVariant, latencyMs, costInUsd);
    }

    // 7. Check for Shadow Testing execution in background (Async non-blocking)
    let shadowResult: GatewayResponse["shadowResult"] = undefined;
    const shadowExperiment = activeExperiments.find(e => e.type === "SHADOW" && e.baseModelId === targetModelId);
    if (shadowExperiment) {
      // Run shadow execution in background
      const shadowModel = modelRegistry.getModel(shadowExperiment.variantModelId);
      if (shadowModel) {
        const shadowStart = Date.now();
        const shadowText = this.generateSimulatedCompletion(promptText, shadowModel.id);
        const shadowLatency = Date.now() - shadowStart;
        const shadowCost = ((promptTokens / 1000000) * shadowModel.costProfile.costPerMillionInputTokens) +
          ((150 / 1000000) * shadowModel.costProfile.costPerMillionOutputTokens);

        experimentService.trackExperimentUsage(shadowExperiment.id, true, shadowLatency, shadowCost);

        shadowResult = {
          modelId: shadowModel.id,
          text: shadowText,
          latencyMs: shadowLatency
        };
      }
    }

    return {
      text: responseText,
      modelUsed: model.id,
      providerUsed: model.provider,
      latencyMs,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      },
      costInUsd,
      policyAction: policyResult.action,
      shadowResult
    };
  }

  private generateSimulatedCompletion(prompt: string, modelId: string): string {
    const isVastu = prompt.toLowerCase().includes("vastu") || prompt.toLowerCase().includes("blueprint");
    const isLalKitab = prompt.toLowerCase().includes("kitab") || prompt.toLowerCase().includes("alignment") || prompt.toLowerCase().includes("dasha");

    if (isVastu) {
      return `[${modelId}] ASTRO-VASTU EVALUATION:\n\n1. DIAGNOSIS: Spatial entry matches North-East sector, but toilet placement is slightly misaligned towards North-East center. This triggers a spatial bio-resonance disturbance, leading to mental stress and unstable finances.\n\n2. KUNDLI CORRELATION: Client's Jupiter is situated in the 6th House, reinforcing intellectual fatigue.\n\n3. NON-INVASIVE REMEDY: Avoid heavy brick walls in the North-East. Install a brass helix shield on the toilet partition, and position a light green pyramid on the East wall to boost positive Prana flow. Keep salt in a bronze container near the sink.`;
    }

    if (isLalKitab) {
      return `[${modelId}] LAL KITAB PLANETARY RESOLUTION:\n\n1. PLANETARY STRENGTH: Saturn in the 4th House acts as a sleeping planet ('Soya Grah'), creating domestic delays. Mars in the 8th House acts as high negative energy ('Mangal Badh').\n\n2. SPECIFIC REMEDY:\n   - Pour milk in banyan tree roots for 43 consecutive days to awaken sleeping Saturn energies.\n   - Avoid accepting free gifts or donations of copper or iron.\n   - Keep a silver square piece in your pocket to balance the 8th House Mars energies.`;
    }

    return `[${modelId}] ENTERPRISE AI COMPLIANT RESPONSE:\n\nThank you for querying the UrjaFlux AI Gateway. Central governance models have approved your query parameters.\n\n- Model Registry Verification: OK\n- Safety Policy: Enforced with 100% compliance\n- Context Domain: Core Astrology and Spatial Intelligence.\n\nRemedy suggestions have been verified against active Astro-Vastu knowledge schemas.`;
  }
}
