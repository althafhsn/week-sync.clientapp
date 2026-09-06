import { apiFetch } from "@/lib/api/client-fetch";
import type { PaginatedResult, PriorityType } from "@/lib/api/types";

export async function listPriorityTypes(): Promise<PriorityType[]> {
  const result = await apiFetch<PaginatedResult<PriorityType>>(
    "/api/priority-types"
  );
  return result.data;
}
