export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: string;
  mustChangePassword: boolean;
}
