"use client";

import { useEffect, useState } from "react";

import { usePageHeader } from "@/components/AppShell";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { ReportTable } from "@/components/ReportTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { apiReportToWeeklyReport } from "@/lib/api/mappers";
import { findReportStatusId } from "@/lib/api/report-status";
import {
  listReports,
  listReportsPage,
  searchReportsPage,
  REPORT_LIST_INCLUDE_SEARCHABLE,
} from "@/lib/api/reports-client";
import { matchesReportSearchText } from "@/lib/api/report-text-search";
import type { Report } from "@/lib/api/types";
import { useStore } from "@/lib/store";
import { STATUS_LABEL, type ReportStatus, type WeeklyReport } from "@/lib/types";

export default function TeamReportsPage() {
  const { members, projects, reportStatuses, hydrated, signedIn } = useStore();

  usePageHeader({
    title: "Reports",
    description:
      "Search and filter all team reports by member, project, status, and reporting week.",
  });

  const [search, setSearch] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [memberId, setMemberId] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [status, setStatus] = useState("all");
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
  }, [aiMode, aiQuery, search, memberId, projectId, status, weekStart, weekEnd, pageSize]);

  // AI mode: runs only when the sparkle button/Enter (re-)submits a query,
  // never on every keystroke, so typing while in AI mode doesn't spam the
  // backend with repeat requests.
  useEffect(() => {
    if (!hydrated || !signedIn || !aiMode) return;
    if (!aiQuery.trim()) {
      // Entering AI mode before typing anything shouldn't blank out whatever
      // was already on screen - just wait for the first Enter/query.
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    // AI search ranks by relevance across all reports the caller can see; it
    // doesn't yet compose with the member/project/status/date filters below.
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
  }, [hydrated, signedIn, aiMode, aiQuery, page, pageSize]);

  // Plain mode: live text filter + the member/project/status/date filters,
  // updating as you type — exactly how the search bar behaved before AI search.
  useEffect(() => {
    if (!hydrated || !signedIn || aiMode) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const reportStatusId =
      status === "all" ? undefined : findReportStatusId(reportStatuses, status as ReportStatus);
    const filters = {
      userId: memberId === "all" ? undefined : memberId,
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
    hydrated,
    signedIn,
    aiMode,
    search,
    memberId,
    projectId,
    status,
    weekStart,
    weekEnd,
    page,
    pageSize,
    reportStatuses,
  ]);

  const pageCount =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(total / Number(pageSize)));

  const filters: FilterConfig[] = [
    {
      id: "member",
      label: "Members",
      value: memberId,
      onChange: setMemberId,
      options: members.map((m) => ({ value: m.id, label: m.name })),
    },
    {
      id: "project",
      label: "Projects",
      value: projectId,
      onChange: setProjectId,
      options: projects.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      id: "status",
      label: "Statuses",
      value: status,
      onChange: setStatus,
      options: (Object.keys(STATUS_LABEL) as ReportStatus[]).map((s) => ({
        value: s,
        label: STATUS_LABEL[s],
      })),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        aiActive={aiMode}
        onAiSearch={() => {
          setAiMode(true);
          setAiQuery(search.trim());
        }}
        onExitAiMode={() => {
          setAiMode(false);
          setAiQuery("");
        }}
        searchPlaceholder={aiMode ? "Search with AI… (press Enter)" : "Search reports…"}
        filters={filters}
        dateRange={{
          startValue: weekStart,
          endValue: weekEnd,
          onStartChange: setWeekStart,
          onEndChange: setWeekEnd,
        }}
        onReset={() => {
          setSearch("");
          setAiMode(false);
          setAiQuery("");
          setMemberId("all");
          setProjectId("all");
          setStatus("all");
          setWeekStart("");
          setWeekEnd("");
        }}
      />
      <p className="text-muted-foreground text-sm">
        {total} report{total === 1 ? "" : "s"} found
      </p>
      <ReportTable
        reports={reports}
        mode="manager"
        showMember
        loading={loading}
        skeletonRows={pageSize === "all" ? 10 : Number(pageSize)}
        paginated
      />
      {!loading ? (
        <div className="bg-background sticky bottom-0 border-t border-border pt-2">
          <PaginationControls
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            total={total}
          />
        </div>
      ) : null}
    </div>
  );
}
