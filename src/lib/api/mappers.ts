import { normalizeReportStatus } from "@/lib/api/report-status";
import type {
  Project as ApiProject,
  Report as ApiReport,
  Role as ApiRole,
} from "@/lib/api/types";
import type {
  HighlightEntry,
  HoursByType,
  ManagerFeedback,
  NextWeekTask,
  Project,
  ReportTask,
  User,
  WeeklyReport,
} from "@/lib/types";

const MANAGER_ROLE_NAME = "manager";

interface MappableApiUser {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  mustChangePassword: boolean;
  createdAt?: string;
  role?: ApiRole;
}

/** Maps a real backend user into the UI's `User` shape. Fields the real
 * API doesn't track (team, password) get harmless placeholders — nothing
 * in the UI persists them back. */
export function apiUserToUser(user: MappableApiUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role?.name.toLowerCase() === MANAGER_ROLE_NAME ? "manager" : "member",
    title: user.jobTitle ?? user.role?.name ?? "",
    team: "",
    joinedAt: user.createdAt ?? new Date().toISOString(),
    password: "",
    mustChangePassword: user.mustChangePassword,
  };
}

/** Maps a real backend project into the UI's `Project` shape. */
export function apiProjectToProject(project: ApiProject): Project {
  return {
    id: project.id,
    name: project.name,
    category: "",
    description: project.description ?? "",
    status: project.projectStatus?.name.toLowerCase() === "active" ? "active" : "archived",
    memberIds: (project.userProjects ?? []).map((up) => up.userId),
  };
}

function normalizeHourKey(name: string): keyof HoursByType | null {
  const n = name.toLowerCase();
  if (n.includes("develop")) return "development";
  if (n.includes("test")) return "testing";
  if (n.includes("meet")) return "meetings";
  if (n.includes("document")) return "documentation";
  return null;
}

function mapHours(report: ApiReport): HoursByType {
  const hours: HoursByType = { development: 0, testing: 0, meetings: 0, documentation: 0 };
  for (const entry of report.reportHours ?? []) {
    const key = entry.reportHourType ? normalizeHourKey(entry.reportHourType.name) : null;
    if (key) hours[key] = Number(entry.hours);
  }
  return hours;
}

function mapTasks(report: ApiReport): ReportTask[] {
  return (report.tasks ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    priorityTypeId: t.priorityTypeId,
    priorityName: t.priorityType?.name ?? "",
    plannedPct: t.planned ?? 0,
    actualPct: t.actual ?? 0,
    taskStatusId: t.taskStatusId,
    statusName: t.taskStatus?.name ?? "",
    plannedHours: t.plannedHour ?? 0,
    timeSpent: t.actualHour ?? 0,
    deliverable: t.deliverable ?? "",
  }));
}

function mapNextWeekTasks(report: ApiReport): NextWeekTask[] {
  return (report.reportNextWeekTasks ?? []).map((t) => ({
    id: t.id,
    description: t.description,
  }));
}

function mapHighlights(report: ApiReport): { achievements: HighlightEntry[]; blockers: HighlightEntry[] } {
  const achievements: HighlightEntry[] = [];
  const blockers: HighlightEntry[] = [];
  for (const h of report.reportHighlights ?? []) {
    const entry: HighlightEntry = {
      id: h.id,
      reportHighlightTypeId: h.reportHighlightTypeId,
      typeName: h.reportHighlightType?.name ?? "",
      description: h.description ?? "",
      isKey: h.isKey,
    };
    if (h.reportHighlightType?.category === "BLOCKER") {
      blockers.push(entry);
    } else {
      achievements.push(entry);
    }
  }
  return { achievements, blockers };
}

/** The real backend keeps one status + one review comment per report,
 * not a manager-feedback history — so this synthesizes a single-entry
 * feedback list from that comment whenever the report has been reviewed. */
function mapFeedback(report: ApiReport): ManagerFeedback[] {
  const status = report.reportStatus ? normalizeReportStatus(report.reportStatus.name) : "draft";
  if ((status !== "approved" && status !== "needs_correction") || !report.comment) {
    return [];
  }
  return [
    {
      id: `${report.id}-review`,
      managerId: "",
      at: report.updatedAt,
      decision: status === "approved" ? "approved" : "changes_requested",
      comment: report.comment,
    },
  ];
}

/** Maps a real backend report into the UI's `WeeklyReport` shape. The
 * backend has no version-history concept anymore (single status + comment
 * per report), so `versions` is always empty. */
export function apiReportToWeeklyReport(report: ApiReport): WeeklyReport {
  const status = report.reportStatus
    ? normalizeReportStatus(report.reportStatus.name)
    : "draft";
  const { achievements, blockers } = mapHighlights(report);

  return {
    id: report.id,
    memberId: report.userId,
    projectId: report.projectId,
    weekStart: report.startDate.slice(0, 10),
    weekEnd: report.endDate.slice(0, 10),
    status,
    tasks: mapTasks(report),
    nextWeekTasks: mapNextWeekTasks(report),
    blockers,
    achievements,
    hours: mapHours(report),
    notes: report.notes ?? "",
    links: report.links ?? "",
    versions: [],
    feedback: mapFeedback(report),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    submittedAt: status === "draft" ? undefined : report.updatedAt,
  };
}
