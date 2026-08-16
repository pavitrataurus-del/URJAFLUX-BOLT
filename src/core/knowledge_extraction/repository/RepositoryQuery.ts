export type SortDirection = 'ASC' | 'DESC';

export interface ISortCriterion {
  readonly field: string;
  readonly direction: SortDirection;
}

export interface IFilterCriteria {
  readonly id?: string | readonly string[];
  readonly category?: string;
  readonly entity?: string;
  readonly attribute?: string;
  readonly sourceDocumentId?: string;
  readonly sourceNodeId?: string;
  readonly version?: string;
  readonly status?: string;
  readonly relationshipType?: string;
  readonly canonicalKey?: string;
  readonly metadataFilters?: Record<string, unknown>;
  readonly confidenceMin?: number;
}

export interface IRepositoryQueryData {
  readonly filters: IFilterCriteria;
  readonly sort?: readonly ISortCriterion[];
  readonly offset?: number;
  readonly limit?: number;
  readonly projection?: readonly string[];
}

export class RepositoryQueryBuilder {
  private filtersData: IFilterCriteria = {};
  private sortData: ISortCriterion[] = [];
  private offsetValue?: number;
  private limitValue?: number;
  private projectionFields?: string[];

  public filterBy(filters: IFilterCriteria): this {
    this.filtersData = { ...this.filtersData, ...filters };
    return this;
  }

  public where(key: keyof IFilterCriteria, value: unknown): this {
    this.filtersData = { ...this.filtersData, [key]: value };
    return this;
  }

  public sort(field: string, direction: SortDirection = 'ASC'): this {
    this.sortData.push({ field, direction });
    return this;
  }

  public page(offset: number, limit: number): this {
    this.offsetValue = offset;
    this.limitValue = limit;
    return this;
  }

  public select(fields: readonly string[]): this {
    this.projectionFields = [...fields];
    return this;
  }

  public build(): RepositoryQuery {
    return new RepositoryQuery({
      filters: this.filtersData,
      sort: this.sortData.length > 0 ? this.sortData : undefined,
      offset: this.offsetValue,
      limit: this.limitValue,
      projection: this.projectionFields
    });
  }
}

export class RepositoryQuery implements IRepositoryQueryData {
  public readonly filters: IFilterCriteria;
  public readonly sort?: readonly ISortCriterion[];
  public readonly offset?: number;
  public readonly limit?: number;
  public readonly projection?: readonly string[];

  constructor(data: IRepositoryQueryData) {
    this.filters = Object.freeze({ ...data.filters });
    this.sort = data.sort ? Object.freeze([...data.sort]) : undefined;
    this.offset = data.offset;
    this.limit = data.limit;
    this.projection = data.projection ? Object.freeze([...data.projection]) : undefined;
    Object.freeze(this);
  }

  public static builder(): RepositoryQueryBuilder {
    return new RepositoryQueryBuilder();
  }

  public static empty(): RepositoryQuery {
    return new RepositoryQuery({ filters: {} });
  }

  public toJSON(): IRepositoryQueryData {
    return {
      filters: this.filters,
      sort: this.sort,
      offset: this.offset,
      limit: this.limit,
      projection: this.projection
    };
  }
}
