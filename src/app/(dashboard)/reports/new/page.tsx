"use client";

import { usePageHeader } from "@/components/AppShell";
import { ReportEditor } from "@/components/ReportEditor";

export default function NewReportPage() {
  usePageHeader({
    title: "Create weekly report",
    description: "Capture delivery, effort, blockers and your plan for next week.",
  });

  return <ReportEditor />;
}
