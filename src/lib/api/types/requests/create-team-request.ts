import type { TeamMemberRef } from "./team-member-ref";

export interface CreateTeamRequest {
  name: string;
  isActive?: boolean;
  teamMembers?: TeamMemberRef[];
}
