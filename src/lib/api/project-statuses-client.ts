import { apiFetch } from "@/lib/api/client-fetch";
import type { PaginatedResult, ProjectStatus } from "@/lib/api/types";

export async function listProjectStatuses(): Promise<ProjectStatus[]> {
  const result = await apiFetch<PaginatedResult<ProjectStatus>>(
    "/api/project-statuses"
  );
  return result.data;
}
