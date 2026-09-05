"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { EffortSummaryCard } from "@/components/report-detail/EffortSummaryCard";
import { FeedbackCard } from "@/components/report-detail/FeedbackCard";
import {
  AchievementsBlockersGrid,
  NextWeekCard,
} from "@/components/report-detail/ReportNarrativeCards";
import { ReportWorkCard } from "@/components/report-detail/ReportWorkCard";
import { VersionHistoryCard } from "@/components/report-detail/VersionHistoryCard";
import { Button } from "@/components/ui/button";
import { weekLabel } from "@/lib/demo-data";
import { useLookups, useStore } from "@/lib/store";

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, reports, submitReport } = useStore();
  const { projectName } = useLookups();

  const report = reports.find(
    (r) => r.id === id && r.memberId === currentUser?.id
  );

  usePageHeader({
    title: report ? weekLabel(report.weekStart) : "Report",
    description:
      report && currentUser
        ? `${projectName(report.projectId)} · ${currentUser.name}`
        : "Report not found",
    actions: report ? (
      <>
        <Button size="sm" variant="outline" render={<Link href="/reports" />}>
          History
        </Button>
        {report.status === "draft" || report.status === "needs_correction" ? (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/reports/${report.id}/edit`} />}
          >
            Edit
          </Button>
        ) : null}
        {report.status === "draft" ? (
          <Button
            size="sm"
            onClick={() => {
              submitReport(report.id);
              toast.success("Report submitted for review.");
            }}
          >
            Submit
          </Button>
        ) : null}
      </>
    ) : undefined,
  });

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

  return (
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
          versions={report.versions}
          approved={report.status === "approved"}
        />
      </div>
    </div>
  );
}
