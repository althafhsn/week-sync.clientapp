import { apiFetch } from "@/lib/api/client-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PaginatedResult, ProjectStatus } from "@/lib/api/types";

export async function listProjectStatuses(): Promise<ProjectStatus[]> {
  return cached(
    "/api/project-statuses",
    async () => {
      const result = await apiFetch<PaginatedResult<ProjectStatus>>(
        "/api/project-statuses"
      );
      return result.data;
    },
    LOOKUP_TTL_MS
  );
}
