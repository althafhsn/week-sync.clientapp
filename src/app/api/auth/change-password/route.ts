import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { ChangePasswordRequest } from "@/lib/api/types";

export async function PATCH(request: NextRequest) {
  let body: ChangePasswordRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!body.currentPassword || !body.newPassword) {
    return NextResponse.json(
      { message: "Current and new password are required." },
      { status: 400 }
    );
  }

  const upstream = await backendFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return relayJson(upstream);
}
