export type WarningCategory =
  | 'INGESTION'
  | 'PARSING'
  | 'EXTRACTION'
  | 'VALIDATION'
  | 'CANONICALIZATION'
  | 'REPOSITORY'
  | 'INDEXING'
  | 'SYSTEM';

export interface IImportWarningData {
  readonly code: string;
  readonly category: WarningCategory;
  readonly message: string;
  readonly timestamp: number;
  readonly details?: Record<string, unknown>;
}

export class ImportWarning implements IImportWarningData {
  public readonly code: string;
  public readonly category: WarningCategory;
  public readonly message: string;
  public readonly timestamp: number;
  public readonly details?: Record<string, unknown>;

  constructor(data: IImportWarningData) {
    this.code = data.code;
    this.category = data.category;
    this.message = data.message;
    this.timestamp = data.timestamp;
    this.details = data.details ? Object.freeze({ ...data.details }) : undefined;
    Object.freeze(this);
  }

  public toJSON(): IImportWarningData {
    return {
      code: this.code,
      category: this.category,
      message: this.message,
      timestamp: this.timestamp,
      details: this.details
    };
  }
}

export interface IImportWarningsCollectionData {
  readonly warnings: readonly IImportWarningData[];
}

export class ImportWarnings {
  private readonly warningList: ImportWarning[];

  constructor(initialWarnings?: readonly (IImportWarningData | string)[]) {
    this.warningList = [];
    if (initialWarnings) {
      for (const item of initialWarnings) {
        if (typeof item === 'string') {
          this.warningList.push(
            new ImportWarning({
              code: 'WARN_GENERIC',
              category: 'SYSTEM',
              message: item,
              timestamp: Date.now()
            })
          );
        } else {
          this.warningList.push(new ImportWarning(item));
        }
      }
    }
  }

  public addWarning(
    message: string,
    category: WarningCategory = 'SYSTEM',
    code = 'WARN_GENERIC',
    details?: Record<string, unknown>
  ): void {
    this.warningList.push(
      new ImportWarning({
        code,
        category,
        message,
        timestamp: Date.now(),
        details
      })
    );
  }

  public get warnings(): readonly ImportWarning[] {
    return Object.freeze([...this.warningList]);
  }

  public get count(): number {
    return this.warningList.length;
  }

  public getWarningsByCategory(category: WarningCategory): readonly ImportWarning[] {
    return Object.freeze(this.warningList.filter((w) => w.category === category));
  }

  public toStringArray(): readonly string[] {
    return Object.freeze(this.warningList.map((w) => `[${w.category}:${w.code}] ${w.message}`));
  }

  public toJSON(): IImportWarningsCollectionData {
    return {
      warnings: this.warningList.map((w) => w.toJSON())
    };
  }
}
