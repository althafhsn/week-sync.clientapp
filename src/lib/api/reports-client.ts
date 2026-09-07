import { apiFetch } from "@/lib/api/client-fetch";
import { cached, ENTITY_TTL_MS, invalidate } from "@/lib/api/request-cache";
import type {
  CreateReportWithVersionRequest,
  PaginatedResult,
  Report,
  UpdateReportRequest,
} from "@/lib/api/types";

const CACHE_PREFIX = "/api/reports";

export const REPORT_INCLUDE = [
  "user",
  "project",
  "reportStatus",
  "tasks",
  "reportNextWeekTasks",
  "reportHighlights",
  "reportHours",
];

// The list endpoint returns many rows at once, so it only pulls the status
// lookup by default; callers that need the full nested shape (detail views,
// create/update responses) use REPORT_INCLUDE instead.
export const REPORT_LIST_INCLUDE = ["reportStatus"];

export interface ListReportsFilters {
  userId?: string;
  projectId?: string;
}

function includeQuery(include?: string[]) {
  return include?.length ? `?include=${include.join(",")}` : "";
}

function listReportsQuery(include?: string[], filters?: ListReportsFilters) {
  const params = new URLSearchParams();
  if (include?.length) params.set("include", include.join(","));
  if (filters?.userId) params.set("filters.userid", filters.userId);
  if (filters?.projectId) params.set("filters.projectid", filters.projectId);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listReports(
  include: string[] = REPORT_LIST_INCLUDE,
  filters?: ListReportsFilters
): Promise<Report[]> {
  const path = `${CACHE_PREFIX}${listReportsQuery(include, filters)}`;
  return cached(
    path,
    async () => {
      const result = await apiFetch<PaginatedResult<Report>>(path);
      return result.data;
    },
    ENTITY_TTL_MS
  );
}

export async function getReport(
  id: string,
  include: string[] = REPORT_INCLUDE
): Promise<Report> {
  const path = `${CACHE_PREFIX}/${id}${includeQuery(include)}`;
  return cached(path, () => apiFetch<Report>(path), ENTITY_TTL_MS);
}

export async function createReportWithVersion(
  payload: CreateReportWithVersionRequest,
  include: string[] = REPORT_INCLUDE
): Promise<Report> {
  const report = await apiFetch<Report>(
    `${CACHE_PREFIX}${includeQuery(include)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  invalidate(CACHE_PREFIX);
  return report;
}

export async function updateReport(
  id: string,
  payload: UpdateReportRequest,
  include: string[] = REPORT_INCLUDE
): Promise<Report> {
  const report = await apiFetch<Report>(
    `${CACHE_PREFIX}/${id}${includeQuery(include)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  invalidate(CACHE_PREFIX);
  return report;
}
