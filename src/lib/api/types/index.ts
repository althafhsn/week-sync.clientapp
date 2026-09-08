// ============================================================
// Real backend API contract (DTOs + entities), re-exported as a
// single barrel. Each interface/type lives in its own file under
// this folder — see the subfolders below. This mirrors the
// server's Prisma-backed shape: lookup tables are {id, name} rows
// referenced by id, not string-union enums. It is intentionally
// separate from `lib/types.ts`, which is the UI-friendly shape the
// demo data and current components use. Map between the two at the
// API boundary rather than merging them.
// ============================================================

export * from "./enums";
export * from "./id-ref";
export * from "./pagination";

// Lookup entities (simple {id, name} tables)
export * from "./lookups/role";
export * from "./lookups/user-status";
export * from "./lookups/project-status";
export * from "./lookups/report-status";
export * from "./lookups/priority-type";
export * from "./lookups/task-status";
export * from "./lookups/review-action-type";
export * from "./lookups/report-hour-type";
export * from "./lookups/report-highlight-type";

// Core entities
export * from "./entities/dashboard-summary";
export * from "./entities/user";
export * from "./entities/project";
export * from "./entities/user-project";
export * from "./entities/team";
export * from "./entities/team-project";
export * from "./entities/report";
export * from "./entities/report-history";
export * from "./entities/report-next-week-task";
export * from "./entities/task";
export * from "./entities/report-highlight";
export * from "./entities/report-hours";

// Auth
export * from "./auth/login-request";
export * from "./auth/login-response";
export * from "./auth/refresh-token-request";
export * from "./auth/refresh-token-response";
export * from "./auth/change-password-request";

// Request DTOs
export * from "./requests/create-user-request";
export * from "./requests/update-user-request";
export * from "./requests/user-project-ref";
export * from "./requests/create-project-request";
export * from "./requests/update-project-request";
export * from "./requests/create-user-project-request";
export * from "./requests/team-project-ref";
export * from "./requests/team-member-ref";
export * from "./requests/create-team-request";
export * from "./requests/update-team-request";
export * from "./requests/create-team-member-request";
export * from "./requests/create-signup-request";
export * from "./requests/update-report-request";
export * from "./requests/create-task-request";
export * from "./requests/update-task-request";
export * from "./requests/create-report-highlight-request";
export * from "./requests/update-report-highlight-request";
export * from "./requests/create-report-hours-request";
export * from "./requests/update-report-hours-request";
export * from "./requests/create-lookup-request";
export * from "./requests/update-lookup-request";
export * from "./requests/create-report-highlight-type-request";
export * from "./requests/update-report-highlight-type-request";
export * from "./requests/create-report-task-input";
export * from "./requests/create-report-next-week-task-input";
export * from "./requests/create-report-highlight-input";
export * from "./requests/create-report-hours-input";
export * from "./requests/create-report-with-version-request";
