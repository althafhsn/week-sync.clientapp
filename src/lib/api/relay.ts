import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";

export async function relayJson(upstream: Response) {
  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}

/**
 * Builds a `GET` route handler that forwards the request's query string to
 * the given backend path and relays the JSON response as-is.
 */
export function proxyGet(backendPath: string) {
  return async function GET(request: NextRequest) {
    const upstream = await backendFetch(`${backendPath}${request.nextUrl.search}`);
    return relayJson(upstream);
  };
}
