export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: number;
  userStatusId?: number;
  jobTitle?: string;
  mustChangePassword: boolean;
}
