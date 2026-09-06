import { forceLocalSignOut } from "@/lib/store";

const SESSION_EXPIRED_REDIRECT = "/login?reason=session_expired";

// Only run the sign-out-and-redirect sequence once even if several calls
// 401 around the same time (e.g. a page fires off projects+users+statuses
// in parallel).
let handling401 = false;

/** Fetch wrapper for calls to our own /api/* proxy routes (never for
 * /api/auth/login itself — a bad password there is not an expired session). */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 401) {
    if (!handling401) {
      handling401 = true;
      forceLocalSignOut();
      void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        // Hard navigation is deliberate: this runs outside any component's
        // router context, and a full reload discards the whole React tree
        // (including the demo store) rather than leaving stale state behind.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = SESSION_EXPIRED_REDIRECT;
      });
    }
    throw new Error("Your session has expired. Please sign in again.");
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed with status ${res.status}`);
  }
  return data as T;
}
