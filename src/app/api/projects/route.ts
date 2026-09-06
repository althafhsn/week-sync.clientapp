import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { CreateProjectRequest } from "@/lib/api/types";

export async function GET(request: NextRequest) {
  const upstream = await backendFetch(`/project${request.nextUrl.search}`);
  return relayJson(upstream);
}

export async function POST(request: NextRequest) {
  const body: CreateProjectRequest = await request.json();
  const upstream = await backendFetch(`/project${request.nextUrl.search}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return relayJson(upstream);
}
