import type { ReportStatus } from "../lookups/report-status";
import type { Task } from "./task";
import type { ReportHighlight } from "./report-highlight";
import type { ReportHours } from "./report-hours";
import type { ReportReviewAction } from "./report-review-action";

export interface ReportVersion {
  id: string;
  reportId: string;
  reportStatusId: string;
  notes: string | null;
  startDate: string;
  endDate: string;
  links: string | null;
  createdAt: string;
  // present only on findOne (always included there)
  reportStatus?: ReportStatus;
  tasks?: Task[];
  reportHighlights?: ReportHighlight[];
  reportHours?: ReportHours[];
  reportReviewAction?: ReportReviewAction | null;
}
