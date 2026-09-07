import { cached, ENTITY_TTL_MS } from "@/lib/api/request-cache";
import type { DashboardSummary } from "@/lib/api/types";

// Deliberately a plain fetch, not the apiFetch wrapper: this powers the
// showcase panel on the login/signup screens, rendered before any session
// exists — apiFetch's 401 handling assumes a real session just expired and
// would force a sign-out/redirect loop on a page the user was never signed
// into.
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return cached(
    "/api/dashboard/summary",
    async () => {
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return (await res.json()) as DashboardSummary;
    },
    ENTITY_TTL_MS
  );
}
