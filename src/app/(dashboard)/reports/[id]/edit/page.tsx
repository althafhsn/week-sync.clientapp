"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { usePageHeader } from "@/components/AppShell";
import { ReportEditor } from "@/components/ReportEditor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiReportToWeeklyReport } from "@/lib/api/mappers";
import { getReport } from "@/lib/api/reports-client";
import { useStore } from "@/lib/store";
import type { WeeklyReport } from "@/lib/types";

export default function EditReportPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useStore();
  const [report, setReport] = useState<WeeklyReport | null | undefined>(undefined);

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

    return () => {
      cancelled = true;
    };
  }, [id, currentUser]);

  const editable =
    report && (report.status === "draft" || report.status === "needs_correction");

  usePageHeader({
    title: "Edit report",
    description: report ? undefined : "Report not found",
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
