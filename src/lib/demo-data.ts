import type {
  HoursByType,
  Project,
  ReportStatus,
  ReportTask,
  User,
  WeeklyReport,
} from "./types";

export const MANAGER_ID = "u-manager";

export const DEMO_PASSWORD = "demo1234";

export const seedUsers: User[] = [
  {
    id: MANAGER_ID,
    name: "Dilani Perera",
    email: "dilani@northwind.io",
    role: "manager",
    title: "Engineering Manager",
    team: "Platform",
    joinedAt: "2023-02-13",
    password: DEMO_PASSWORD,
    mustChangePassword: false,
  },
  {
    id: "u-nasra",
    name: "Nasra Nasar",
    email: "nasra@northwind.io",
    role: "member",
    title: "Senior Frontend Engineer",
    team: "Platform",
    joinedAt: "2023-06-05",
    password: DEMO_PASSWORD,
    mustChangePassword: false,
  },
  {
    id: "u-arjun",
    name: "Arjun Mehta",
    email: "arjun@northwind.io",
    role: "member",
    title: "Backend Engineer",
    team: "Platform",
    joinedAt: "2024-01-15",
    password: DEMO_PASSWORD,
    mustChangePassword: false,
  },
  {
    id: "u-leah",
    name: "Leah Fernando",
    email: "leah@northwind.io",
    role: "member",
    title: "QA Engineer",
    team: "Quality",
    joinedAt: "2024-04-02",
    password: DEMO_PASSWORD,
    mustChangePassword: true,
  },
  {
    id: "u-tomas",
    name: "Tomás Rivera",
    email: "tomas@northwind.io",
    role: "member",
    title: "Product Designer",
    team: "Design",
    joinedAt: "2022-11-21",
    password: DEMO_PASSWORD,
    mustChangePassword: false,
  },
  {
    id: "u-priya",
    name: "Priya Nair",
    email: "priya@northwind.io",
    role: "member",
    title: "Data Engineer",
    team: "Data",
    joinedAt: "2025-03-10",
    password: DEMO_PASSWORD,
    mustChangePassword: false,
  },
];

export const seedProjects: Project[] = [
  {
    id: "p-atlas",
    name: "Atlas Billing",
    category: "Product",
    description: "Subscription billing and invoicing revamp.",
    status: "active",
    memberIds: ["u-nasra", "u-arjun", "u-leah"],
  },
  {
    id: "p-orbit",
    name: "Orbit Mobile",
    category: "Product",
    description: "Cross-platform mobile client for field teams.",
    status: "active",
    memberIds: ["u-nasra", "u-leah", "u-tomas"],
  },
  {
    id: "p-ledger",
    name: "Ledger Migration",
    category: "Infrastructure",
    description: "Move reporting warehouse to the new pipeline.",
    status: "active",
    memberIds: ["u-arjun", "u-priya"],
  },
  {
    id: "p-support",
    name: "Support Tooling",
    category: "Internal",
    description: "Internal agent console and macros.",
    status: "archived",
    memberIds: ["u-tomas"],
  },
  {
    id: "p-growth",
    name: "Growth Experiments",
    category: "Marketing",
    description: "Pipeline of experiments awaiting scoping and staffing.",
    status: "proposed",
    memberIds: [],
  },
];

export const weeks = [
  { start: "2026-08-03", end: "2026-08-07", label: "Aug 3 – Aug 7, 2026" },
  { start: "2026-08-10", end: "2026-08-14", label: "Aug 10 – Aug 14, 2026" },
  { start: "2026-08-17", end: "2026-08-21", label: "Aug 17 – Aug 21, 2026" },
  { start: "2026-08-24", end: "2026-08-28", label: "Aug 24 – Aug 28, 2026" },
  { start: "2026-08-31", end: "2026-09-04", label: "Aug 31 – Sep 4, 2026" },
];

export function weekLabel(start: string) {
  return weeks.find((w) => w.start === start)?.label ?? start;
}

