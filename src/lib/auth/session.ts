import { cookies } from "next/headers";

export const SESSION_COOKIE = "wsh_session";
export const REFRESH_COOKIE = "wsh_refresh";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setSessionCookies(token: string, refreshToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
  store.set(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}
