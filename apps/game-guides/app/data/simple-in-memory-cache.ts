export class SimpleInMemoryCache<T> {
  private cache = new Map<string, { value: T, expiresAt: number }>();

  set(key: string, value: T, expiresAt: number) {
    this.cache.set(key, {value, expiresAt});
  }

  get(key: string): T | null {
    const cacheEntry = this.cache.get(key);

    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.value;
    } else {
      this.cache.delete(key);
      return null
    }
  }
}
