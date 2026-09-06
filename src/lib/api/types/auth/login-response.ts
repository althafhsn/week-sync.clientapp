import type { Role } from "../lookups/role";

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roleId: number;
    jobTitle: string | null;
    mustChangePassword: boolean;
    // present only when requested via ?include=role
    role?: Role;
  };
}
