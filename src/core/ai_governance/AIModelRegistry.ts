import { AIModel, ModelVersion, AIProviderType, ModelStatus } from "./types";

export class AIModelRegistry {
  private static instance: AIModelRegistry | null = null;
  private models = new Map<string, AIModel>();
  private versions = new Map<string, ModelVersion[]>();

  private constructor() {
    this.seedDefaultModels();
  }

  public static getInstance(): AIModelRegistry {
    if (!AIModelRegistry.instance) {
      AIModelRegistry.instance = new AIModelRegistry();
    }
    return AIModelRegistry.instance;
  }

  private seedDefaultModels() {
    // 1. Google Gemini 3.6 Flash
    const geminiFlash: AIModel = {
      id: "mdl-gemini-3-6-flash",
      name: "Google Gemini 3.6 Flash",
      provider: AIProviderType.GEMINI,
      endpointUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash",
      capabilities: {
        text: true,
        image: true,
        audio: true,
        video: true,
        functionCalling: true,
        structuredOutput: true,
        maxContextTokens: 1048576
      },
      performanceProfile: {
        latencyMs: 180,
        accuracyScore: 84.5,
        avgThroughput: 95
      },
      costProfile: {
        costPerMillionInputTokens: 0.075,
        costPerMillionOutputTokens: 0.30
      },
      availabilityStatus: "ONLINE",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "enterprise_ops",
      updatedBy: "enterprise_ops",
      version: "1.0.0",
      status: ModelStatus.ACTIVE,
      tags: ["low-latency", "multimodal", "recommended"],
      metadata: { alias: "gemini-3.6-flash" }
    };

    // 2. Google Gemini 3.1 Pro Preview
    const geminiPro: AIModel = {
      id: "mdl-gemini-3-1-pro",
      name: "Google Gemini 3.1 Pro Preview",
      provider: AIProviderType.GEMINI,
      endpointUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview",
      capabilities: {
        text: true,
        image: true,
        audio: true,
        video: true,
        functionCalling: true,
        structuredOutput: true,
        maxContextTokens: 2097152
      },
      performanceProfile: {
        latencyMs: 420,
        accuracyScore: 92.1,
        avgThroughput: 40
      },
      costProfile: {
        costPerMillionInputTokens: 1.25,
        costPerMillionOutputTokens: 5.00
      },
      availabilityStatus: "ONLINE",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "enterprise_ops",
      updatedBy: "enterprise_ops",
      version: "1.0.0",
      status: ModelStatus.ACTIVE,
      tags: ["high-reasoning", "complex-coding", "paid-tier"],
      metadata: { alias: "gemini-3.1-pro-preview" }
    };

    // 3. Claude 3.5 Sonnet (Anthropic)
    const claudeSonnet: AIModel = {
      id: "mdl-claude-3-5-sonnet",
      name: "Anthropic Claude 3.5 Sonnet",
      provider: AIProviderType.ANTHROPIC,
      endpointUrl: "https://api.anthropic.com/v1/messages",
      capabilities: {
        text: true,
        image: true,
        audio: false,
        video: false,
        functionCalling: true,
        structuredOutput: true,
        maxContextTokens: 200000
      },
      performanceProfile: {
        latencyMs: 380,
        accuracyScore: 91.8,
        avgThroughput: 65
      },
      costProfile: {
        costPerMillionInputTokens: 3.00,
        costPerMillionOutputTokens: 15.00
      },
      availabilityStatus: "ONLINE",
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "enterprise_ops",
      updatedBy: "enterprise_ops",
      version: "2.0.0",
      status: ModelStatus.ACTIVE,
      tags: ["reasoning", "structured"],
      metadata: { alias: "claude-3-5-sonnet" }
    };

    // 4. OpenAI GPT-4o
    const gpt4o: AIModel = {
      id: "mdl-gpt-4o",
      name: "OpenAI GPT-4o",
      provider: AIProviderType.OPENAI,
      endpointUrl: "https://api.openai.com/v1/chat/completions",
      capabilities: {
        text: true,
        image: true,
        audio: false,
        video: false,
        functionCalling: true,
        structuredOutput: true,
        maxContextTokens: 128000
      },
      performanceProfile: {
        latencyMs: 340,
        accuracyScore: 89.9,
        avgThroughput: 75
      },
      costProfile: {
        costPerMillionInputTokens: 5.00,
        costPerMillionOutputTokens: 15.00
      },
      availabilityStatus: "ONLINE",
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "enterprise_ops",
      updatedBy: "enterprise_ops",
      version: "1.0.0",
      status: ModelStatus.ACTIVE,
      tags: ["balanced", "popular"],
      metadata: { alias: "gpt-4o" }
    };

    // 5. Ollama Llama 3 (Local/Self-hosted)
    const llamaLocal: AIModel = {
      id: "mdl-local-llama3",
      name: "Ollama Llama 3 (Local Secure)",
      provider: AIProviderType.OLLAMA,
      endpointUrl: "http://localhost:11434/api/generate",
      capabilities: {
        text: true,
        image: false,
        audio: false,
        video: false,
        functionCalling: false,
        structuredOutput: false,
        maxContextTokens: 8192
      },
      performanceProfile: {
        latencyMs: 120,
        accuracyScore: 71.0,
        avgThroughput: 45
      },
      costProfile: {
        costPerMillionInputTokens: 0.00, // Hosted locally
        costPerMillionOutputTokens: 0.00
      },
      availabilityStatus: "ONLINE",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "enterprise_ops",
      updatedBy: "enterprise_ops",
      version: "1.0.0",
      status: ModelStatus.EXPERIMENTAL,
      tags: ["offline", "zero-cost", "private"],
      metadata: {}
    };

    this.models.set(geminiFlash.id, geminiFlash);
    this.models.set(geminiPro.id, geminiPro);
    this.models.set(claudeSonnet.id, claudeSonnet);
    this.models.set(gpt4o.id, gpt4o);
    this.models.set(llamaLocal.id, llamaLocal);

    // Seed some historic model versions
    const ver1: ModelVersion = {
      id: "mdlv-gemini-3-6-flash-v1",
      modelId: "mdl-gemini-3-6-flash",
      releaseDate: geminiFlash.createdAt,
      changelog: "First official production pipeline deploy.",
      isActive: true,
      createdAt: geminiFlash.createdAt,
      updatedAt: geminiFlash.createdAt,
      createdBy: "enterprise_ops",
      updatedBy: "enterprise_ops",
      version: "1.0.0",
      status: "ACTIVE",
      tags: [],
      metadata: {}
    };

    this.versions.set(geminiFlash.id, [ver1]);
  }

  public getModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  public getModel(id: string): AIModel | undefined {
    return this.models.get(id);
  }

  public registerModel(model: Omit<AIModel, "id" | "createdAt" | "updatedAt">): AIModel {
    const modelId = `mdl-${Math.random().toString(36).substr(2, 9)}`;
    const newModel: AIModel = {
      ...model,
      id: modelId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.models.set(modelId, newModel);
    return newModel;
  }

  public updateModelStatus(modelId: string, status: ModelStatus, operator: string): boolean {
    const model = this.models.get(modelId);
    if (!model) return false;
    model.status = status;
    model.updatedAt = new Date().toISOString();
    model.updatedBy = operator;
    return true;
  }

  public getModelVersions(modelId: string): ModelVersion[] {
    return this.versions.get(modelId) || [];
  }
}
