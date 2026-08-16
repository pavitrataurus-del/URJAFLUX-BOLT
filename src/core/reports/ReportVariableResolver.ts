import { IReport } from './ReportTypes';
import { VariableResolver } from './VariableResolver';

export class ReportVariableResolver {
  public static resolve(text: string, report: IReport): string {
    return VariableResolver.getInstance().resolve(text, report);
  }

  /**
   * Resolves variables recursively inside a list of sections.
   */
  public static resolveSections(sections: IReport['sections'], report: IReport): IReport['sections'] {
    return VariableResolver.getInstance().resolveSections(sections, report);
  }
}

