"use client";

import { useEffect, useMemo, useState } from "react";

import { usePageHeader } from "@/components/AppShell";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { ReportTable } from "@/components/ReportTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { apiReportToWeeklyReport } from "@/lib/api/mappers";
import { findReportStatusId } from "@/lib/api/report-status";
import { listReportsPage } from "@/lib/api/reports-client";
import { useStore } from "@/lib/store";
import { STATUS_LABEL, type ReportStatus, type WeeklyReport } from "@/lib/types";

const PAGE_SIZE = 10;

export default function TeamReportsPage() {
  const { members, projects, reportStatuses, hydrated, signedIn } = useStore();

  usePageHeader({
    title: "Team reports",
    description:
      "Search and filter all team reports by member, project, status, and reporting week.",
  });

  const [search, setSearch] = useState("");
  const [memberId, setMemberId] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [status, setStatus] = useState("all");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [total, setTotal] = useState(0);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [memberId, projectId, status, weekStart, weekEnd]);

  useEffect(() => {
    if (!hydrated || !signedIn) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const reportStatusId =
      status === "all" ? undefined : findReportStatusId(reportStatuses, status as ReportStatus);

    listReportsPage(
      {
        userId: memberId === "all" ? undefined : memberId,
        projectId: projectId === "all" ? undefined : projectId,
        reportStatusId,
        startDate: weekStart || undefined,
        endDate: weekEnd || undefined,
      },
      page,
      PAGE_SIZE
    )
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
  }, [hydrated, signedIn, memberId, projectId, status, weekStart, weekEnd, page, reportStatuses]);

  // The backend has no full-text search filter, so search narrows only the
  // page of results already fetched from the API.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
      const member = members.find((m) => m.id === r.memberId);
      const project = projects.find((p) => p.id === r.projectId);
      return (
        member?.name.toLowerCase().includes(q) ||
        project?.name.toLowerCase().includes(q) ||
        r.tasks.some((t) => t.name.toLowerCase().includes(q))
      );
    });
  }, [reports, search, members, projects]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
        searchPlaceholder="Search by member, project, or task…"
        filters={filters}
        dateRange={{
          startValue: weekStart,
          endValue: weekEnd,
          onStartChange: setWeekStart,
          onEndChange: setWeekEnd,
        }}
        onReset={() => {
          setSearch("");
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
      <ReportTable reports={filtered} mode="manager" showMember loading={loading} />
      {!loading ? (
        <PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
