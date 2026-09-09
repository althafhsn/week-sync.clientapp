"use client";

import { useState } from "react";

import { usePageHeader } from "@/components/AppShell";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { ReportTable } from "@/components/ReportTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useReportListQuery } from "@/lib/use-report-list-query";
import { useStore } from "@/lib/store";
import { STATUS_LABEL, type ReportStatus } from "@/lib/types";

export default function TeamReportsPage() {
  const { members, projects, reportStatuses, hydrated, signedIn } = useStore();

  usePageHeader({
    title: "Reports",
    description:
      "Search and filter all team reports by member, project, status, and reporting week.",
  });

  const [memberId, setMemberId] = useState("all");

  const {
    search,
    setSearch,
    aiMode,
    setAiMode,
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
  } = useReportListQuery({
    enabled: hydrated && signedIn,
    userId: memberId === "all" ? undefined : memberId,
    reportStatuses,
  });

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
