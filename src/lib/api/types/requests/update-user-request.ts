export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  mustChangePassword?: boolean;
  isActive?: boolean;
}
