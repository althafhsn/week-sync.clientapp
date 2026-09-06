import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { UpdateUserRequest } from "@/lib/api/types";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/users/[id]">
) {
  const { id } = await ctx.params;
  const upstream = await backendFetch(`/users/${id}${request.nextUrl.search}`);
  return relayJson(upstream);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/users/[id]">
) {
  const { id } = await ctx.params;
  const body: UpdateUserRequest = await request.json();
  const upstream = await backendFetch(
    `/users/${id}${request.nextUrl.search}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
  return relayJson(upstream);
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/users/[id]">
) {
  const { id } = await ctx.params;
  const upstream = await backendFetch(`/users/${id}`, { method: "DELETE" });
  return relayJson(upstream);
}
