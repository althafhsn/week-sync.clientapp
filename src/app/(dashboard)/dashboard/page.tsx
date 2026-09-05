"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
} from "lucide-react";

import { usePageHeader } from "@/components/AppShell";
import { PageActions } from "@/components/PageActions";
import { ReportTable } from "@/components/ReportTable";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { weekLabel } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { totalHours } from "@/lib/types";

export default function MemberDashboardPage() {
  const { currentUser, reports } = useStore();

  const firstName = currentUser?.name.split(" ")[0] ?? "there";

  usePageHeader({
    title: `Welcome back, ${firstName}`,
    description: currentUser
      ? `${currentUser.title} · ${currentUser.team} team`
      : undefined,
  });

  const myReports = currentUser
    ? reports.filter((r) => r.memberId === currentUser.id)
    : [];

  const approved = myReports.filter((r) => r.status === "approved");
  const needsCorrection = myReports.filter(
    (r) => r.status === "needs_correction"
  );
  const approvedPct =
    myReports.length > 0
      ? Math.round((approved.length / myReports.length) * 100)
      : 0;
  const avgHours =
    myReports.length > 0
      ? Math.round(
          myReports.reduce((sum, r) => sum + totalHours(r.hours), 0) /
            myReports.length
        )
      : 0;

  const sorted = [...myReports].sort((a, b) =>
    b.weekStart.localeCompare(a.weekStart)
  );
  const recent = sorted.slice(0, 3);

  return (
    <div className="space-y-6 ">
      <PageActions>
        <Button size="sm" render={<Link href="/reports/new" />} className="flex items-center gap-2 py-4">
          <Plus className="size-4" />
          New weekly report
        </Button>
        <Button size="sm" variant="outline" render={<Link href="/reports" />} className="flex items-center gap-2 py-4">
          View report history
        </Button>
      </PageActions>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ">
        <StatCard
          label="My reports"
          value={myReports.length}
          icon={FileText}
        />
        <StatCard
          label="Approved reports"
          value={approved.length}
          icon={CheckCircle2}
          hint={`${approvedPct}% of total`}
          tone="success"
        />
        <StatCard
          label="Needs correction"
          value={needsCorrection.length}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Average hours"
          value={avgHours}
          icon={Clock}
          tone="info"
        />
      </div>

      {needsCorrection.length > 0 ? (
        <Card className="border-warning/40 bg-warning/10">
          <CardHeader>
            <CardTitle>Action needed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsCorrection.map((report) => {
              const lastComment = report.feedback
                .filter((f) => f.decision === "changes_requested")
                .at(-1);
              return (
                <div
                  key={report.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {weekLabel(report.weekStart, report.weekEnd)}
                    </p>
                    {lastComment ? (
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {lastComment.comment}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0"
                    render={<Link href={`/reports/${report.id}/edit`} />}
                  >
                    Fix and resubmit
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent reports
          </h2>
          {recent.length > 0 ? (
            <div className="hidden gap-2 sm:flex">
              {recent.map((r) => (
                <StatusBadge key={r.id} status={r.status} />
              ))}
            </div>
          ) : null}
        </div>
        <ReportTable reports={sorted} mode="member" />
      </div>
    </div>
  );
}
