import { BaseEngine } from '../types/BaseEngine';
import { Logger } from '../utils/logger';
import { USOMBaseObject } from '../usom/types';

export interface ValidationRule<T = any> {
  id: string;
  name: string;
  validate: (target: T) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export class ValidationEngine implements BaseEngine {
  public readonly name = 'ValidationEngine';
  private initialized = false;
  
  private rules: Map<string, ValidationRule[]> = new Map(); // Keyed by target type (e.g., 'USOM_OBJECT', 'UFP_PROJECT')

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.rules.clear();
    this.initialized = true;
    Logger.info(`${this.name} initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.rules.clear();
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  public registerRule(targetType: string, rule: ValidationRule): void {
    if (!this.initialized) {
      Logger.warn(`[${this.name}] Cannot register rule because engine is not initialized.`);
      return;
    }
    
    if (!this.rules.has(targetType)) {
      this.rules.set(targetType, []);
    }
    this.rules.get(targetType)!.push(rule);
    Logger.debug(`[${this.name}] Registered rule '${rule.name}' for target type '${targetType}'`);
  }
  
  public removeRule(targetType: string, ruleId: string): void {
    if (!this.initialized) return;
    
    const rulesForType = this.rules.get(targetType);
    if (rulesForType) {
      const filtered = rulesForType.filter(r => r.id !== ruleId);
      this.rules.set(targetType, filtered);
      Logger.debug(`[${this.name}] Removed rule '${ruleId}' from target type '${targetType}'`);
    }
  }

  public validate<T>(targetType: string, target: T): ValidationResult {
    if (!this.initialized) {
      return { isValid: false, errors: [`${this.name} is not initialized.`] };
    }

    const rulesForType = this.rules.get(targetType);
    if (!rulesForType || rulesForType.length === 0) {
      return { isValid: true }; // No rules to validate against
    }

    const aggregatedResult: ValidationResult = { isValid: true, errors: [], warnings: [] };

    for (const rule of rulesForType) {
      try {
        const result = rule.validate(target);
        if (!result.isValid) {
          aggregatedResult.isValid = false;
          if (result.errors) {
            aggregatedResult.errors!.push(...result.errors);
          }
        }
        if (result.warnings) {
          aggregatedResult.warnings!.push(...result.warnings);
        }
      } catch (error: any) {
        aggregatedResult.isValid = false;
        aggregatedResult.errors!.push(`Rule ${rule.id} failed with exception: ${error.message}`);
        Logger.error(`[${this.name}] Rule ${rule.id} failed during execution:`, error);
      }
    }

    return aggregatedResult;
  }
}
