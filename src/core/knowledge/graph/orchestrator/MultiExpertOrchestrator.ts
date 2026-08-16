import { IExpertModule, ExpertHealthStatus } from "../models/GraphModels";
import { ExpertRegistry } from "../registry/ExpertRegistry";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class MultiExpertOrchestrator {
  private static instance: MultiExpertOrchestrator;

  private constructor() {}

  public static getInstance(): MultiExpertOrchestrator {
    if (!MultiExpertOrchestrator.instance) {
      MultiExpertOrchestrator.instance = new MultiExpertOrchestrator();
    }
    return MultiExpertOrchestrator.instance;
  }

  public prepareRouting(namespace: string): IExpertModule[] {
    const allExperts = ExpertRegistry.getInstance().listExperts();
    const availableExperts = allExperts.filter(e => 
      e.supportedNamespaces.includes(namespace) && e.healthStatus === ExpertHealthStatus.HEALTHY
    );
    
    if (availableExperts.length === 0) {
      throw new EnterpriseError(`No healthy experts found for namespace: ${namespace}`, { category: ErrorCategory.VALIDATION });
    }

    return this.validateAndOrderDependencies(availableExperts);
  }

  private validateAndOrderDependencies(experts: IExpertModule[]): IExpertModule[] {
    // Topological sort or priority ordering based on dependencies.
    // For now, basic dependency validation to avoid cycles and missing dependencies.
    const expertMap = new Map<string, IExpertModule>();
    experts.forEach(e => expertMap.set(e.identifier, e));

    const ordered: IExpertModule[] = [];
    const visited = new Set<string>();
    const processing = new Set<string>();

    const visit = (expertId: string) => {
      if (processing.has(expertId)) {
        throw new EnterpriseError(`Circular dependency detected involving expert: ${expertId}`, { category: ErrorCategory.VALIDATION });
      }
      if (!visited.has(expertId)) {
        processing.add(expertId);
        const expert = expertMap.get(expertId);
        
        if (!expert) {
          throw new EnterpriseError(`Missing dependency: ${expertId}`, { category: ErrorCategory.VALIDATION });
        }

        expert.dependencies.forEach(dep => {
          if (!expertMap.has(dep)) {
            // For this orchestrator, we only order among provided experts.
            // If dependency is missing from the list, we fail routing.
            throw new EnterpriseError(`Expert ${expert.identifier} depends on ${dep} which is not available in routing`, { category: ErrorCategory.VALIDATION });
          }
          visit(dep);
        });

        processing.delete(expertId);
        visited.add(expertId);
        ordered.push(expert);
      }
    };

    experts.forEach(e => {
      if (!visited.has(e.identifier)) {
        visit(e.identifier);
      }
    });

    return ordered;
  }
}
