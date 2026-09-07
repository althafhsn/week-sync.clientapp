import type { CreateReportTaskInput } from "./create-report-task-input";
import type { CreateReportNextWeekTaskInput } from "./create-report-next-week-task-input";
import type { CreateReportHighlightInput } from "./create-report-highlight-input";
import type { CreateReportHoursInput } from "./create-report-hours-input";

export interface CreateReportWithVersionRequest {
  userId: string;
  projectId: string;
  reportStatusId: number;
  comment?: string;
  notes?: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  links?: string;
  tasks: CreateReportTaskInput[];
  reportNextWeekTasks: CreateReportNextWeekTaskInput[];
  reportHighlights: CreateReportHighlightInput[];
  reportHours: CreateReportHoursInput[];
}
