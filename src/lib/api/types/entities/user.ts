import type { Role } from "../lookups/role";
import type { UserStatus } from "../lookups/user-status";
import type { Team } from "./team";

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: number;
  userStatusId: number | null;
  jobTitle: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string; // ISO date
  // present only when requested via ?include=role
  role?: Role;
  // present only when requested via ?include=userStatus
  userStatus?: UserStatus;
  // present only when requested via ?include=team
  teamMembers?: { id: string; teamId: string; team?: Pick<Team, "id" | "name"> }[];
}
