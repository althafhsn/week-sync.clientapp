import { makeLookupClient } from "@/lib/api/lookup-client-factory";
import type { TaskStatus } from "@/lib/api/types";

export const listTaskStatuses = makeLookupClient<TaskStatus>("/api/task-statuses");
