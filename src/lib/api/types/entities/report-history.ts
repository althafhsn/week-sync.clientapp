import type { ReportStatus } from "../lookups/report-status";
import type { Task } from "./task";
import type { ReportNextWeekTask } from "./report-next-week-task";
import type { ReportHighlight } from "./report-highlight";
import type { ReportHours } from "./report-hours";

/** A snapshot of a report's content as it existed at one point in its
 * correction cycle (captured right before an edit overwrites it). */
export interface ReportHistorySnapshot {
  tasks: Task[];
  reportNextWeekTasks: ReportNextWeekTask[];
  reportHighlights: ReportHighlight[];
  reportHours: ReportHours[];
}

/** Row shape returned by `GET /reports/:id/history` — deliberately excludes
 * the heavy `snapshot` blob; fetch a single entry for that. */
export interface ReportHistoryEntry {
  id: string;
  reportId: string;
  versionNumber: number;
  reportStatusId: number;
  reportStatus?: ReportStatus;
  comment: string | null;
  notes: string | null;
  startDate: string;
  endDate: string;
  links: string | null;
  submittedAt: string;
  archivedAt: string;
}

/** Row shape returned by `GET /reports/:id/history/:historyId` — the same
 * fields as `ReportHistoryEntry` plus the full content snapshot. */
export interface ReportHistoryDetail extends ReportHistoryEntry {
  snapshot: ReportHistorySnapshot;
}
