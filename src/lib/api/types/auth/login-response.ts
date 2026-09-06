export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roleId: string;
    mustChangePassword: boolean;
  };
}
