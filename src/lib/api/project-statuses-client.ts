import { makeLookupClient } from "@/lib/api/lookup-client-factory";
import type { ProjectStatus } from "@/lib/api/types";

export const listProjectStatuses = makeLookupClient<ProjectStatus>("/api/project-statuses");
