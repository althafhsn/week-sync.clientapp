import { apiFetch } from "@/lib/api/client-fetch";
import type {
  CreateProjectRequest,
  PaginatedResult,
  Project,
  UpdateProjectRequest,
} from "@/lib/api/types";

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
  const result = await apiFetch<PaginatedResult<Project>>(
    `/api/projects${listProjectsQuery(include, filters)}`
  );
  return result.data;
}

export async function createProject(
  payload: CreateProjectRequest,
  include?: string[]
): Promise<Project> {
  return apiFetch<Project>(`/api/projects${includeQuery(include)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProject(
  id: string,
  payload: UpdateProjectRequest,
  include?: string[]
): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}${includeQuery(include)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch<null>(`/api/projects/${id}`, { method: "DELETE" });
}
