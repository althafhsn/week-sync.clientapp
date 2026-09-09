"use client";

import { useEffect, useState } from "react";

import { apiReportToWeeklyReport } from "@/lib/api/mappers";
import { findReportStatusId } from "@/lib/api/report-status";
import {
  listReports,
  listReportsPage,
  searchReportsPage,
  REPORT_LIST_INCLUDE_SEARCHABLE,
} from "@/lib/api/reports-client";
import { matchesReportSearchText } from "@/lib/api/report-text-search";
import type { Report, ReportStatus as ApiReportStatus } from "@/lib/api/types";
import type { ReportStatus, WeeklyReport } from "@/lib/types";

export interface UseReportListQueryOptions {
  /** Gates both effects below, e.g. `hydrated && signedIn` (and, for a
   * user-scoped list, `!!currentUser` too). */
  enabled: boolean;
  /** Restricts the list to one user's reports, or leaves it unscoped when
   * undefined. Callers with their own "member" filter compute this from it
   * (`memberId === "all" ? undefined : memberId`); callers scoped to the
   * signed-in user always pass their id. */
  userId?: string;
  reportStatuses: ApiReportStatus[];
}

/**
 * Owns all of the state and data-fetching behind a report list page: the
 * search/AI-search/status/project/date-range filters, pagination, and the
 * two fetch effects (AI search vs. plain filter+search+pagination). Shared
 * by the member "Report history" page and the manager "Reports" page, which
 * differ only in whether they scope by `userId` and in the extra filter
 * columns/actions they render around this.
 */
export function useReportListQuery({
  enabled,
  userId,
  reportStatuses,
}: UseReportListQueryOptions) {
  const [search, setSearch] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [total, setTotal] = useState(0);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [aiMode, aiQuery, search, status, projectId, weekStart, weekEnd, pageSize, userId]);

  // AI mode: runs only when the sparkle button/Enter (re-)submits a query,
  // never on every keystroke, so typing while in AI mode doesn't spam the
  // backend with repeat requests.
  useEffect(() => {
    if (!enabled || !aiMode) return;
    if (!aiQuery.trim()) {
      // Entering AI mode before typing anything shouldn't blank out whatever
      // was already on screen - just wait for the first Enter/query.
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    // AI search ranks by relevance across all of the caller's visible
    // reports; it doesn't yet compose with the status/project/date filters.
    searchReportsPage(aiQuery, page, Number(pageSize === "all" ? 100 : pageSize))
      .then((result) => {
        if (cancelled) return;
        setReports(result.data.map(apiReportToWeeklyReport));
        setTotal(result.count);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, aiMode, aiQuery, page, pageSize]);

  // Plain mode: live text filter + the status/project/date filters, updating
  // as you type — exactly how the search bar behaved before AI search.
  useEffect(() => {
    if (!enabled || aiMode) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const reportStatusId =
      status === "all" ? undefined : findReportStatusId(reportStatuses, status as ReportStatus);
    const filters = {
      userId,
      projectId: projectId === "all" ? undefined : projectId,
      reportStatusId,
      startDate: weekStart || undefined,
      endDate: weekEnd || undefined,
    };

    let request: Promise<{ data: Report[]; count: number }>;
    if (search.trim()) {
      // Fetch everything matching the structured filters, then filter by the
      // typed text and paginate locally so the count and pages stay correct.
      request = listReports(REPORT_LIST_INCLUDE_SEARCHABLE, filters).then((all) => {
        const matched = all.filter((report) => matchesReportSearchText(report, search));
        const size = pageSize === "all" ? matched.length : Number(pageSize);
        const start = pageSize === "all" ? 0 : (page - 1) * size;
        return { data: matched.slice(start, start + size), count: matched.length };
      });
    } else {
      request =
        pageSize === "all"
          ? listReports(undefined, filters).then((data) => ({ data, count: data.length }))
          : listReportsPage(filters, page, Number(pageSize));
    }

    request
      .then((result) => {
        if (cancelled) return;
        setReports(result.data.map(apiReportToWeeklyReport));
        setTotal(result.count);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    aiMode,
    search,
    status,
    projectId,
    weekStart,
    weekEnd,
    page,
    pageSize,
    reportStatuses,
    userId,
  ]);

  const pageCount =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(total / Number(pageSize)));

  return {
    search,
    setSearch,
    aiMode,
    setAiMode,
    aiQuery,
    setAiQuery,
    status,
    setStatus,
    projectId,
    setProjectId,
    weekStart,
    setWeekStart,
    weekEnd,
    setWeekEnd,
    page,
    setPage,
    pageSize,
    setPageSize,
    loading,
    reports,
    total,
    pageCount,
  };
}
