import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { TaskStatus } from "@/lib/api/types";

export async function listTaskStatuses(): Promise<TaskStatus[]> {
  return cached(
    "/api/task-statuses",
    () => fetchAllPages<TaskStatus>("/api/task-statuses"),
    LOOKUP_TTL_MS
  );
}
