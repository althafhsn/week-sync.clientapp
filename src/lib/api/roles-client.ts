import { apiFetch } from "@/lib/api/client-fetch";
import type { PaginatedResult, Role } from "@/lib/api/types";

export async function listRoles(): Promise<Role[]> {
  const result = await apiFetch<PaginatedResult<Role>>("/api/roles");
  return result.data;
}
