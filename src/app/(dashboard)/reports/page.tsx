"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { usePageHeader } from "@/components/AppShell";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { PageActions } from "@/components/PageActions";
import { ReportTable } from "@/components/ReportTable";
import { Button } from "@/components/ui/button";
import { weekLabel } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { STATUS_LABEL, type ReportStatus } from "@/lib/types";

export default function ReportHistoryPage() {
  const { currentUser, reports, projects } = useStore();

  usePageHeader({
    title: "Report history",
    description: "All of your past weekly reports and their status.",
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [week, setWeek] = useState("all");

  const myReports = useMemo(
    () =>
      currentUser
        ? reports.filter((r) => r.memberId === currentUser.id)
        : [],
    [reports, currentUser]
  );

  const myProjects = useMemo(
    () =>
      projects.filter((p) => myReports.some((r) => r.projectId === p.id)),
    [projects, myReports]
  );

  const myWeeks = useMemo(() => {
    const map = new Map<string, string>();
    myReports.forEach((r) => map.set(r.weekStart, r.weekEnd));
    return Array.from(map.entries())
      .map(([start, end]) => ({ start, end }))
      .sort((a, b) => b.start.localeCompare(a.start));
  }, [myReports]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myReports
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (projectId === "all" ? true : r.projectId === projectId))
      .filter((r) => (week === "all" ? true : r.weekStart === week))
      .filter((r) => {
        if (!q) return true;
        const project = projects.find((p) => p.id === r.projectId);
        return (
          project?.name.toLowerCase().includes(q) ||
          r.tasks.some((t) => t.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  }, [myReports, status, projectId, week, search, projects]);

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
      options: myProjects.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      id: "week",
      label: "Weeks",
      value: week,
      onChange: setWeek,
      options: myWeeks.map((w) => ({
        value: w.start,
        label: weekLabel(w.start, w.end),
      })),
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
        onReset={() => {
          setSearch("");
          setStatus("all");
          setProjectId("all");
          setWeek("all");
        }}
      />
      <p className="text-muted-foreground text-sm">
        {filtered.length} report{filtered.length === 1 ? "" : "s"} found
      </p>
      <ReportTable reports={filtered} mode="member" />
    </div>
  );
}
