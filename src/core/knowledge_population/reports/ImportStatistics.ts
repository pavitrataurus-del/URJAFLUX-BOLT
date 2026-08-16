export interface IImportStatisticsData {
  readonly booksImported: number;
  readonly pagesParsed: number;
  readonly knowledgeObjects: number;
  readonly canonicalEntities: number;
  readonly relationships: number;
  readonly duplicates: number;
  readonly conflicts: number;
  readonly warningsCount: number;
  readonly errorsCount: number;
  readonly executionTimeMs: number;
}

export class ImportStatistics implements IImportStatisticsData {
  public readonly booksImported: number;
  public readonly pagesParsed: number;
  public readonly knowledgeObjects: number;
  public readonly canonicalEntities: number;
  public readonly relationships: number;
  public readonly duplicates: number;
  public readonly conflicts: number;
  public readonly warningsCount: number;
  public readonly errorsCount: number;
  public readonly executionTimeMs: number;

  constructor(data?: Partial<IImportStatisticsData>) {
    this.booksImported = data?.booksImported ?? 0;
    this.pagesParsed = data?.pagesParsed ?? 0;
    this.knowledgeObjects = data?.knowledgeObjects ?? 0;
    this.canonicalEntities = data?.canonicalEntities ?? 0;
    this.relationships = data?.relationships ?? 0;
    this.duplicates = data?.duplicates ?? 0;
    this.conflicts = data?.conflicts ?? 0;
    this.warningsCount = data?.warningsCount ?? 0;
    this.errorsCount = data?.errorsCount ?? 0;
    this.executionTimeMs = data?.executionTimeMs ?? 0;
    Object.freeze(this);
  }

  public static empty(): ImportStatistics {
    return new ImportStatistics();
  }

  public combine(other: ImportStatistics): ImportStatistics {
    return new ImportStatistics({
      booksImported: this.booksImported + other.booksImported,
      pagesParsed: this.pagesParsed + other.pagesParsed,
      knowledgeObjects: this.knowledgeObjects + other.knowledgeObjects,
      canonicalEntities: this.canonicalEntities + other.canonicalEntities,
      relationships: this.relationships + other.relationships,
      duplicates: this.duplicates + other.duplicates,
      conflicts: this.conflicts + other.conflicts,
      warningsCount: this.warningsCount + other.warningsCount,
      errorsCount: this.errorsCount + other.errorsCount,
      executionTimeMs: this.executionTimeMs + other.executionTimeMs
    });
  }

  public toJSON(): IImportStatisticsData {
    return {
      booksImported: this.booksImported,
      pagesParsed: this.pagesParsed,
      knowledgeObjects: this.knowledgeObjects,
      canonicalEntities: this.canonicalEntities,
      relationships: this.relationships,
      duplicates: this.duplicates,
      conflicts: this.conflicts,
      warningsCount: this.warningsCount,
      errorsCount: this.errorsCount,
      executionTimeMs: this.executionTimeMs
    };
  }
}
