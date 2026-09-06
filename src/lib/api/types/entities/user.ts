import type { Role } from "../lookups/role";

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: number;
  jobTitle: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string; // ISO date
  // present only when requested via ?include=role
  role?: Role;
}
