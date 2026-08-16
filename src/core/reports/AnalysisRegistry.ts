import { IAnalysisContract } from './AnalysisContract';

export interface IAnalysisModuleInfo {
  moduleId: string;
  moduleName: string;
  version: string;
  isActive: boolean;
  description: string;
}

export type VariableProviderFn = (context: any) => Record<string, string>;
export type ValidationRuleFn = (contract: IAnalysisContract) => string[];
export type BlockMapFn = (section: any) => any; // custom section to block mapper

export class AnalysisRegistry {
  private static instance: AnalysisRegistry;
  private modules = new Map<string, IAnalysisModuleInfo>();
  private variableProviders: VariableProviderFn[] = [];
  private validationRules: ValidationRuleFn[] = [];
  private customBlockMappers = new Map<string, BlockMapFn>();

  private constructor() {
    this.registerDefaultModules();
  }

  public static getInstance(): AnalysisRegistry {
    if (!AnalysisRegistry.instance) {
      AnalysisRegistry.instance = new AnalysisRegistry();
    }
    return AnalysisRegistry.instance;
  }

  private registerDefaultModules() {
    const defaultModules: IAnalysisModuleInfo[] = [
      {
        moduleId: 'vastu-engine',
        moduleName: 'Vastu Shastra Engine',
        version: '1.2.0',
        isActive: true,
        description: 'Vastu Purusha Mandala layout and spatial micro-vector calculations'
      },
      {
        moduleId: 'astrology-engine',
        moduleName: 'Vedic Astrology Engine',
        version: '1.0.1',
        isActive: true,
        description: 'Kundli planetary alignments, dasha systems and transit analysis'
      },
      {
        moduleId: 'numerology-engine',
        moduleName: 'Vedic Numerology Engine',
        version: '1.0.0',
        isActive: true,
        description: 'Grid of fate, destiny, psychic and name vibration harmonics'
      },
      {
        moduleId: 'kp-astrology',
        moduleName: 'Krishnamurti Paddhati (KP)',
        version: '1.0.0',
        isActive: true,
        description: 'KP stellar astrology, sub-lord tables and event timing'
      },
      {
        moduleId: 'lal-kitab',
        moduleName: 'Lal Kitab Remedial Engine',
        version: '1.1.0',
        isActive: true,
        description: 'Astro-palmistry hybrid remedies and planetary house changes'
      },
      {
        moduleId: 'palmistry-engine',
        moduleName: 'Sarpasastra Palmistry Engine',
        version: '0.9.0',
        isActive: true,
        description: 'Mount, line, and hand geometry outline extraction and analysis'
      },
      {
        moduleId: 'face-reading',
        moduleName: 'Samudrika Shastra Face Reading',
        version: '0.8.0',
        isActive: true,
        description: 'Facial micro-symmetry, forehead lines, and energy node mapping'
      }
    ];

    defaultModules.forEach(mod => this.registerModule(mod));
  }

  /**
   * Registers a new analysis module.
   */
  public registerModule(moduleInfo: IAnalysisModuleInfo) {
    this.modules.set(moduleInfo.moduleId, moduleInfo);
  }

  /**
   * Unregisters an analysis module.
   */
  public unregisterModule(moduleId: string) {
    this.modules.delete(moduleId);
  }

  /**
   * Retrieves all registered modules.
   */
  public getAllModules(): IAnalysisModuleInfo[] {
    return Array.from(this.modules.values());
  }

  /**
   * Retrieves an active module by ID.
   */
  public getModule(moduleId: string): IAnalysisModuleInfo | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Register a custom variable provider plugin.
   */
  public registerVariableProvider(provider: VariableProviderFn) {
    this.variableProviders.push(provider);
  }

  public getVariableProviders(): VariableProviderFn[] {
    return this.variableProviders;
  }

  /**
   * Register a custom validation rule plugin.
   */
  public registerValidationRule(rule: ValidationRuleFn) {
    this.validationRules.push(rule);
  }

  public getValidationRules(): ValidationRuleFn[] {
    return this.validationRules;
  }

  /**
   * Register a custom block mapper plugin for specific custom section types.
   */
  public registerBlockMapper(sectionType: string, mapper: BlockMapFn) {
    this.customBlockMappers.set(sectionType, mapper);
  }

  public getBlockMapper(sectionType: string): BlockMapFn | undefined {
    return this.customBlockMappers.get(sectionType);
  }
}
