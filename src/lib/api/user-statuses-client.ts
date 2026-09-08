import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { UserStatus } from "@/lib/api/types";

export async function listUserStatuses(): Promise<UserStatus[]> {
  return cached(
    "/api/user-statuses",
    () => fetchAllPages<UserStatus>("/api/user-statuses"),
    LOOKUP_TTL_MS
  );
}
