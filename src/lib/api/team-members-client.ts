import { apiFetch } from "@/lib/api/client-fetch";
import { invalidate } from "@/lib/api/request-cache";
import type { CreateTeamMemberRequest, TeamMember } from "@/lib/api/types";

export async function createTeamMember(
  payload: CreateTeamMemberRequest
): Promise<TeamMember> {
  const teamMember = await apiFetch<TeamMember>("/api/team-members", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  invalidate("/api/teams");
  return teamMember;
}

export async function deleteTeamMember(id: string): Promise<void> {
  await apiFetch<null>(`/api/team-members/${id}`, { method: "DELETE" });
  invalidate("/api/teams");
}
