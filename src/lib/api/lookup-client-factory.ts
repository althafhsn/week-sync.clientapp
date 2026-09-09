import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";

/**
 * Builds a `list*` function for a simple GET-only lookup endpoint that
 * returns every page of `T` and caches the result for `LOOKUP_TTL_MS`.
 */
export function makeLookupClient<T>(path: string): () => Promise<T[]> {
  return () => cached(path, () => fetchAllPages<T>(path), LOOKUP_TTL_MS);
}
