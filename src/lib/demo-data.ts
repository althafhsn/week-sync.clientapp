import type { WeeklyReport } from "./types";

export const weeks = [
  { start: "2026-08-03", end: "2026-08-07", label: "Aug 3 – Aug 7, 2026" },
  { start: "2026-08-10", end: "2026-08-14", label: "Aug 10 – Aug 14, 2026" },
  { start: "2026-08-17", end: "2026-08-21", label: "Aug 17 – Aug 21, 2026" },
  { start: "2026-08-24", end: "2026-08-28", label: "Aug 24 – Aug 28, 2026" },
  { start: "2026-08-31", end: "2026-09-04", label: "Aug 31 – Sep 4, 2026" },
];

function parseLocalDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year!, (month ?? 1) - 1, day ?? 1);
}

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const SHORT_DATE_WITH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/**
 * Formats an arbitrary custom date range (not just the seeded weeks) as a
 * human label, e.g. "Aug 3 – Aug 7, 2026" or "Aug 30 – Sep 4, 2026".
 */
export function weekLabel(start: string, end?: string) {
  const startDate = parseLocalDate(start);
  if (!end || end === start) {
    return SHORT_DATE_WITH_YEAR.format(startDate);
  }
  const endDate = parseLocalDate(end);
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const startLabel = sameYear
    ? SHORT_DATE.format(startDate)
    : SHORT_DATE_WITH_YEAR.format(startDate);
  return `${startLabel} – ${SHORT_DATE_WITH_YEAR.format(endDate)}`;
}

// Real priority-types: 1=Medium, 2=High, 3=Critical (no "Low").
// Real task-statuses: 1=In Progress, 2=Blocked, 3=Carried Over (no "Completed").
const PRIORITY = {
  medium: { priorityTypeId: 1, priorityName: "Medium" },
};

const TASK_STATUS = {
  inProgress: { taskStatusId: 1, statusName: "In Progress" },
};

// Real report-highlight-types: 1=Achievement, 2=Highlight (both category
// ACHIEVEMENT), 3=Blocker, 4=Challenge (both category BLOCKER).
const HIGHLIGHT_TYPE = {
  achievement: { reportHighlightTypeId: 1, typeName: "Achievement" },
  blocker: { reportHighlightTypeId: 3, typeName: "Blocker" },
};

export function emptyReport(memberId: string, projectId: string): WeeklyReport {
  const now = new Date().toISOString();
  const week = weeks[weeks.length - 1]!;
  return {
    id: `r-${Math.random().toString(36).slice(2, 9)}`,
    memberId,
    projectId,
    weekStart: week.start,
    weekEnd: week.end,
    status: "draft",
    tasks: [
      {
        id: `t-${Math.random().toString(36).slice(2, 8)}`,
        name: "",
        ...PRIORITY.medium,
        plannedPct: 100,
        actualPct: 0,
        ...TASK_STATUS.inProgress,
        plannedHours: 8,
        timeSpent: 0,
        deliverable: "",
      },
    ],
    nextWeekTasks: [
      { id: `nw-${Math.random().toString(36).slice(2, 8)}`, description: "" },
    ],
    blockers: [
      {
        id: `blk-${Math.random().toString(36).slice(2, 8)}`,
        ...HIGHLIGHT_TYPE.blocker,
        description: "",
        isKey: true,
      },
    ],
    achievements: [
      {
        id: `ach-${Math.random().toString(36).slice(2, 8)}`,
        ...HIGHLIGHT_TYPE.achievement,
        description: "",
        isKey: true,
      },
    ],
    hours: { development: 0, testing: 0, meetings: 0, documentation: 0 },
    notes: "",
    links: "",
    versions: [],
    feedback: [],
    createdAt: now,
    updatedAt: now,
  };
}
