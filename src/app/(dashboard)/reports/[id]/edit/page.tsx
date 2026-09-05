"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { usePageHeader } from "@/components/AppShell";
import { ReportEditor } from "@/components/ReportEditor";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function EditReportPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, reports } = useStore();

  const report = reports.find(
    (r) => r.id === id && r.memberId === currentUser?.id
  );

  const editable =
    report && (report.status === "draft" || report.status === "needs_correction");

  usePageHeader({
    title: "Edit report",
    description: report ? undefined : "Report not found",
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

  if (!editable) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center text-sm">
        <p>This report is read-only in its current status.</p>
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/reports/${report.id}`} />}
        >
          View report
        </Button>
      </div>
    );
  }

  return <ReportEditor existing={report} />;
}
