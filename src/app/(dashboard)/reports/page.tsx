"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { usePageHeader } from "@/components/AppShell";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { PageActions } from "@/components/PageActions";
import { ReportTable } from "@/components/ReportTable";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useReportListQuery } from "@/lib/use-report-list-query";
import { useStore } from "@/lib/store";
import { STATUS_LABEL, type ReportStatus } from "@/lib/types";

export default function ReportHistoryPage() {
  const { currentUser, projects, reportStatuses, hydrated, signedIn } = useStore();

  usePageHeader({
    title: "Report history",
    description: "All of your past weekly reports and their status.",
  });

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
    // A manager's own report history must stay scoped to themself — the
    // backend only auto-restricts non-manager callers.
    enabled: hydrated && signedIn && !!currentUser,
    userId: currentUser?.id,
    reportStatuses,
  });

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
        reports={reports}
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
            total={total}
          />
        </div>
      ) : null}
    </div>
  );
}
