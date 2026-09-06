import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
} from "@/lib/api/types";

export type ApiLoginResult = LoginResponse["user"];

export async function loginWithApi(
  email: string,
  password: string
): Promise<ApiLoginResult> {
  const payload: LoginRequest = { email, password };

  const res = await fetch("/api/auth/login?include=role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? "Invalid credentials.");
  }

  return data.user;
}

export async function logoutOfApi(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

// Deliberately plain fetch, not the apiFetch wrapper: a wrong current
// password legitimately comes back as a 401 here, and must not be treated
// as an expired session (which would force-sign-out and redirect).
export async function changePasswordWithApi(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const payload: ChangePasswordRequest = { currentPassword, newPassword };

  const res = await fetch("/api/auth/change-password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "Could not change your password.");
  }
}
