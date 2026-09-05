"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { weekLabel } from "@/lib/demo-data";
import { useLookups, useStore } from "@/lib/store";

const DEFAULT_APPROVAL_COMMENT =
  "Clear report — looks good, no changes needed.";

export default function ReviewReportPage() {
  const { id } = useParams<{ id: string }>();
  const { reports, reviewReport } = useStore();
  const { userName, projectName } = useLookups();
  const [comment, setComment] = useState("");

  const report = reports.find((r) => r.id === id);
  const isSubmitted = report?.status === "submitted";

  usePageHeader({
    title: "Review weekly report",
    description: report
      ? `${userName(report.memberId)} · ${weekLabel(report.weekStart)} · ${projectName(report.projectId)}`
      : "Report not found",
  });

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

  function handleDecision(decision: "approved" | "changes_requested") {
    if (decision === "changes_requested" && !comment.trim()) {
      toast.error("Add a comment explaining what needs to change.");
      return;
    }
    reviewReport(
      report!.id,
      decision,
      comment.trim() || DEFAULT_APPROVAL_COMMENT
    );
    toast.success(
      decision === "approved" ? "Report approved." : "Changes requested."
    );
    setComment("");
  }

  return (
    <div className="space-y-6">
      <PageActions>
        <Button size="sm" variant="outline" render={<Link href="/team/reports" />}>
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
                disabled={!isSubmitted}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  className="bg-success text-success-foreground hover:bg-success/85 flex-1"
                  disabled={!isSubmitted}
                  onClick={() => handleDecision("approved")}
                >
                  Approve report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={!isSubmitted}
                  onClick={() => handleDecision("changes_requested")}
                >
                  Request corrections
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
