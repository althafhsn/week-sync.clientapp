import { apiFetch } from "@/lib/api/client-fetch";
import type { PaginatedResult, TaskStatus } from "@/lib/api/types";

export async function listTaskStatuses(): Promise<TaskStatus[]> {
  const result = await apiFetch<PaginatedResult<TaskStatus>>(
    "/api/task-statuses"
  );
  return result.data;
}
