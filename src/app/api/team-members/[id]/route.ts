import { backendFetch } from "@/lib/api/backend-fetch";
import { relayJson } from "@/lib/api/relay";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/team-members/[id]">
) {
  const { id } = await ctx.params;
  const upstream = await backendFetch(`/team-members/${id}`, { method: "DELETE" });
  return relayJson(upstream);
}
