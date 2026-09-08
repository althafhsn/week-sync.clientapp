import type { User } from "./user";

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: Pick<User, "id" | "name" | "email">;
}

export interface Team {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // present only when requested via ?include=
  teamMembers?: TeamMember[];
}
