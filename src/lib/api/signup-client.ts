import type { CreateSignupRequest } from "@/lib/api/types";

export interface SignupResult {
  id: string;
  name: string;
  email: string;
}

// Deliberately plain fetch, not the apiFetch wrapper: signup happens before
// any session exists, and a duplicate-email 409 here is a legitimate
// validation error, not an expired session.
export async function signupWithApi(
  payload: CreateSignupRequest
): Promise<SignupResult> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? "Could not create your account.");
  }

  return data as SignupResult;
}
