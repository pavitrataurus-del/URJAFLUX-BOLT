import { ITwinRepository } from "./ITwinRepository";

class FallbackTwinRepository implements ITwinRepository {
  private twins = new Map<string, any>();

  constructor() {
    try {
      const stored = localStorage.getItem("urjaflux_digital_twins");
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach(key => {
          this.twins.set(key, parsed[key]);
        });
      }
    } catch (e) {
      console.warn("Fallback localStorage twins failed:", e);
    }
  }

  private persist() {
    try {
      const obj: Record<string, any> = {};
      this.twins.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem("urjaflux_digital_twins", JSON.stringify(obj));
    } catch (e) {
      console.warn("Fallback save twins failed:", e);
    }
  }

  async createTwin(twin: any): Promise<any> {
    this.twins.set(twin.id, twin);
    this.persist();
    return twin;
  }

  async updateTwin(twin: any): Promise<any> {
    this.twins.set(twin.id, twin);
    this.persist();
    return twin;
  }

  async deleteTwin(twinId: string): Promise<void> {
    this.twins.delete(twinId);
    this.persist();
  }

  async getTwin(twinId: string): Promise<any | null> {
    return this.twins.get(twinId) || null;
  }

  async listTwinsByProject(projectId: string): Promise<any[]> {
    return Array.from(this.twins.values()).filter(t => t.projectId === projectId);
  }

  async saveTwin(twin: any): Promise<void> {
    this.twins.set(twin.id, twin);
    this.persist();
  }
}

export class TwinRepositoryFactory {
  private static instance: TwinRepositoryFactory;
  private repository: ITwinRepository | null = null;

  private constructor() {}

  public static getInstance(): TwinRepositoryFactory {
    if (!TwinRepositoryFactory.instance) {
      TwinRepositoryFactory.instance = new TwinRepositoryFactory();
    }
    return TwinRepositoryFactory.instance;
  }

  public registerRepository(repository: ITwinRepository): void {
    this.repository = repository;
  }

  public getRepository(): ITwinRepository {
    if (!this.repository) {
      console.warn("Twin repository not explicitly registered. Initializing resilient fallback twin repository...");
      this.repository = new FallbackTwinRepository();
    }
    return this.repository;
  }
  
  public clear(): void {
    this.repository = null;
  }
}
