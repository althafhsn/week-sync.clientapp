import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";

export async function GET() {
  const upstream = await backendFetch("/dashboard/summary");
  return relayJson(upstream);
}
