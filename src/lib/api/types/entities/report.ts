import type { ReportStatus } from "../lookups/report-status";
import type { User } from "./user";
import type { Project } from "./project";
import type { Task } from "./task";
import type { ReportNextWeekTask } from "./report-next-week-task";
import type { ReportHighlight } from "./report-highlight";
import type { ReportHours } from "./report-hours";

export interface Report {
  id: string;
  userId: string;
  projectId: string;
  reportStatusId: number;
  comment: string | null;
  notes: string | null;
  startDate: string;
  endDate: string;
  links: string | null;
  createdAt: string;
  updatedAt: string;
  // present only when requested via ?include=
  user?: User;
  project?: Project;
  reportStatus?: ReportStatus;
  tasks?: Task[];
  reportNextWeekTasks?: ReportNextWeekTask[];
  reportHighlights?: ReportHighlight[];
  reportHours?: ReportHours[];
}
