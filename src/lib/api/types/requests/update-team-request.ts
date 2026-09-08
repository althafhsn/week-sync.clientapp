import type { TeamMemberRef } from "./team-member-ref";

export interface UpdateTeamRequest {
  name?: string;
  isActive?: boolean;
  teamMembers?: TeamMemberRef[]; // full replace of team membership when present
}
