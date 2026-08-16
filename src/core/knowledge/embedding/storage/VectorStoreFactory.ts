import { IVectorStore } from "./IVectorStore";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class VectorStoreFactory {
  private static instance: VectorStoreFactory;
  private stores: Map<string, IVectorStore> = new Map();
  private defaultStoreId: string | null = null;

  private constructor() {}

  public static getInstance(): VectorStoreFactory {
    if (!VectorStoreFactory.instance) {
      VectorStoreFactory.instance = new VectorStoreFactory();
    }
    return VectorStoreFactory.instance;
  }

  public registerStore(store: IVectorStore, isDefault = false): void {
    const id = store.getStoreId();
    this.stores.set(id, store);
    if (isDefault || !this.defaultStoreId) {
      this.defaultStoreId = id;
    }
  }

  public getStore(storeId?: string): IVectorStore {
    const id = storeId || this.defaultStoreId;
    if (!id) {
      throw new EnterpriseError("No vector store configured", { category: ErrorCategory.VALIDATION });
    }
    const store = this.stores.get(id);
    if (!store) {
      throw new EnterpriseError(`Vector store ${id} not found`, { category: ErrorCategory.NOT_FOUND });
    }
    return store;
  }

  public clear(): void {
    this.stores.clear();
    this.defaultStoreId = null;
  }
}
