"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { PageActions } from "@/components/PageActions";
import { EffortSummaryCard } from "@/components/report-detail/EffortSummaryCard";
import {
  AchievementsBlockersGrid,
  NextWeekCard,
} from "@/components/report-detail/ReportNarrativeCards";
import { ReportWorkCard } from "@/components/report-detail/ReportWorkCard";
import { VersionHistoryCard } from "@/components/report-detail/VersionHistoryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { weekLabel } from "@/lib/demo-data";
import { apiReportHistoryEntryToVersion, apiReportToWeeklyReport } from "@/lib/api/mappers";
import { findReportStatusId } from "@/lib/api/report-status";
import { getReport, getReportHistory, updateReport } from "@/lib/api/reports-client";
import { useLookups, useStore } from "@/lib/store";
import { getErrorMessage } from "@/lib/utils";
import type { ReportVersion, WeeklyReport } from "@/lib/types";

const DEFAULT_APPROVAL_COMMENT =
  "Clear report — looks good, no changes needed.";

export default function ReviewReportPage() {
  const { id } = useParams<{ id: string }>();
  const { reportStatuses, upsertReport } = useStore();
  const { userName, projectName } = useLookups();
  const [report, setReport] = useState<WeeklyReport | null | undefined>(undefined);
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getReport(id)
      .then((r) => {
        if (cancelled) return;
        const mapped = apiReportToWeeklyReport(r);
        // Drafts are the member's own unpublished working copy — a manager
        // can't view or review one, even by guessing/bookmarking its URL.
        setReport(mapped.status === "draft" ? null : mapped);
        setComment(mapped.feedback[0]?.comment ?? "");
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
  }, [id]);

  const isSubmitted = report?.status === "submitted";

  usePageHeader({
    title: "Review weekly report",
    description: report
      ? `${userName(report.memberId)} · ${weekLabel(report.weekStart, report.weekEnd)} · ${projectName(report.projectId)}`
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
        <Button size="sm" variant="outline" render={<Link href="/team/reports" />}>
          Back to team reports
        </Button>
      </div>
    );
  }

  async function handleDecision(decision: "approved" | "changes_requested") {
    if (!report || submitting) return;
    if (decision === "changes_requested" && !comment.trim()) {
      toast.error("Add a comment explaining what needs to change.");
      return;
    }
    const targetId = findReportStatusId(
      reportStatuses,
      decision === "approved" ? "approved" : "needs_correction"
    );
    if (!targetId) {
      toast.error("Could not submit the review — try reloading the page.");
      return;
    }

    setSubmitting(true);
    try {
      const saved = await updateReport(report.id, {
        reportStatusId: targetId,
        comment: comment.trim() || DEFAULT_APPROVAL_COMMENT,
      });
      const mapped = apiReportToWeeklyReport(saved);
      setReport(mapped);
      upsertReport(mapped);
      toast.success(
        decision === "approved" ? "Report approved." : "Changes requested."
      );
      // Reflect what was actually saved rather than blanking the box — the
      // textarea becomes disabled right below, so this is the only place the
      // manager can still see the comment they just recorded.
      setComment(mapped.feedback[0]?.comment ?? comment.trim() ?? DEFAULT_APPROVAL_COMMENT);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit the review."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageActions>
        <Button
          size="sm"
          variant="outline"
          render={<Link href="/team/reports" />}
          className="flex items-center gap-2 py-4"
        >
          All reports
        </Button>
      </PageActions>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ReportWorkCard report={report} title="Delivery" />
          <AchievementsBlockersGrid report={report} />
          <NextWeekCard report={report} />
        </div>

        <div className="space-y-6">
          <EffortSummaryCard hours={report.hours} title="Effort recorded" />

          <Card>
            <CardHeader>
              <CardTitle>Review decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isSubmitted ? (
                <p className="text-muted-foreground text-sm">
                  This report has already been reviewed and is read-only.
                </p>
              ) : null}
              <Textarea
                rows={4}
                placeholder="Leave a comment for the team member…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!isSubmitted || submitting}
              />
              <div className="flex flex-row gap-2">
                <Button
                  type="button"
                  className="bg-success text-success-foreground hover:bg-success/85 h-11 flex-1 sm:h-9"
                  disabled={!isSubmitted || submitting}
                  onClick={() => handleDecision("approved")}
                >
                  Approve report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 sm:h-9"
                  disabled={!isSubmitted || submitting}
                  onClick={() => handleDecision("changes_requested")}
                >
                  Request corrections
                </Button>
              </div>
            </CardContent>
          </Card>

          <VersionHistoryCard
            reportId={report.id}
            versions={versions}
            approved={report.status === "approved"}
            submittedBy={userName(report.memberId)}
          />
        </div>
      </div>
    </div>
  );
}
