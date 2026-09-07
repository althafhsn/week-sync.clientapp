// In-memory GET cache shared by the api/*-client modules. Many pages mount
// independently and re-request the same reference data (lookups, the
// project/user list, ...) on every visit; memoizing by request key lets
// them reuse one network round trip instead of each firing its own fetch.
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

/** Near-static reference tables (priority types, task statuses, ...) that
 * have no edit UI anywhere in the app. */
export const LOOKUP_TTL_MS = 10 * 60 * 1000;

/** Mutable entities (projects, users, reports) that this app itself can
 * write to — short enough that a stale read self-heals quickly even if an
 * `invalidate` call is ever missed. */
export const ENTITY_TTL_MS = 60 * 1000;

/** Memoizes `loader` under `key`: a cache hit resolves immediately, a
 * duplicate in-flight call reuses the same pending promise, and a miss
 * fetches and caches for `ttlMs`. */
export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = loader()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

/** Drops every cached entry whose key starts with `prefix` — call after a
 * create/update/delete so the next read reflects the change. */
export function invalidate(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
  for (const key of inFlight.keys()) {
    if (key.startsWith(prefix)) inFlight.delete(key);
  }
}

/** Drops everything — call on sign-out so the next session starts clean. */
export function clearRequestCache() {
  cache.clear();
  inFlight.clear();
}
