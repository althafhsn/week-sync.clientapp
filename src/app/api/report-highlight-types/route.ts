import { NextRequest } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";

export async function GET(request: NextRequest) {
  const upstream = await backendFetch(
    `/report-highlight-types${request.nextUrl.search}`
  );
  return relayJson(upstream);
}
