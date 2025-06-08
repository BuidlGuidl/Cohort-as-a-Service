// packages/nextjs/services/ponder/cache.ts
import { LRUCache } from "lru-cache";

// Create a simple in-memory cache
const cache = new LRUCache<string, any>({
  max: 100, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes TTL
});

export const cachedPonderRequest = async <T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> => {
  // Check cache first
  const cached = cache.get(key);
  if (cached) {
    return cached as T;
  }

  // Fetch and cache
  const data = await fetcher();
  cache.set(key, data, { ttl });
  return data;
};

// Usage example in hooks:
// const data = await cachedPonderRequest(
//   `cohort-${cohortAddress}`,
//   () => ponderClient.get(`/cohort/${cohortAddress}`),
//   60000 // 1 minute cache
// );
