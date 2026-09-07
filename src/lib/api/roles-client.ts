import { apiFetch } from "@/lib/api/client-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PaginatedResult, Role } from "@/lib/api/types";

export async function listRoles(): Promise<Role[]> {
  return cached(
    "/api/roles",
    async () => {
      const result = await apiFetch<PaginatedResult<Role>>("/api/roles");
      return result.data;
    },
    LOOKUP_TTL_MS
  );
}
