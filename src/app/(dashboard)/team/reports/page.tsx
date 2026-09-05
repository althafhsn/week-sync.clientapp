"use client";

import { useMemo, useState } from "react";

import { usePageHeader } from "@/components/AppShell";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { ReportTable } from "@/components/ReportTable";
import { weekLabel } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { STATUS_LABEL, type ReportStatus } from "@/lib/types";

export default function TeamReportsPage() {
  const { reports, members, projects } = useStore();

  usePageHeader({
    title: "Team reports",
    description:
      "Search and filter all team reports by member, project, status, and reporting week.",
  });

  const [search, setSearch] = useState("");
  const [memberId, setMemberId] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [status, setStatus] = useState("all");
  const [week, setWeek] = useState("all");

  const usedWeeks = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach((r) => map.set(r.weekStart, r.weekEnd));
    return Array.from(map.entries())
      .map(([start, end]) => ({ start, end }))
      .sort((a, b) => b.start.localeCompare(a.start));
  }, [reports]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports
      .filter((r) => (memberId === "all" ? true : r.memberId === memberId))
      .filter((r) => (projectId === "all" ? true : r.projectId === projectId))
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (week === "all" ? true : r.weekStart === week))
      .filter((r) => {
        if (!q) return true;
        const member = members.find((m) => m.id === r.memberId);
        const project = projects.find((p) => p.id === r.projectId);
        return (
          member?.name.toLowerCase().includes(q) ||
          project?.name.toLowerCase().includes(q) ||
          r.tasks.some((t) => t.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [reports, memberId, projectId, status, week, search, members, projects]);

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
    {
      id: "week",
      label: "Weeks",
      value: week,
      onChange: setWeek,
      options: usedWeeks.map((w) => ({
        value: w.start,
        label: weekLabel(w.start, w.end),
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
        onReset={() => {
          setSearch("");
          setMemberId("all");
          setProjectId("all");
          setStatus("all");
          setWeek("all");
        }}
      />
      <p className="text-muted-foreground text-sm">
        {filtered.length} report{filtered.length === 1 ? "" : "s"} found
      </p>
      <ReportTable reports={filtered} mode="manager" showMember />
    </div>
  );
}
