export type ImportStage =
  | 'REGISTER_DOCUMENT'
  | 'PARSE_DOCUMENT'
  | 'EXTRACT_KNOWLEDGE'
  | 'VALIDATE'
  | 'CANONICALIZE'
  | 'STORE'
  | 'BUILD_INDEX'
  | 'GENERATE_REPORT'
  | 'COMPLETED'
  | 'FAILED';

export const IMPORT_STAGE_SEQUENCE: readonly ImportStage[] = Object.freeze([
  'REGISTER_DOCUMENT',
  'PARSE_DOCUMENT',
  'EXTRACT_KNOWLEDGE',
  'VALIDATE',
  'CANONICALIZE',
  'STORE',
  'BUILD_INDEX',
  'GENERATE_REPORT',
  'COMPLETED'
]);

export interface IStageProgressInfo {
  readonly stage: ImportStage;
  readonly progressPercent: number;
  readonly description: string;
}

export class ImportPipeline {
  public static getNextStage(currentStage: ImportStage): ImportStage {
    const idx = IMPORT_STAGE_SEQUENCE.indexOf(currentStage);
    if (idx < 0 || idx >= IMPORT_STAGE_SEQUENCE.length - 1) {
      return currentStage === 'COMPLETED' ? 'COMPLETED' : 'FAILED';
    }
    return IMPORT_STAGE_SEQUENCE[idx + 1];
  }

  public static getStageProgress(stage: ImportStage): number {
    switch (stage) {
      case 'REGISTER_DOCUMENT':
        return 10;
      case 'PARSE_DOCUMENT':
        return 30;
      case 'EXTRACT_KNOWLEDGE':
        return 50;
      case 'VALIDATE':
        return 65;
      case 'CANONICALIZE':
        return 75;
      case 'STORE':
        return 85;
      case 'BUILD_INDEX':
        return 92;
      case 'GENERATE_REPORT':
        return 98;
      case 'COMPLETED':
        return 100;
      case 'FAILED':
        return 0;
      default:
        return 0;
    }
  }
}
