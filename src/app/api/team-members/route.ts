import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { CreateTeamMemberRequest } from "@/lib/api/types";

export async function GET(request: NextRequest) {
  const upstream = await backendFetch(`/team-members${request.nextUrl.search}`);
  return relayJson(upstream);
}

export async function POST(request: NextRequest) {
  const body: CreateTeamMemberRequest = await request.json();
  const upstream = await backendFetch(`/team-members`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return relayJson(upstream);
}
