export type Role = "member" | "manager";

export type ReportStatus =
  "draft" | "submitted" | "needs_correction" | "approved";

export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus =
  "completed" | "in_progress" | "blocked" | "carried_over";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  team: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  active: boolean;
  /** Team members who can create reports for this project. */
  memberIds: string[];
}

export interface ReportTask {
  id: string;
  name: string;
  priority: TaskPriority;
  plannedPct: number;
  actualPct: number;
  status: TaskStatus;
  plannedHours: number;
  timeSpent: number;
  deliverable: string;
}

export interface HoursByType {
  development: number;
  testing: number;
  meetings: number;
  documentation: number;
}

export interface ReportVersion {
  version: number;
  at: string;
  action: string;
  by: string;
  note?: string;
  /** Immutable report data captured at this workflow step. */
  snapshot?: Omit<WeeklyReport, "versions">;
}

export interface ManagerFeedback {
  id: string;
  managerId: string;
  at: string;
  decision: "approved" | "changes_requested";
  comment: string;
}

export interface WeeklyReport {
  id: string;
  memberId: string;
  projectId: string;
  weekStart: string;
  weekEnd: string;
  status: ReportStatus;
  tasks: ReportTask[];
  nextWeekTasks: string;
  blockers: string;
  keyBlocker: string;
  achievements: string;
  keyAchievement: string;
  hours: HoursByType;
  notes: string;
  links: string;
  versions: ReportVersion[];
  feedback: ManagerFeedback[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  needs_correction: "Needs Correction",
  approved: "Approved",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  blocked: "Blocked",
  carried_over: "Carried Over",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function totalHours(h: HoursByType) {
  return h.development + h.testing + h.meetings + h.documentation;
}
