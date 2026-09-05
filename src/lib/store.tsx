"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { MANAGER_ID, buildSeedReports, seedProjects, seedUsers } from "@/lib/demo-data";
import type {
  ManagerFeedback,
  Project,
  ReportStatus,
  ReportVersion,
  Role,
  User,
  WeeklyReport,
} from "@/lib/types";

const STORAGE_KEY = "weekly-review-hub-demo-v4";

interface StoreState {
  users: User[];
  projects: Project[];
  reports: WeeklyReport[];
  role: Role;
  memberId: string;
  signedIn: boolean;
}

function initialState(): StoreState {
  return {
    users: seedUsers,
    projects: seedProjects,
    reports: buildSeedReports(),
    role: "member",
    memberId: "u-nasra",
    signedIn: false,
  };
}

function nextVersionNumber(versions: ReportVersion[]) {
  return (versions[versions.length - 1]?.version ?? 0) + 1;
}

function snapshotOf(report: WeeklyReport): Omit<WeeklyReport, "versions"> {
  return {
    id: report.id,
    memberId: report.memberId,
    projectId: report.projectId,
    weekStart: report.weekStart,
    weekEnd: report.weekEnd,
    status: report.status,
    tasks: report.tasks,
    nextWeekTasks: report.nextWeekTasks,
    blockers: report.blockers,
    achievements: report.achievements,
    hours: report.hours,
    notes: report.notes,
    links: report.links,
    feedback: report.feedback,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    submittedAt: report.submittedAt,
  };
}

interface StoreActions {
  setRole: (role: Role) => void;
  setMemberId: (id: string) => void;
  signIn: (role: Role) => void;
  signOut: () => void;
  reset: () => void;
  saveReport: (report: WeeklyReport) => void;
  submitReport: (id: string) => void;
  reviewReport: (
    id: string,
    decision: "approved" | "changes_requested",
    comment: string
  ) => void;
  upsertProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  upsertUser: (user: User) => void;
  deleteUser: (id: string) => void;
  updateProfile: (patch: Partial<User>) => void;
  changePassword: (newPassword: string) => void;
}

interface StoreValue extends StoreState, StoreActions {
  hydrated: boolean;
  currentUser: User | undefined;
  members: User[];
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage on mount: a single synchronous read
    // of an external system that must happen after the SSR-safe seed
    // render, to avoid a hydration mismatch.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoreState>;
        if (parsed && typeof parsed === "object") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Corrupt or inaccessible storage — fall back to seed state.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore write errors (e.g. private-mode storage quota).
    }
  }, [state, hydrated]);

  const actions = useMemo<StoreActions>(
    () => ({
      setRole: (role) => setState((s) => ({ ...s, role })),
      setMemberId: (memberId) => setState((s) => ({ ...s, memberId })),
      signIn: (role) => setState((s) => ({ ...s, role, signedIn: true })),
      signOut: () => setState((s) => ({ ...s, signedIn: false })),
      reset: () =>
        setState((s) => ({
          ...initialState(),
          role: s.role,
          memberId: s.memberId,
          signedIn: true,
        })),

      saveReport: (report) =>
        setState((s) => {
          const now = new Date().toISOString();
          const exists = s.reports.some((r) => r.id === report.id);
          const versions =
            report.versions.length > 0
              ? report.versions
              : [
                  {
                    version: 1,
                    at: now,
                    action: "Draft created",
                    by: report.memberId,
                  },
                ];
          const next: WeeklyReport = { ...report, versions, updatedAt: now };
          return {
            ...s,
            reports: exists
              ? s.reports.map((r) => (r.id === report.id ? next : r))
              : [...s.reports, next],
          };
        }),

      submitReport: (id) =>
        setState((s) => ({
          ...s,
          reports: s.reports.map((r) => {
            if (r.id !== id) return r;
            const now = new Date().toISOString();
            const wasNeedsCorrection = r.status === "needs_correction";
            const version: ReportVersion = {
              version: nextVersionNumber(r.versions),
              at: now,
              action: wasNeedsCorrection
                ? "Resubmitted after corrections"
                : "Submitted for review",
              by: r.memberId,
              snapshot: snapshotOf(r),
            };
            return {
              ...r,
              status: "submitted" as ReportStatus,
              submittedAt: now,
              updatedAt: now,
              versions: [...r.versions, version],
            };
          }),
        })),

      reviewReport: (id, decision, comment) =>
        setState((s) => ({
          ...s,
          reports: s.reports.map((r) => {
            if (r.id !== id) return r;
            const now = new Date().toISOString();
            const feedbackEntry: ManagerFeedback = {
              id: `f-${Math.random().toString(36).slice(2, 9)}`,
              managerId: MANAGER_ID,
              at: now,
              decision,
              comment,
            };
            const version: ReportVersion = {
              version: nextVersionNumber(r.versions),
              at: now,
              action:
                decision === "approved"
                  ? "Approved by manager"
                  : "Changes requested by manager",
              by: MANAGER_ID,
              snapshot: snapshotOf(r),
            };
            return {
              ...r,
              status: (decision === "approved"
                ? "approved"
                : "needs_correction") as ReportStatus,
              updatedAt: now,
              feedback: [...r.feedback, feedbackEntry],
              versions: [...r.versions, version],
            };
          }),
        })),

      upsertProject: (project) =>
        setState((s) => {
          const exists = s.projects.some((p) => p.id === project.id);
          return {
            ...s,
            projects: exists
              ? s.projects.map((p) => (p.id === project.id ? project : p))
              : [...s.projects, project],
          };
        }),
      deleteProject: (id) =>
        setState((s) => ({
          ...s,
          projects: s.projects.filter((p) => p.id !== id),
        })),

      upsertUser: (user) =>
        setState((s) => {
          const exists = s.users.some((u) => u.id === user.id);
          return {
            ...s,
            users: exists
              ? s.users.map((u) => (u.id === user.id ? user : u))
              : [...s.users, user],
          };
        }),
      deleteUser: (id) =>
        setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) })),

      updateProfile: (patch) =>
        setState((s) => {
          const activeId = s.role === "manager" ? MANAGER_ID : s.memberId;
          return {
            ...s,
            users: s.users.map((u) =>
              u.id === activeId ? { ...u, ...patch } : u
            ),
          };
        }),

      changePassword: (newPassword) =>
        setState((s) => {
          const activeId = s.role === "manager" ? MANAGER_ID : s.memberId;
          return {
            ...s,
            users: s.users.map((u) =>
              u.id === activeId
                ? { ...u, password: newPassword, mustChangePassword: false }
                : u
            ),
          };
        }),
    }),
    []
  );

  const currentUser = useMemo(
    () =>
      state.role === "manager"
        ? state.users.find((u) => u.id === MANAGER_ID)
        : state.users.find((u) => u.id === state.memberId),
    [state.role, state.memberId, state.users]
  );

  const members = useMemo(
    () => state.users.filter((u) => u.role === "member"),
    [state.users]
  );

  const value = useMemo<StoreValue>(
    () => ({ ...state, hydrated, currentUser, members, ...actions }),
    [state, hydrated, currentUser, members, actions]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}

export function useLookups() {
  const { users, projects } = useStore();
  return useMemo(
    () => ({
      userName: (id: string) =>
        users.find((u) => u.id === id)?.name ?? "Unknown",
      projectName: (id: string) =>
        projects.find((p) => p.id === id)?.name ?? "Unassigned",
    }),
    [users, projects]
  );
}
