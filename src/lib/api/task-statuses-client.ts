import { apiFetch } from "@/lib/api/client-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PaginatedResult, TaskStatus } from "@/lib/api/types";

export async function listTaskStatuses(): Promise<TaskStatus[]> {
  return cached(
    "/api/task-statuses",
    async () => {
      const result = await apiFetch<PaginatedResult<TaskStatus>>(
        "/api/task-statuses"
      );
      return result.data;
    },
    LOOKUP_TTL_MS
  );
}
