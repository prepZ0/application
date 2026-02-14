type Listener = () => void;

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private store = new Map<string, CacheEntry>();
  private inflight = new Map<string, Promise<unknown>>();
  private listeners = new Map<string, Set<Listener>>();

  /** Get cached data if it exists and is within the TTL (in seconds). */
  get<T>(key: string, ttl: number): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > ttl * 1000) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  /** Store data in cache. */
  set<T>(key: string, data: T): void {
    this.store.set(key, { data, timestamp: Date.now() });
    this.notify(key);
  }

  /** Invalidate a single cache key. */
  invalidate(key: string): void {
    this.store.delete(key);
    this.notify(key);
  }

  /** Invalidate all keys that start with the given prefix. */
  invalidatePattern(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        this.notify(key);
      }
    }
  }

  /**
   * Deduplicate in-flight requests.
   * If a request for the same key is already pending, return the same promise.
   */
  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fn().finally(() => {
      this.inflight.delete(key);
    });
    this.inflight.set(key, promise);
    return promise;
  }

  /** Subscribe to changes on a cache key. Returns an unsubscribe function. */
  subscribe(key: string, callback: Listener): () => void {
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    set.add(callback);
    return () => {
      set!.delete(callback);
      if (set!.size === 0) this.listeners.delete(key);
    };
  }

  private notify(key: string): void {
    const set = this.listeners.get(key);
    if (set) {
      for (const cb of set) cb();
    }
  }
}

export const apiCache = new ApiCache();
