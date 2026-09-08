export type Role = "member" | "manager";

export type ReportStatus =
  "draft" | "submitted" | "needs_correction" | "approved";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  team: string;
  joinedAt: string;
  password: string;
  /** True until the user sets their own password after an admin-issued temporary one. */
  mustChangePassword: boolean;
}

export type ProjectStatus = "proposed" | "active" | "archived";

export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  status: ProjectStatus;
  /** Team members who can create reports for this project. */
  memberIds: string[];
}

export interface NextWeekTask {
  id: string;
  description: string;
}

// Backed by the real report-highlight-types lookup ({id, name, category}).
// The id/name are denormalized onto the entry itself so display doesn't
// need a network round trip; achievements vs blockers is just which
// category of highlight-type the entry was created from.
export interface HighlightEntry {
  id: string;
  reportHighlightTypeId: number;
  typeName: string;
  description: string;
  /** Only one entry in the list should be flagged as key at a time. */
  isKey: boolean;
}

export interface ReportTask {
  id: string;
  name: string;
  priorityTypeId: number;
  priorityName: string;
  plannedPct: number;
  actualPct: number;
  taskStatusId: number;
  statusName: string;
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

export interface ReportVersionSnapshot {
  tasks: ReportTask[];
  nextWeekTasks: NextWeekTask[];
  achievements: HighlightEntry[];
  blockers: HighlightEntry[];
  hours: HoursByType;
  notes: string;
  links: string;
}

export interface ReportVersion {
  /** Backend history-entry id, used to fetch the full snapshot on demand. */
  id?: string;
  version: number;
  /** When the manager's review left this version archived (superseded by an edit). */
  at: string;
  action: string;
  /** Who made the change — omitted where the backend doesn't track it. */
  by?: string;
  note?: string;
  /** When this version was originally submitted, before it was reviewed. */
  submittedAt?: string;
  weekStart?: string;
  weekEnd?: string;
  notes?: string;
  links?: string;
  /** Immutable report content captured at this workflow step. Fetched on
   * demand, so absent until the version has been expanded. */
  snapshot?: ReportVersionSnapshot;
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
  nextWeekTasks: NextWeekTask[];
  blockers: HighlightEntry[];
  achievements: HighlightEntry[];
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

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  proposed: "Proposed",
  active: "Active",
  archived: "Archived",
};

export function totalHours(h: HoursByType) {
  return h.development + h.testing + h.meetings + h.documentation;
}
