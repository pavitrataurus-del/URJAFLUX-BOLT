// URJAFLUX Enterprise Knowledge Base V2 - Generic Repository Pattern
// Hides IndexedDB transaction complexity behind clean async repository interface

import { IndexedDBStorageEngine } from "../core/storage/IndexedDBStorageEngine";
import { KBStoreName } from "../core/storage/schema";

export interface IRepository<T extends { id: string }> {
  get(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  getByIndex(indexName: string, value: IDBValidKey): Promise<T[]>;
  put(item: T): Promise<T>;
  putBatch(items: T[]): Promise<T[]>;
  delete(id: string): Promise<void>;
  deleteBatch(ids: string[]): Promise<void>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
  protected engine: IndexedDBStorageEngine;
  protected storeName: KBStoreName;

  constructor(storeName: KBStoreName) {
    this.storeName = storeName;
    this.engine = IndexedDBStorageEngine.getInstance();
  }

  public async get(id: string): Promise<T | null> {
    return this.engine.executeTransaction([this.storeName], "readonly", async (stores) => {
      const store = stores[this.storeName];
      if (store instanceof Map) {
        return store.get(id) || null;
      }
      return new Promise<T | null>((resolve, reject) => {
        const req = (store as IDBObjectStore).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    });
  }

  public async getAll(): Promise<T[]> {
    return this.engine.executeTransaction([this.storeName], "readonly", async (stores) => {
      const store = stores[this.storeName];
      if (store instanceof Map) {
        return Array.from(store.values());
      }
      return new Promise<T[]>((resolve, reject) => {
        const req = (store as IDBObjectStore).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    });
  }

  public async getByIndex(indexName: string, value: IDBValidKey): Promise<T[]> {
    return this.engine.executeTransaction([this.storeName], "readonly", async (stores) => {
      const store = stores[this.storeName];
      if (store instanceof Map) {
        const items: T[] = [];
        store.forEach((val) => {
          if (val && val[indexName] === value) {
            items.push(val);
          }
        });
        return items;
      }
      return new Promise<T[]>((resolve, reject) => {
        try {
          const idx = (store as IDBObjectStore).index(indexName);
          const req = idx.getAll(value);
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  public async put(item: T): Promise<T> {
    return this.engine.executeTransaction([this.storeName], "readwrite", async (stores) => {
      const store = stores[this.storeName];
      if (store instanceof Map) {
        store.set(item.id, item);
        return item;
      }
      return new Promise<T>((resolve, reject) => {
        const req = (store as IDBObjectStore).put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => reject(req.error);
      });
    });
  }

  public async putBatch(items: T[]): Promise<T[]> {
    if (items.length === 0) return [];
    return this.engine.executeTransaction([this.storeName], "readwrite", async (stores) => {
      const store = stores[this.storeName];
      if (store instanceof Map) {
        items.forEach((item) => store.set(item.id, item));
        return items;
      }
      return new Promise<T[]>((resolve, reject) => {
        const objStore = store as IDBObjectStore;
        let count = 0;
        let hasError = false;

        items.forEach((item) => {
          if (hasError) return;
          const req = objStore.put(item);
          req.onsuccess = () => {
            count++;
            if (count === items.length) {
              resolve(items);
            }
          };
          req.onerror = () => {
            hasError = true;
            reject(req.error);
          };
        });
      });
    });
  }

  public async delete(id: string): Promise<void> {
    return this.engine.executeTransaction([this.storeName], "readwrite", async (stores) => {
      const store = stores[this.storeName];
      if (store instanceof Map) {
        store.delete(id);
        return;
      }
      return new Promise<void>((resolve, reject) => {
        const req = (store as IDBObjectStore).delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  }

  public async deleteBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    return this.engine.executeTransaction([this.storeName], "readwrite", async (stores) => {
      const store = stores[this.storeName];
      if (store instanceof Map) {
        ids.forEach((id) => store.delete(id));
        return;
      }
      return new Promise<void>((resolve, reject) => {
        const objStore = store as IDBObjectStore;
        let count = 0;
        let hasError = false;

        ids.forEach((id) => {
          if (hasError) return;
          const req = objStore.delete(id);
          req.onsuccess = () => {
            count++;
            if (count === ids.length) {
              resolve();
            }
          };
          req.onerror = () => {
            hasError = true;
            reject(req.error);
          };
        });
      });
    });
  }

  public async count(): Promise<number> {
    return this.engine.getStoreCount(this.storeName);
  }

  public async clear(): Promise<void> {
    return this.engine.executeTransaction([this.storeName], "readwrite", async (stores) => {
      const store = stores[this.storeName];
      if (store instanceof Map) {
        store.clear();
        return;
      }
      return new Promise<void>((resolve, reject) => {
        const req = (store as IDBObjectStore).clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  }
}
