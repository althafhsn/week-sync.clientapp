import { NextRequest, NextResponse } from "next/server";

import { setSessionCookies } from "@/lib/auth/session";
import type { LoginRequest, LoginResponse } from "@/lib/api/types";

export async function POST(request: NextRequest) {
  let body: LoginRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  const upstream = await fetch(
    `${process.env.API_BASE_URL}/auth/login?include=role`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!upstream.ok) {
    const message = await upstream
      .json()
      .then((data) => data?.message ?? "Invalid credentials.")
      .catch(() => "Invalid credentials.");
    return NextResponse.json({ message }, { status: upstream.status });
  }

  const data: LoginResponse = await upstream.json();
  await setSessionCookies(data.token, data.refreshToken);

  return NextResponse.json({ user: data.user });
}
