import type { ReportStatus as ApiReportStatus } from "@/lib/api/types";
import type { ReportStatus } from "@/lib/types";

/** Maps a real backend report-status name to the UI's status union, by
 * keyword rather than exact string match, since the seeded name text
 * ("Needs Correction" vs "Changes Requested", etc.) isn't guaranteed. */
export function normalizeReportStatus(name: string): ReportStatus {
  const n = name.toLowerCase();
  if (n.includes("approve")) return "approved";
  if (n.includes("correct") || n.includes("reject") || n.includes("change")) {
    return "needs_correction";
  }
  if (n.includes("submit")) return "submitted";
  return "draft";
}

export function findReportStatusId(
  statuses: ApiReportStatus[],
  target: ReportStatus
): number | undefined {
  return statuses.find((s) => normalizeReportStatus(s.name) === target)?.id;
}
