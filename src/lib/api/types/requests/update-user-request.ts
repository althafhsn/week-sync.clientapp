export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
  userStatusId?: number;
  jobTitle?: string;
  mustChangePassword?: boolean;
  isActive?: boolean;
}
