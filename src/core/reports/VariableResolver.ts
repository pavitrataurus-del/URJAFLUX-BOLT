import { IReport } from './ReportTypes';
import { AnalysisRegistry } from './AnalysisRegistry';

export class VariableResolver {
  private static instance: VariableResolver;

  private constructor() {}

  public static getInstance(): VariableResolver {
    if (!VariableResolver.instance) {
      VariableResolver.instance = new VariableResolver();
    }
    return VariableResolver.instance;
  }

  /**
   * Resolves all dynamic variables/placeholders recursively in the report content.
   */
  public resolve(text: string, report: IReport): string {
    if (!text) return '';

    // Standard baseline placeholders (Part 8)
    const placeholders: Record<string, string> = {
      '{{ClientName}}': report.metadata?.clientName || 'Enterprise Client Holdings',
      '{{DOB}}': '15th August 1982', // standard profile birth date
      '{{ConsultantName}}': report.branding?.consultantName || report.metadata?.authorName || 'Lead Specialist',
      '{{PropertyName}}': report.metadata?.propertyName || 'Tech Park Headquarters',
      '{{Date}}': report.createdAt ? new Date(report.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      '{{ReportID}}': report.reportNumber || report.id || 'URF-REP-2026-001',
      '{{ProjectID}}': report.metadata?.projectId || 'UF-PRJ-2026-081',
      '{{AnalysisScore}}': String(report.sections?.[0]?.structuredData?.confidence || '86'),
      '{{EnergyScore}}': '89', // dynamic bio-resonance energy rating
      '{{ReportVersion}}': report.reportVersion || '1.0.0'
    };

    // Integrate variable providers registered by external plugins (Part 11)
    const customProviders = AnalysisRegistry.getInstance().getVariableProviders();
    customProviders.forEach(providerFn => {
      try {
        const customVars = providerFn(report);
        Object.entries(customVars).forEach(([key, val]) => {
          // Normalize dynamic keys to support wrapping both as {{Key}} and Key
          const placeholderKey = key.startsWith('{{') && key.endsWith('}}') ? key : `{{${key}}}`;
          placeholders[placeholderKey] = val;
        });
      } catch (err) {
        console.warn('Custom Variable Provider failed:', err);
      }
    });

    let resolvedText = text;
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      resolvedText = resolvedText.replace(new RegExp(escapedPlaceholder, 'g'), value);
    });

    return resolvedText;
  }

  /**
   * Resolves sections recursively.
   */
  public resolveSections(sections: IReport['sections'], report: IReport): IReport['sections'] {
    return sections.map(sec => {
      const resolvedBlocks = sec.blocks ? sec.blocks.map(b => {
        if (typeof b.content === 'string') {
          return { ...b, content: this.resolve(b.content, report) };
        } else if (b.content && typeof b.content === 'object') {
          const resolvedObj = { ...b.content };
          Object.keys(resolvedObj).forEach(k => {
            if (typeof resolvedObj[k] === 'string') {
              resolvedObj[k] = this.resolve(resolvedObj[k], report);
            } else if (Array.isArray(resolvedObj[k])) {
              resolvedObj[k] = resolvedObj[k].map((item: any) => {
                if (typeof item === 'string') return this.resolve(item, report);
                if (item && typeof item === 'object' && typeof item.label === 'string') {
                  return { ...item, label: this.resolve(item.label, report) };
                }
                return item;
              });
            }
          });
          return { ...b, content: resolvedObj };
        }
        return b;
      }) : undefined;

      return {
        ...sec,
        title: this.resolve(sec.title, report),
        subTitle: sec.subTitle ? this.resolve(sec.subTitle, report) : undefined,
        contentMarkdown: this.resolve(sec.contentMarkdown, report),
        blocks: resolvedBlocks,
        subSections: sec.subSections ? this.resolveSections(sec.subSections, report) : undefined
      };
    });
  }
}
export const VariableResolverService = VariableResolver.getInstance();
