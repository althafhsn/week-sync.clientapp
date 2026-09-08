import { apiFetch } from "@/lib/api/client-fetch";
import { fetchAllPages, fetchPage } from "@/lib/api/pagination-fetch";
import { cached, ENTITY_TTL_MS, invalidate } from "@/lib/api/request-cache";
import type {
  CreateTeamRequest,
  PaginatedResult,
  Team,
  UpdateTeamRequest,
} from "@/lib/api/types";

const CACHE_PREFIX = "/api/teams";

function includeQuery(include?: string[]) {
  return include?.length ? `?include=${include.join(",")}` : "";
}

export async function listTeams(include?: string[]): Promise<Team[]> {
  const path = `${CACHE_PREFIX}${includeQuery(include)}`;
  return cached(path, () => fetchAllPages<Team>(path), ENTITY_TTL_MS);
}

/** Fetches one page of teams, for pages that drive their own pagination
 * controls instead of loading the full list. */
export async function listTeamsPage(
  page: number,
  pageSize: number,
  include?: string[]
): Promise<PaginatedResult<Team>> {
  const path = `${CACHE_PREFIX}${includeQuery(include)}`;
  return cached(
    `${path}&page=${page}&pageSize=${pageSize}`,
    () => fetchPage<Team>(path, page, pageSize),
    ENTITY_TTL_MS
  );
}

export async function createTeam(
  payload: CreateTeamRequest,
  include?: string[]
): Promise<Team> {
  const team = await apiFetch<Team>(`${CACHE_PREFIX}${includeQuery(include)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  invalidate(CACHE_PREFIX);
  return team;
}

export async function updateTeam(
  id: string,
  payload: UpdateTeamRequest,
  include?: string[]
): Promise<Team> {
  const team = await apiFetch<Team>(
    `${CACHE_PREFIX}/${id}${includeQuery(include)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  invalidate(CACHE_PREFIX);
  return team;
}

export async function deleteTeam(id: string): Promise<void> {
  await apiFetch<null>(`${CACHE_PREFIX}/${id}`, { method: "DELETE" });
  invalidate(CACHE_PREFIX);
}
