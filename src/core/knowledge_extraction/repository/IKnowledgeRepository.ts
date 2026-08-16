import { RepositoryQuery } from './RepositoryQuery';
import { RepositoryResult } from './RepositoryResult';

export interface IKnowledgeRepository<T> {
  save(item: T): Promise<void>;
  saveBatch(items: readonly T[]): Promise<void>;
  update(item: T): Promise<void>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<T | null>;
  findMany(ids: readonly string[]): Promise<readonly T[]>;
  exists(id: string): Promise<boolean>;
  count(query?: RepositoryQuery): Promise<number>;
  query(query: RepositoryQuery): Promise<RepositoryResult<T>>;
  findByVersion(version: string): Promise<readonly T[]>;
  clear(): Promise<void>;
}