const taskPool: Array<Omit<ReportTask, "id">> = [
  {
    name: "Invoice PDF renderer",
    priority: "high",
    plannedPct: 100,
    actualPct: 100,
    status: "completed",
    plannedHours: 12,
    timeSpent: 13,
    deliverable: "PR #2841",
  },
  {
    name: "Proration edge cases",
    priority: "critical",
    plannedPct: 100,
    actualPct: 75,
    status: "in_progress",
    plannedHours: 10,
    timeSpent: 9,
    deliverable: "Spec doc v3",
  },
  {
    name: "Regression suite for checkout",
    priority: "medium",
    plannedPct: 80,
    actualPct: 80,
    status: "completed",
    plannedHours: 8,
    timeSpent: 7.5,
    deliverable: "42 new cases",
  },
  {
    name: "Offline sync prototype",
    priority: "high",
    plannedPct: 60,
    actualPct: 35,
    status: "blocked",
    plannedHours: 9,
    timeSpent: 6,
    deliverable: "Branch feat/sync",
  },
  {
    name: "Warehouse schema mapping",
    priority: "medium",
    plannedPct: 100,
    actualPct: 100,
    status: "completed",
    plannedHours: 6,
    timeSpent: 6,
    deliverable: "dbt models",
  },
  {
    name: "Agent console filters",
    priority: "low",
    plannedPct: 50,
    actualPct: 20,
    status: "carried_over",
    plannedHours: 5,
    timeSpent: 2,
    deliverable: "Figma handoff",
  },
  {
    name: "Design tokens audit",
    priority: "medium",
    plannedPct: 100,
    actualPct: 90,
    status: "in_progress",
    plannedHours: 7,
    timeSpent: 8,
    deliverable: "Token sheet",
  },
  {
    name: "Nightly pipeline alerting",
    priority: "high",
    plannedPct: 100,
    actualPct: 100,
    status: "completed",
    plannedHours: 6,
    timeSpent: 5,
    deliverable: "Runbook + alerts",
  },
];

const blockerPool = [
  "Waiting on the payments sandbox credentials from the vendor.",
  "Staging database keeps timing out during large backfills.",
  "Design review slipped a day, so implementation started late.",
  "Two flaky end-to-end tests are masking real failures.",
];

const achievementPool = [
  "Cut invoice generation time from 4.2s to 900ms.",
  "Closed the last three P1 defects ahead of the release gate.",
  "Shipped the new sync layer behind a feature flag.",
  "Documented the full migration path for the data team.",
];

function hours(seed: number): HoursByType {
  const rot = (n: number) => 4 + ((seed * n) % 9);
  return {
    development: rot(3),
    testing: rot(5),
    meetings: 2 + (seed % 4),
    documentation: 1 + (seed % 5),
  };
}

function tasksFor(seed: number): ReportTask[] {
  const count = 3 + (seed % 2);
  return Array.from({ length: count }, (_, i) => {
    const base = taskPool[(seed + i) % taskPool.length]!;
    return { ...base, id: `t-${seed}-${i}` };
  });
}

interface SeedSpec {
  member: string;
  week: number;
  project: string;
  status: ReportStatus;
}

const specs: SeedSpec[] = [
  { member: "u-nasra", week: 0, project: "p-atlas", status: "approved" },
  { member: "u-nasra", week: 1, project: "p-atlas", status: "approved" },
  {
    member: "u-nasra",
    week: 2,
    project: "p-orbit",
    status: "needs_correction",
  },
  { member: "u-nasra", week: 3, project: "p-atlas", status: "submitted" },
  { member: "u-nasra", week: 4, project: "p-atlas", status: "draft" },
  { member: "u-arjun", week: 0, project: "p-ledger", status: "approved" },
  { member: "u-arjun", week: 1, project: "p-ledger", status: "approved" },
  { member: "u-arjun", week: 2, project: "p-atlas", status: "approved" },
  { member: "u-arjun", week: 3, project: "p-ledger", status: "submitted" },
  { member: "u-leah", week: 1, project: "p-orbit", status: "approved" },
  { member: "u-leah", week: 2, project: "p-orbit", status: "submitted" },
  { member: "u-leah", week: 3, project: "p-atlas", status: "needs_correction" },
  { member: "u-leah", week: 4, project: "p-orbit", status: "submitted" },
  { member: "u-tomas", week: 0, project: "p-support", status: "approved" },
  { member: "u-tomas", week: 2, project: "p-orbit", status: "approved" },
  { member: "u-tomas", week: 3, project: "p-support", status: "submitted" },
  { member: "u-tomas", week: 4, project: "p-orbit", status: "draft" },
  { member: "u-priya", week: 1, project: "p-ledger", status: "approved" },
  { member: "u-priya", week: 2, project: "p-ledger", status: "submitted" },
  {
    member: "u-priya",
    week: 3,
    project: "p-ledger",
    status: "needs_correction",
  },
  { member: "u-priya", week: 4, project: "p-ledger", status: "submitted" },
];

