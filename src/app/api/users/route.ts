import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { CreateUserRequest } from "@/lib/api/types";

export async function GET(request: NextRequest) {
  const upstream = await backendFetch(`/users${request.nextUrl.search}`);
  return relayJson(upstream);
}

export async function POST(request: NextRequest) {
  const body: CreateUserRequest = await request.json();
  const upstream = await backendFetch(`/users${request.nextUrl.search}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return relayJson(upstream);
}
