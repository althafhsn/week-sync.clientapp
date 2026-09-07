import { apiFetch } from "@/lib/api/client-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PaginatedResult, PriorityType } from "@/lib/api/types";

export async function listPriorityTypes(): Promise<PriorityType[]> {
  return cached(
    "/api/priority-types",
    async () => {
      const result = await apiFetch<PaginatedResult<PriorityType>>(
        "/api/priority-types"
      );
      return result.data;
    },
    LOOKUP_TTL_MS
  );
}