const changeComments = [
  "Actual completion percentages don't line up with the hours logged. Please reconcile the numbers and add the deliverable link for the second task.",
  "Please expand the blockers section — I need the vendor ticket number and the date you escalated.",
  "Next week's plan is too vague. Break it into named tasks with planned hours before resubmitting.",
];

export function buildSeedReports(): WeeklyReport[] {
  return specs.map((spec, i) => {
    const week = weeks[spec.week]!;
    const submitAt = `${week.end}T16:${(10 + i).toString().padStart(2, "0")}:00.000Z`;
    const versions = [
      {
        version: 1,
        at: `${week.start}T09:05:00.000Z`,
        action: "Draft created",
        by: spec.member,
      },
    ];
    const feedback = [];

    if (spec.status !== "draft") {
      versions.push({
        version: 2,
        at: submitAt,
        action: "Submitted for review",
        by: spec.member,
      });
    }
    if (spec.status === "needs_correction") {
      const comment = changeComments[i % changeComments.length]!;
      versions.push({
        version: 3,
        at: `${week.end}T18:40:00.000Z`,
        action: "Changes requested by manager",
        by: MANAGER_ID,
      });
      feedback.push({
        id: `f-${i}`,
        managerId: MANAGER_ID,
        at: `${week.end}T18:40:00.000Z`,
        decision: "changes_requested" as const,
        comment,
      });
    }
    if (spec.status === "approved") {
      versions.push({
        version: 3,
        at: `${week.end}T19:15:00.000Z`,
        action: "Approved by manager",
        by: MANAGER_ID,
      });
      feedback.push({
        id: `f-${i}`,
        managerId: MANAGER_ID,
        at: `${week.end}T19:15:00.000Z`,
        decision: "approved" as const,
        comment:
          "Clear report — completion numbers match the deliverables. Nice work.",
      });
    }

    return {
      id: `r-${i + 1}`,
      memberId: spec.member,
      projectId: spec.project,
      weekStart: week.start,
      weekEnd: week.end,
      status: spec.status,
      tasks: tasksFor(i + 1),
      nextWeekTasks:
        "1. Finish proration edge cases (8h)\n2. Pair on release checklist (3h)\n3. Draft handover notes for the on-call rotation (2h)",
      blockers: blockerPool[i % blockerPool.length]!,
      keyBlocker: blockerPool[(i + 1) % blockerPool.length]!,
      achievements: achievementPool[i % achievementPool.length]!,
      keyAchievement: achievementPool[(i + 2) % achievementPool.length]!,
      hours: hours(i + 2),
      notes: "Standups moved to 9:30 for the rest of the sprint.",
      links: "https://github.com/northwind/atlas/pull/2841",
      versions,
      feedback,
      createdAt: `${week.start}T09:05:00.000Z`,
      updatedAt:
        spec.status === "draft" ? `${week.end}T11:00:00.000Z` : submitAt,
      ...(spec.status === "draft" ? {} : { submittedAt: submitAt }),
    };
  });
}

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
        priority: "medium",
        plannedPct: 100,
        actualPct: 0,
        status: "in_progress",
        plannedHours: 8,
        timeSpent: 0,
        deliverable: "",
      },
    ],
    nextWeekTasks: "",
    blockers: "",
    keyBlocker: "",
    achievements: "",
    keyAchievement: "",
    hours: { development: 0, testing: 0, meetings: 0, documentation: 0 },
    notes: "",
    links: "",
    versions: [],
    feedback: [],
    createdAt: now,
    updatedAt: now,
  };
}
