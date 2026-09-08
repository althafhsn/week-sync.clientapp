import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { Role } from "@/lib/api/types";

export async function listRoles(): Promise<Role[]> {
  return cached(
    "/api/roles",
    () => fetchAllPages<Role>("/api/roles"),
    LOOKUP_TTL_MS
  );
}
