import { NextRequest, NextResponse } from "next/server";

import type { CreateSignupRequest } from "@/lib/api/types";

export async function POST(request: NextRequest) {
  let body: CreateSignupRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json(
      { message: "Name, email and password are required." },
      { status: 400 }
    );
  }

  const upstream = await fetch(`${process.env.API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Could not create your account." },
      { status: upstream.status }
    );
  }

  return NextResponse.json(data);
}
