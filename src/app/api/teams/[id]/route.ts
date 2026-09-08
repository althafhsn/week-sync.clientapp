import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { UpdateTeamRequest } from "@/lib/api/types";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/teams/[id]">
) {
  const { id } = await ctx.params;
  const body: UpdateTeamRequest = await request.json();
  const upstream = await backendFetch(`/teams/${id}${request.nextUrl.search}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return relayJson(upstream);
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/teams/[id]">
) {
  const { id } = await ctx.params;
  const upstream = await backendFetch(`/teams/${id}`, { method: "DELETE" });
  return relayJson(upstream);
}
