import {
  clearSessionCookies,
  getRefreshToken,
  getSessionToken,
  setSessionCookies,
} from "@/lib/auth/session";
import type { RefreshTokenRequest, RefreshTokenResponse } from "@/lib/api/types";

async function callBackend(path: string, init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${process.env.API_BASE_URL}${path}`, { ...init, headers });
}

// Module-level so concurrent requests that all 401 around the same time
// (e.g. a page fetching projects+users+statuses in parallel) share a single
// refresh call instead of racing the single-use refresh token against
// itself. Only coalesces within one Node process/instance.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const body: RefreshTokenRequest = { refreshToken };
  const upstream = await fetch(`${process.env.API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    await clearSessionCookies();
    return null;
  }

  const data: RefreshTokenResponse = await upstream.json();
  await setSessionCookies(data.token, data.refreshToken);
  return data.token;
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const token = await getSessionToken();
  const response = await callBackend(path, init, token);

  if (response.status !== 401) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return response; // no refresh available — bubble the original 401
  }

  return callBackend(path, init, refreshedToken);
}
