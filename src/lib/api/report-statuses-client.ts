import { apiFetch } from "@/lib/api/client-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PaginatedResult, ReportStatus } from "@/lib/api/types";

export async function listReportStatuses(): Promise<ReportStatus[]> {
  return cached(
    "/api/report-statuses",
    async () => {
      const result = await apiFetch<PaginatedResult<ReportStatus>>(
        "/api/report-statuses"
      );
      return result.data;
    },
    LOOKUP_TTL_MS
  );
}
