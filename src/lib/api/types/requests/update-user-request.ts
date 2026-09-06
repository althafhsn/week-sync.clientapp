export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
  jobTitle?: string;
  mustChangePassword?: boolean;
  isActive?: boolean;
}
