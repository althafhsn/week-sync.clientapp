import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { UpdateProjectRequest } from "@/lib/api/types";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[id]">
) {
  const { id } = await ctx.params;
  const body: UpdateProjectRequest = await request.json();
  const upstream = await backendFetch(
    `/project/${id}${request.nextUrl.search}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
  return relayJson(upstream);
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[id]">
) {
  const { id } = await ctx.params;
  const upstream = await backendFetch(`/project/${id}`, { method: "DELETE" });
  return relayJson(upstream);
}
