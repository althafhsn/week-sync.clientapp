import { apiFetch } from "@/lib/api/client-fetch";
import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, ENTITY_TTL_MS, invalidate } from "@/lib/api/request-cache";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "@/lib/api/types";

const CACHE_PREFIX = "/api/users";

function includeQuery(include?: string[]) {
  return include?.length ? `?include=${include.join(",")}` : "";
}

export async function listUsers(include?: string[]): Promise<User[]> {
  const path = `${CACHE_PREFIX}${includeQuery(include)}`;
  return cached(path, () => fetchAllPages<User>(path), ENTITY_TTL_MS);
}

export async function getUser(id: string, include?: string[]): Promise<User> {
  const path = `${CACHE_PREFIX}/${id}${includeQuery(include)}`;
  return cached(path, () => apiFetch<User>(path), ENTITY_TTL_MS);
}

export async function createUser(
  payload: CreateUserRequest,
  include?: string[]
): Promise<User> {
  const user = await apiFetch<User>(`${CACHE_PREFIX}${includeQuery(include)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  invalidate(CACHE_PREFIX);
  return user;
}

export async function updateUser(
  id: string,
  payload: UpdateUserRequest,
  include?: string[]
): Promise<User> {
  const user = await apiFetch<User>(
    `${CACHE_PREFIX}/${id}${includeQuery(include)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  invalidate(CACHE_PREFIX);
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch<null>(`${CACHE_PREFIX}/${id}`, { method: "DELETE" });
  invalidate(CACHE_PREFIX);
}
