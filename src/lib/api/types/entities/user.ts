export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string; // ISO date
}
