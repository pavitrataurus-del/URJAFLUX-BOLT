import { IModule, ModuleStatus } from "./RegistryTypes";
import { Logger } from "../logging/Logger";

export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, IModule> = new Map();

  private constructor() {}

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  public register(module: IModule): void {
    if (this.modules.has(module.definition.id)) {
      throw new Error(`Module ${module.definition.id} is already registered.`);
    }
    this.modules.set(module.definition.id, module);
    Logger.getInstance().info(`Registered module: ${module.definition.id}`);
  }

  public getModule(id: string): IModule | undefined {
    return this.modules.get(id);
  }

  public getAllModules(): IModule[] {
    return Array.from(this.modules.values());
  }

  public async initializeAll(): Promise<void> {
    const logger = Logger.getInstance();
    
    // Sort by dependencies - simplified (no circular detection implemented yet)
    // For now we just initialize them in order of registration
    for (const [id, module] of this.modules.entries()) {
      try {
        logger.info(`Initializing module: ${id}`);
        await module.initialize();
      } catch (err: any) {
        logger.error(`Failed to initialize module: ${id}`, {}, err);
        throw err;
      }
    }
  }

  public getModulesByCapability(capability: string): IModule[] {
    return Array.from(this.modules.values()).filter(m => 
      m.definition.capabilities?.includes(capability)
    );
  }
}
