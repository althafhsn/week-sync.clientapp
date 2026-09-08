import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/reports/[id]/history">
) {
  const { id } = await ctx.params;
  const upstream = await backendFetch(`/reports/${id}/history${request.nextUrl.search}`);
  return relayJson(upstream);
}
