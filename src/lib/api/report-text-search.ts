import type { Report } from "@/lib/api/types";

/** Plain (non-AI) substring match used for live-as-you-type filtering of an
 * already-fetched report list, across the fields a user would recognize a
 * report by. Case-insensitive. */
export function matchesReportSearchText(report: Report, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    report.user?.name,
    report.project?.name,
    report.reportStatus?.name,
    report.comment,
    report.notes,
    report.links,
  ];

  return haystack.some((value) => value?.toLowerCase().includes(needle));
}
