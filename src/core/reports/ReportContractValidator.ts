import { IAnalysisContract } from './AnalysisContract';
import { AnalysisRegistry } from './AnalysisRegistry';

export interface IValidationReport {
  isValid: boolean;
  moduleId: string;
  errors: string[];
  warnings: string[];
  metrics: {
    requiredFieldsCount: number;
    validatedSectionsCount: number;
    validatedBlocksCount: number;
  };
}

export class ReportContractValidator {
  private static instance: ReportContractValidator;

  private constructor() {}

  public static getInstance(): ReportContractValidator {
    if (!ReportContractValidator.instance) {
      ReportContractValidator.instance = new ReportContractValidator();
    }
    return ReportContractValidator.instance;
  }

  /**
   * Validates a module's analysis contract.
   */
  public validate(contract: IAnalysisContract): IValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiredFieldsCount = 0;
    let validatedSectionsCount = 0;
    let validatedBlocksCount = 0;

    // 1. Validate Required Top-Level Fields
    const requiredFields: (keyof IAnalysisContract)[] = [
      'moduleId',
      'moduleName',
      'version',
      'generatedTimestamp',
      'confidence',
      'dataSections',
      'warnings',
      'recommendations',
      'attachments',
      'references',
      'sourceModule'
    ];

    requiredFields.forEach(field => {
      requiredFieldsCount++;
      if (contract[field] === undefined || contract[field] === null || contract[field] === '') {
        errors.push(`Missing critical required field: "${field}"`);
      }
    });

    // 2. Validate Module Existence and Version Compatibility (Part 4 & 5)
    if (contract.moduleId) {
      const regModule = AnalysisRegistry.getInstance().getModule(contract.moduleId);
      if (!regModule) {
        warnings.push(`Module "${contract.moduleId}" is not registered in the Module Registry (Unknown Engine)`);
      } else {
        // Compare major versions
        const regMajor = parseInt(regModule.version.split('.')[0], 10);
        const contractMajor = parseInt(contract.version.split('.')[0], 10);
        if (contractMajor !== regMajor) {
          warnings.push(`Version compatibility mismatch for "${contract.moduleId}": Registry version ${regModule.version} vs Contract version ${contract.version}`);
        }
      }
    }

    // 3. Validate Sections and Blocks
    if (Array.isArray(contract.dataSections)) {
      const seenSectionIds = new Set<string>();
      const seenBlockIds = new Set<string>();

      contract.dataSections.forEach((sec, sIdx) => {
        validatedSectionsCount++;
        
        // Validate Section Fields
        if (!sec.id) {
          errors.push(`Section at index ${sIdx} is missing a unique "id"`);
        } else if (seenSectionIds.has(sec.id)) {
          errors.push(`Duplicate Section ID detected: "${sec.id}"`);
        } else {
          seenSectionIds.add(sec.id);
        }

        if (!sec.type) {
          errors.push(`Section "${sec.id || sIdx}" is missing a "type" specification`);
        }

        if (!sec.title) {
          errors.push(`Section "${sec.id || sIdx}" is missing a "title"`);
        }

        // Check for duplicate blocks in section
        if (sec.content && Array.isArray(sec.content.blocks)) {
          sec.content.blocks.forEach((block: any, bIdx: number) => {
            validatedBlocksCount++;
            if (block.blockId) {
              if (seenBlockIds.has(block.blockId)) {
                errors.push(`Duplicate Block ID detected across sections: "${block.blockId}"`);
              } else {
                seenBlockIds.add(block.blockId);
              }
            } else {
              warnings.push(`Block at index ${bIdx} in section "${sec.id}" is missing a "blockId"`);
            }
          });
        }

        // Validate Unknown Placeholders/Variables inside markdown content (Part 8)
        const textToCheck = `${sec.title} ${sec.content?.contentMarkdown || ''} ${JSON.stringify(sec.content || '')}`;
        const placeholderRegex = /\{\{([^}]+)\}\}/g;
        let match;
        const allowedPlaceholders = [
          'ClientName', 'DOB', 'ConsultantName', 'PropertyName', 'Date',
          'ReportID', 'ProjectID', 'AnalysisScore', 'EnergyScore', 'ReportVersion'
        ];

        while ((match = placeholderRegex.exec(textToCheck)) !== null) {
          const varName = match[1].trim();
          if (!allowedPlaceholders.includes(varName)) {
            // Check dynamic variable providers from registry (Part 11)
            let isFoundInPlugins = false;
            const providers = AnalysisRegistry.getInstance().getVariableProviders();
            for (const p of providers) {
              const vars = p({});
              if (vars[varName] !== undefined || vars[`{{${varName}}}`] !== undefined) {
                isFoundInPlugins = true;
                break;
              }
            }
            if (!isFoundInPlugins) {
              warnings.push(`Potential unknown or unresolvable variable placeholder: "{{${varName}}}" in section "${sec.id}"`);
            }
          }
        }
      });
    } else {
      errors.push('The "dataSections" field must be a valid array');
    }

    // 4. Validate Cross-References and Attachments (Part 5)
    if (Array.isArray(contract.recommendations)) {
      contract.recommendations.forEach(rec => {
        if (rec.evidence) {
          const attachmentExists = contract.attachments.some(att => att.id === rec.evidence);
          if (!attachmentExists) {
            warnings.push(`Recommendation "${rec.id}" references evidence attachment "${rec.evidence}" which does not exist in the contract attachments`);
          }
        }
      });
    }

    // 5. Run any custom registered plugin validation rules (Part 11)
    const customRules = AnalysisRegistry.getInstance().getValidationRules();
    customRules.forEach(ruleFn => {
      try {
        const ruleErrors = ruleFn(contract);
        if (Array.isArray(ruleErrors)) {
          errors.push(...ruleErrors);
        }
      } catch (err: any) {
        warnings.push(`Custom validation rule threw an error: ${err.message || err}`);
      }
    });

    return {
      isValid: errors.length === 0,
      moduleId: contract.moduleId || 'unknown',
      errors,
      warnings,
      metrics: {
        requiredFieldsCount,
        validatedSectionsCount,
        validatedBlocksCount
      }
    };
  }
}
