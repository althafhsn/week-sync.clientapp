import { apiFetch } from "@/lib/api/client-fetch";
import type {
  CreateUserRequest,
  PaginatedResult,
  UpdateUserRequest,
  User,
} from "@/lib/api/types";

function includeQuery(include?: string[]) {
  return include?.length ? `?include=${include.join(",")}` : "";
}

export async function listUsers(include?: string[]): Promise<User[]> {
  const result = await apiFetch<PaginatedResult<User>>(
    `/api/users${includeQuery(include)}`
  );
  return result.data;
}

export async function getUser(id: string, include?: string[]): Promise<User> {
  return apiFetch<User>(`/api/users/${id}${includeQuery(include)}`);
}

export async function createUser(
  payload: CreateUserRequest,
  include?: string[]
): Promise<User> {
  return apiFetch<User>(`/api/users${includeQuery(include)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  id: string,
  payload: UpdateUserRequest,
  include?: string[]
): Promise<User> {
  return apiFetch<User>(`/api/users/${id}${includeQuery(include)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch<null>(`/api/users/${id}`, { method: "DELETE" });
}
