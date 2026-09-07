import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";
import type { UpdateReportRequest } from "@/lib/api/types";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/reports/[id]">
) {
  const { id } = await ctx.params;
  const upstream = await backendFetch(`/reports/${id}${request.nextUrl.search}`);
  return relayJson(upstream);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/reports/[id]">
) {
  const { id } = await ctx.params;
  const body: UpdateReportRequest = await request.json();
  const upstream = await backendFetch(
    `/reports/${id}${request.nextUrl.search}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
  return relayJson(upstream);
}
