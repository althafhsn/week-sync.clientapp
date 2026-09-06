import { NextResponse } from "next/server";

import { clearSessionCookies, getRefreshToken } from "@/lib/auth/session";
import type { RefreshTokenRequest } from "@/lib/api/types";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    const body: RefreshTokenRequest = { refreshToken };
    // Best-effort revocation — the local session is cleared either way.
    await fetch(`${process.env.API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  }

  await clearSessionCookies();
  return new NextResponse(null, { status: 204 });
}
