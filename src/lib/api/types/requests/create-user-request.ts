export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: number;
  jobTitle?: string;
  mustChangePassword: boolean;
}
