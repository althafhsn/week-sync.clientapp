import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { CreateTeamRequest } from "@/lib/api/types";

export async function GET(request: NextRequest) {
  const upstream = await backendFetch(`/teams${request.nextUrl.search}`);
  return relayJson(upstream);
}

export async function POST(request: NextRequest) {
  const body: CreateTeamRequest = await request.json();
  const upstream = await backendFetch(`/teams${request.nextUrl.search}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return relayJson(upstream);
}
