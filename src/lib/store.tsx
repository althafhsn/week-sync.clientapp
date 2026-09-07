"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiUserToUser, apiProjectToProject, apiReportToWeeklyReport } from "@/lib/api/mappers";
import { logoutOfApi } from "@/lib/api/auth-client";
import { clearRequestCache } from "@/lib/api/request-cache";
import { listUsers } from "@/lib/api/users-client";
import { listProjects } from "@/lib/api/projects-client";
import { listReports } from "@/lib/api/reports-client";
import { listReportStatuses } from "@/lib/api/report-statuses-client";
import type { ReportStatus as ApiReportStatus } from "@/lib/api/types";
import type { Project, Role, User, WeeklyReport } from "@/lib/types";

const STORAGE_KEY = "weekly-review-hub-v5";

// Called from outside the React tree (the API fetch wrapper) when a real
// backend session expires. Patches the persisted flag directly so a
// subsequent load doesn't rehydrate a stale signedIn:true from localStorage
// even though the httpOnly session cookie is already gone.
export function forceLocalSignOut() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...parsed, signedIn: false })
    );
  } catch {
    // Corrupt or inaccessible storage — nothing to patch.
  }
}

// Only auth/session bookkeeping is persisted across reloads — users,
// projects, reports and report statuses all come from the real backend and
// are refetched on every load instead of being cached locally.
interface PersistedState {
  role: Role;
  memberId: string;
  managerId: string;
  signedIn: boolean;
}

interface StoreState extends PersistedState {
  users: User[];
  projects: Project[];
  reports: WeeklyReport[];
  reportStatuses: ApiReportStatus[];
  dataLoaded: boolean;
}

function initialState(): StoreState {
  return {
    users: [],
    projects: [],
    reports: [],
    reportStatuses: [],
    role: "member",
    memberId: "",
    managerId: "",
    signedIn: false,
    dataLoaded: false,
  };
}

interface StoreActions {
  setRole: (role: Role) => void;
  setMemberId: (id: string) => void;
  setManagerId: (id: string) => void;
  signIn: (role: Role) => void;
  signOut: () => void;
  upsertReport: (report: WeeklyReport) => void;
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
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (parsed && typeof parsed === "object") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Corrupt or inaccessible storage — fall back to defaults.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const persisted: PersistedState = {
      role: state.role,
      memberId: state.memberId,
      managerId: state.managerId,
      signedIn: state.signedIn,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Ignore write errors (e.g. private-mode storage quota).
    }
  }, [state.role, state.memberId, state.managerId, state.signedIn, hydrated]);

  // Loads real users, projects, report statuses, and reports from the
  // backend once signed in. Members only see their own reports; managers
  // see the whole team's, minus drafts — a draft is the member's own
  // unpublished working copy and isn't visible to their manager until
  // it's submitted.
  useEffect(() => {
    if (!hydrated || !state.signedIn) return;
    const role = state.role;
    const activeId = role === "manager" ? state.managerId : state.memberId;
    if (!activeId) return;
    let cancelled = false;

    Promise.all([
      listUsers(["role"]),
      listProjects(["projectStatus", "users"]),
      listReportStatuses(),
      listReports(
        undefined,
        role === "manager" ? undefined : { userId: activeId }
      ),
    ])
      .then(([users, projects, reportStatuses, reports]) => {
        if (cancelled) return;
        const mappedReports = reports.map(apiReportToWeeklyReport);
        setState((prev) => ({
          ...prev,
          users: users.map(apiUserToUser),
          projects: projects.map(apiProjectToProject),
          reportStatuses,
          reports:
            role === "manager"
              ? mappedReports.filter((r) => r.status !== "draft")
              : mappedReports,
          dataLoaded: true,
        }));
      })
      .catch(() => {
        // Leave existing state in place; pages that depend on this data
        // show their own empty/error states.
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, state.signedIn, state.role, state.memberId, state.managerId]);

  const actions = useMemo<StoreActions>(
    () => ({
      setRole: (role) => setState((s) => ({ ...s, role })),
      setMemberId: (memberId) => setState((s) => ({ ...s, memberId })),
      setManagerId: (managerId) => setState((s) => ({ ...s, managerId })),
      signIn: (role) => setState((s) => ({ ...s, role, signedIn: true })),
      signOut: () => {
        void logoutOfApi();
        clearRequestCache();
        setState((s) => ({
          ...initialState(),
          role: s.role,
          signedIn: false,
        }));
      },

      upsertReport: (report) =>
        setState((s) => {
          const exists = s.reports.some((r) => r.id === report.id);
          return {
            ...s,
            reports: exists
              ? s.reports.map((r) => (r.id === report.id ? report : r))
              : [...s.reports, report],
          };
        }),

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
          const activeId = s.role === "manager" ? s.managerId : s.memberId;
          return {
            ...s,
            users: s.users.map((u) =>
              u.id === activeId ? { ...u, ...patch } : u
            ),
          };
        }),

      changePassword: (newPassword) =>
        setState((s) => {
          const activeId = s.role === "manager" ? s.managerId : s.memberId;
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
        ? state.users.find((u) => u.id === state.managerId)
        : state.users.find((u) => u.id === state.memberId),
    [state.role, state.memberId, state.managerId, state.users]
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
