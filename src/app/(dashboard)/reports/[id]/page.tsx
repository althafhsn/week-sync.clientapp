"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { PageActions } from "@/components/PageActions";
import { EffortSummaryCard } from "@/components/report-detail/EffortSummaryCard";
import { FeedbackCard } from "@/components/report-detail/FeedbackCard";
import {
  AchievementsBlockersGrid,
  NextWeekCard,
} from "@/components/report-detail/ReportNarrativeCards";
import { ReportWorkCard } from "@/components/report-detail/ReportWorkCard";
import { VersionHistoryCard } from "@/components/report-detail/VersionHistoryCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { weekLabel } from "@/lib/demo-data";
import { apiReportHistoryEntryToVersion, apiReportToWeeklyReport } from "@/lib/api/mappers";
import { findReportStatusId } from "@/lib/api/report-status";
import { getReport, getReportHistory, updateReport } from "@/lib/api/reports-client";
import { useLookups, useStore } from "@/lib/store";
import type { ReportVersion, WeeklyReport } from "@/lib/types";

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, reportStatuses, upsertReport } = useStore();
  const { projectName } = useLookups();
  const [report, setReport] = useState<WeeklyReport | null | undefined>(undefined);
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    getReport(id)
      .then((r) => {
        if (cancelled) return;
        const mapped = apiReportToWeeklyReport(r);
        setReport(mapped.memberId === currentUser.id ? mapped : null);
      })
      .catch(() => {
        if (!cancelled) setReport(null);
      });

    getReportHistory(id)
      .then((entries) => {
        if (!cancelled) setVersions(entries.map(apiReportHistoryEntryToVersion));
      })
      .catch(() => {
        // Non-critical — the card just shows "No history yet." on failure.
      });

    return () => {
      cancelled = true;
    };
  }, [id, currentUser]);

  usePageHeader({
    title: report ? weekLabel(report.weekStart, report.weekEnd) : "Report",
    description:
      report && currentUser
        ? `${projectName(report.projectId)} · ${currentUser.name}`
        : "Report not found",
  });

  if (report === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center text-sm">
        <p>Report not found.</p>
        <Button size="sm" variant="outline" render={<Link href="/reports" />}>
          Back to report history
        </Button>
      </div>
    );
  }

  async function handleSubmit() {
    if (!report || submitting) return;
    const targetId = findReportStatusId(reportStatuses, "submitted");
    if (!targetId) {
      toast.error("Could not submit — try reloading the page.");
      return;
    }
    setSubmitting(true);
    try {
      const saved = await updateReport(report.id, { reportStatusId: targetId });
      const mapped = apiReportToWeeklyReport(saved);
      setReport(mapped);
      upsertReport(mapped);
      toast.success("Report submitted for review.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit the report."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageActions>
        {report.status === "draft" || report.status === "needs_correction" ? (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/reports/${report.id}/edit`} />}
            className="flex items-center gap-2 py-4"
          >
            Edit
          </Button>
        ) : null}
        {report.status === "draft" ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 py-4"
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        ) : null}
      </PageActions>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ReportWorkCard report={report} />
          <AchievementsBlockersGrid report={report} />
          <NextWeekCard report={report} />
        </div>

        <div className="space-y-6">
          <EffortSummaryCard hours={report.hours} />
          <FeedbackCard feedback={report.feedback} />
          <VersionHistoryCard
            reportId={report.id}
            versions={versions}
            approved={report.status === "approved"}
            submittedBy={currentUser?.name}
          />
        </div>
      </div>
    </div>
  );
}
