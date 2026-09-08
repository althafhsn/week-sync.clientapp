import type { WeeklyReport } from "./types";

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

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Last week's Monday through Friday, relative to today. */
export function lastWeekRange(): { start: string; end: string } {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastFriday = new Date(lastMonday);
  lastFriday.setDate(lastMonday.getDate() + 4);
  return { start: toISODate(lastMonday), end: toISODate(lastFriday) };
}

export function emptyReport(memberId: string, projectId: string): WeeklyReport {
  const now = new Date().toISOString();
  const week = lastWeekRange();
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
