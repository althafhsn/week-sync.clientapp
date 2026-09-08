import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PriorityType } from "@/lib/api/types";

export async function listPriorityTypes(): Promise<PriorityType[]> {
  return cached(
    "/api/priority-types",
    () => fetchAllPages<PriorityType>("/api/priority-types"),
    LOOKUP_TTL_MS
  );
}
