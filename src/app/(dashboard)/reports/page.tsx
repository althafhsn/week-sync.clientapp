"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { usePageHeader } from "@/components/AppShell";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { PageActions } from "@/components/PageActions";
import { ReportTable } from "@/components/ReportTable";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { apiReportToWeeklyReport } from "@/lib/api/mappers";
import { findReportStatusId } from "@/lib/api/report-status";
import { listReports, listReportsPage } from "@/lib/api/reports-client";
import { useStore } from "@/lib/store";
import { STATUS_LABEL, type ReportStatus, type WeeklyReport } from "@/lib/types";

export default function ReportHistoryPage() {
  const { currentUser, projects, reportStatuses, hydrated, signedIn } = useStore();

  usePageHeader({
    title: "Report history",
    description: "All of your past weekly reports and their status.",
  });

  const [search, setSearch] = useState("");
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
  }, [status, projectId, weekStart, weekEnd, pageSize]);

  useEffect(() => {
    if (!hydrated || !signedIn || !currentUser) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const reportStatusId =
      status === "all" ? undefined : findReportStatusId(reportStatuses, status as ReportStatus);
    const filters = {
      // A manager's own report history must stay scoped to themself —
      // the backend only auto-restricts non-manager callers.
      userId: currentUser.id,
      projectId: projectId === "all" ? undefined : projectId,
      reportStatusId,
      startDate: weekStart || undefined,
      endDate: weekEnd || undefined,
    };

    const request =
      pageSize === "all"
        ? listReports(undefined, filters).then((data) => ({ data, count: data.length }))
        : listReportsPage(filters, page, Number(pageSize));

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
    currentUser,
    status,
    projectId,
    weekStart,
    weekEnd,
    page,
    pageSize,
    reportStatuses,
  ]);

  // The backend has no full-text search filter, so search narrows only the
  // page of results already fetched from the API.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
      const project = projects.find((p) => p.id === r.projectId);
      return (
        project?.name.toLowerCase().includes(q) ||
        r.tasks.some((t) => t.name.toLowerCase().includes(q))
      );
    });
  }, [reports, search, projects]);

  const pageCount =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(total / Number(pageSize)));

  const filters: FilterConfig[] = [
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
    {
      id: "project",
      label: "Projects",
      value: projectId,
      onChange: setProjectId,
      options: projects.map((p) => ({ value: p.id, label: p.name })),
    },
  ];

  return (
    <div className="space-y-4">
      <PageActions>
        <Button
          size="sm"
          render={<Link href="/reports/new" />}
          className="flex items-center gap-2 py-4"
        >
          <Plus className="size-4" />
          New report
        </Button>
      </PageActions>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by project or task…"
        filters={filters}
        dateRange={{
          startValue: weekStart,
          endValue: weekEnd,
          onStartChange: setWeekStart,
          onEndChange: setWeekEnd,
        }}
        onReset={() => {
          setSearch("");
          setStatus("all");
          setProjectId("all");
          setWeekStart("");
          setWeekEnd("");
        }}
      />
      <p className="text-muted-foreground text-sm">
        {total} report{total === 1 ? "" : "s"} found
      </p>
      <ReportTable
        reports={filtered}
        mode="member"
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
          />
        </div>
      ) : null}
    </div>
  );
}
