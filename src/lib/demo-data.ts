import { parseLocalDate, toIsoDate } from "./date";
import { randomId } from "./utils";
import type { WeeklyReport } from "./types";

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
  const startDate = parseLocalDate(start)!;
  if (!end || end === start) {
    return SHORT_DATE_WITH_YEAR.format(startDate);
  }
  const endDate = parseLocalDate(end)!;
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

/** Last week's Monday through Friday, relative to today. */
export function lastWeekRange(): { start: string; end: string } {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastFriday = new Date(lastMonday);
  lastFriday.setDate(lastMonday.getDate() + 4);
  return { start: toIsoDate(lastMonday), end: toIsoDate(lastFriday) };
}

export function emptyReport(memberId: string, projectId: string): WeeklyReport {
  const now = new Date().toISOString();
  const week = lastWeekRange();
  return {
    id: randomId("r"),
    memberId,
    projectId,
    weekStart: week.start,
    weekEnd: week.end,
    status: "draft",
    tasks: [
      {
        id: randomId("t"),
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
      { id: randomId("nw"), description: "" },
    ],
    blockers: [
      {
        id: randomId("blk"),
        ...HIGHLIGHT_TYPE.blocker,
        description: "",
        isKey: true,
      },
    ],
    achievements: [
      {
        id: randomId("ach"),
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
