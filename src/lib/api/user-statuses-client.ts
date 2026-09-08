import { apiFetch } from "@/lib/api/client-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PaginatedResult, UserStatus } from "@/lib/api/types";

export async function listUserStatuses(): Promise<UserStatus[]> {
  return cached(
    "/api/user-statuses",
    async () => {
      const result = await apiFetch<PaginatedResult<UserStatus>>(
        "/api/user-statuses"
      );
      return result.data;
    },
    LOOKUP_TTL_MS
  );
}
