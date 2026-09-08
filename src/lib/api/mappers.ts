import { normalizeReportStatus } from "@/lib/api/report-status";
import type {
  Project as ApiProject,
  Report as ApiReport,
  ReportHighlight as ApiReportHighlight,
  ReportHistoryDetail,
  ReportHistoryEntry,
  ReportHours as ApiReportHours,
  ReportNextWeekTask as ApiReportNextWeekTask,
  Role as ApiRole,
  Task as ApiTask,
} from "@/lib/api/types";
import type {
  HighlightEntry,
  HoursByType,
  ManagerFeedback,
  NextWeekTask,
  Project,
  ReportTask,
  ReportVersion,
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

function mapHours(entries: ApiReportHours[] | undefined): HoursByType {
  const hours: HoursByType = { development: 0, testing: 0, meetings: 0, documentation: 0 };
  for (const entry of entries ?? []) {
    const key = entry.reportHourType ? normalizeHourKey(entry.reportHourType.name) : null;
    if (key) hours[key] = Number(entry.hours);
  }
  return hours;
}

function mapTasks(tasks: ApiTask[] | undefined): ReportTask[] {
  return (tasks ?? []).map((t) => ({
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

function mapNextWeekTasks(tasks: ApiReportNextWeekTask[] | undefined): NextWeekTask[] {
  return (tasks ?? []).map((t) => ({
    id: t.id,
    description: t.description,
  }));
}

function mapHighlights(
  highlights: ApiReportHighlight[] | undefined
): { achievements: HighlightEntry[]; blockers: HighlightEntry[] } {
  const achievements: HighlightEntry[] = [];
  const blockers: HighlightEntry[] = [];
  for (const h of highlights ?? []) {
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

/** Maps a real backend report into the UI's `WeeklyReport` shape.
 * `versions` isn't populated here — it comes from a separate history-list
 * call (see `apiReportHistoryEntryToVersion`), fetched alongside the report. */
export function apiReportToWeeklyReport(report: ApiReport): WeeklyReport {
  const status = report.reportStatus
    ? normalizeReportStatus(report.reportStatus.name)
    : "draft";
  const { achievements, blockers } = mapHighlights(report.reportHighlights);

  return {
    id: report.id,
    memberId: report.userId,
    projectId: report.projectId,
    weekStart: report.startDate.slice(0, 10),
    weekEnd: report.endDate.slice(0, 10),
    status,
    tasks: mapTasks(report.tasks),
    nextWeekTasks: mapNextWeekTasks(report.reportNextWeekTasks),
    blockers,
    achievements,
    hours: mapHours(report.reportHours),
    notes: report.notes ?? "",
    links: report.links ?? "",
    versions: [],
    feedback: mapFeedback(report),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    submittedAt: status === "draft" ? undefined : report.updatedAt,
  };
}

/** Maps a history list row (no snapshot) into the UI's `ReportVersion`
 * shape. The backend doesn't track who made the edit, so `by` is omitted;
 * everything else here comes free with the list response — no extra fetch. */
export function apiReportHistoryEntryToVersion(entry: ReportHistoryEntry): ReportVersion {
  return {
    id: entry.id,
    version: entry.versionNumber,
    at: entry.archivedAt,
    action: entry.reportStatus?.name ?? "Needs Correction",
    note: entry.comment ?? undefined,
    submittedAt: entry.submittedAt,
    weekStart: entry.startDate.slice(0, 10),
    weekEnd: entry.endDate.slice(0, 10),
    notes: entry.notes ?? undefined,
    links: entry.links ?? undefined,
  };
}

/** Maps a full history detail row (with snapshot) into the UI's
 * `ReportVersion` shape, including the content as it existed at that
 * version — reuses the same content mappers as the live report. */
export function apiReportHistoryDetailToVersion(detail: ReportHistoryDetail): ReportVersion {
  const { achievements, blockers } = mapHighlights(detail.snapshot.reportHighlights);

  return {
    ...apiReportHistoryEntryToVersion(detail),
    snapshot: {
      tasks: mapTasks(detail.snapshot.tasks),
      nextWeekTasks: mapNextWeekTasks(detail.snapshot.reportNextWeekTasks),
      blockers,
      achievements,
      hours: mapHours(detail.snapshot.reportHours),
      notes: detail.notes ?? "",
      links: detail.links ?? "",
    },
  };
}
