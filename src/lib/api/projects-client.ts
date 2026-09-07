import { apiFetch } from "@/lib/api/client-fetch";
import { cached, ENTITY_TTL_MS, invalidate } from "@/lib/api/request-cache";
import type {
  CreateProjectRequest,
  PaginatedResult,
  Project,
  UpdateProjectRequest,
} from "@/lib/api/types";

const CACHE_PREFIX = "/api/projects";

function includeQuery(include?: string[]) {
  return include?.length ? `?include=${include.join(",")}` : "";
}

export interface ListProjectsFilters {
  userId?: string;
}

function listProjectsQuery(include?: string[], filters?: ListProjectsFilters) {
  const params = new URLSearchParams();
  if (include?.length) params.set("include", include.join(","));
  if (filters?.userId) params.set("filters.userid", filters.userId);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listProjects(
  include?: string[],
  filters?: ListProjectsFilters
): Promise<Project[]> {
  const path = `${CACHE_PREFIX}${listProjectsQuery(include, filters)}`;
  return cached(
    path,
    async () => {
      const result = await apiFetch<PaginatedResult<Project>>(path);
      return result.data;
    },
    ENTITY_TTL_MS
  );
}

export async function createProject(
  payload: CreateProjectRequest,
  include?: string[]
): Promise<Project> {
  const project = await apiFetch<Project>(
    `${CACHE_PREFIX}${includeQuery(include)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  invalidate(CACHE_PREFIX);
  return project;
}

export async function updateProject(
  id: string,
  payload: UpdateProjectRequest,
  include?: string[]
): Promise<Project> {
  const project = await apiFetch<Project>(
    `${CACHE_PREFIX}/${id}${includeQuery(include)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  invalidate(CACHE_PREFIX);
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch<null>(`${CACHE_PREFIX}/${id}`, { method: "DELETE" });
  invalidate(CACHE_PREFIX);
}
