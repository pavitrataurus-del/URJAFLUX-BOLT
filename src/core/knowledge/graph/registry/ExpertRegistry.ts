import { IExpertModule } from "../models/GraphModels";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { GraphEventType, createGraphEvent } from "../events/GraphEvents";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class ExpertRegistry {
  private static instance: ExpertRegistry;
  private experts: Map<string, IExpertModule> = new Map();

  private constructor() {}

  public static getInstance(): ExpertRegistry {
    if (!ExpertRegistry.instance) {
      ExpertRegistry.instance = new ExpertRegistry();
    }
    return ExpertRegistry.instance;
  }

  public registerExpert(expert: IExpertModule): void {
    if (this.experts.has(expert.identifier)) {
      throw new EnterpriseError(`Expert module ${expert.identifier} is already registered`, { category: ErrorCategory.VALIDATION });
    }
    this.experts.set(expert.identifier, expert);
    EventBus.getInstance().publish(createGraphEvent(GraphEventType.EXPERT_REGISTERED, { expertId: expert.identifier }));
  }

  public getExpert(identifier: string): IExpertModule | undefined {
    return this.experts.get(identifier);
  }

  public listExperts(): IExpertModule[] {
    return Array.from(this.experts.values());
  }

  public unregisterExpert(identifier: string): void {
    this.experts.delete(identifier);
  }

  public clear(): void {
    this.experts.clear();
  }
}
