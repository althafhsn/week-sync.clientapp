import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/reports/[id]/history/[historyId]">
) {
  const { id, historyId } = await ctx.params;
  const upstream = await backendFetch(`/reports/${id}/history/${historyId}`);
  return relayJson(upstream);
}
