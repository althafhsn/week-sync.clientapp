import { apiFetch } from "@/lib/api/client-fetch";
import { fetchAllPages, fetchPage } from "@/lib/api/pagination-fetch";
import { cached, ENTITY_TTL_MS, invalidate } from "@/lib/api/request-cache";
import type {
  CreateReportWithVersionRequest,
  PaginatedResult,
  Report,
  ReportHistoryDetail,
  ReportHistoryEntry,
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

// The list endpoint returns many rows at once, so it skips the heavier
// nested relations (highlights, next-week tasks) by default; callers that
// need the full nested shape (detail views, create/update responses) use
// REPORT_INCLUDE instead. `tasks`/`reportHours` are still included here
// because list rows (dashboard, history, report tables) display task/hour
// counts and totals computed from them.
export const REPORT_LIST_INCLUDE = ["reportStatus", "tasks", "reportHours"];

// Adds the relations needed to text-match a report against its owner/project
// name, for the plain (non-AI) live search box - not part of the default
// list include since most callers only need the ids already on the report.
export const REPORT_LIST_INCLUDE_SEARCHABLE = [...REPORT_LIST_INCLUDE, "user", "project"];

export interface ListReportsFilters {
  userId?: string;
  projectId?: string;
  reportStatusId?: number;
  startDate?: string;
  endDate?: string;
}

function includeQuery(include?: string[]) {
  return include?.length ? `?include=${include.join(",")}` : "";
}

function listReportsQuery(include?: string[], filters?: ListReportsFilters) {
  const params = new URLSearchParams();
  if (include?.length) params.set("include", include.join(","));
  if (filters?.userId) params.set("filters.userid", filters.userId);
  if (filters?.projectId) params.set("filters.projectid", filters.projectId);
  if (filters?.reportStatusId != null) {
    params.set("filters.reportstatusid", String(filters.reportStatusId));
  }
  if (filters?.startDate) params.set("filters.startdate", filters.startDate);
  if (filters?.endDate) params.set("filters.enddate", filters.endDate);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listReports(
  include: string[] = REPORT_LIST_INCLUDE,
  filters?: ListReportsFilters
): Promise<Report[]> {
  const path = `${CACHE_PREFIX}${listReportsQuery(include, filters)}`;
  return cached(path, () => fetchAllPages<Report>(path), ENTITY_TTL_MS);
}

/** Fetches one page of reports matching `filters`, for pages that drive
 * their own pagination controls instead of loading the full list. */
export async function listReportsPage(
  filters: ListReportsFilters | undefined,
  page: number,
  pageSize: number,
  include: string[] = REPORT_LIST_INCLUDE
): Promise<PaginatedResult<Report>> {
  const path = `${CACHE_PREFIX}${listReportsQuery(include, filters)}`;
  return cached(
    `${path}&page=${page}&pageSize=${pageSize}`,
    () => fetchPage<Report>(path, page, pageSize),
    ENTITY_TTL_MS
  );
}

/** Ranks reports by semantic similarity to `query` (owner/project/status names,
 * dates, etc.) instead of createdAt — a drop-in for listReportsPage when the
 * user is searching rather than browsing. Not cached: search results depend
 * on free-text input that changes on every keystroke. */
export async function searchReportsPage(
  query: string,
  page: number,
  pageSize: number,
  include: string[] = REPORT_LIST_INCLUDE
): Promise<PaginatedResult<Report>> {
  const params = new URLSearchParams({ q: query });
  if (include.length) params.set("include", include.join(","));
  const path = `${CACHE_PREFIX}/search?${params.toString()}`;
  return fetchPage<Report>(path, page, pageSize);
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
  invalidate(`${CACHE_PREFIX}/${id}/history`);
  return report;
}

export async function getReportHistory(id: string): Promise<ReportHistoryEntry[]> {
  const path = `${CACHE_PREFIX}/${id}/history`;
  return cached(
    path,
    () => fetchAllPages<ReportHistoryEntry>(path),
    ENTITY_TTL_MS
  );
}

export async function getReportHistoryEntry(
  id: string,
  historyId: string
): Promise<ReportHistoryDetail> {
  const path = `${CACHE_PREFIX}/${id}/history/${historyId}`;
  return cached(path, () => apiFetch<ReportHistoryDetail>(path), ENTITY_TTL_MS);
}
