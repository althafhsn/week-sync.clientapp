import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { ProjectStatus } from "@/lib/api/types";

export async function listProjectStatuses(): Promise<ProjectStatus[]> {
  return cached(
    "/api/project-statuses",
    () => fetchAllPages<ProjectStatus>("/api/project-statuses"),
    LOOKUP_TTL_MS
  );
}
