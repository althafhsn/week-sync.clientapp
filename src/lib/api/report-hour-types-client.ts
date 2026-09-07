import { apiFetch } from "@/lib/api/client-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PaginatedResult, ReportHourType } from "@/lib/api/types";

export async function listReportHourTypes(): Promise<ReportHourType[]> {
  return cached(
    "/api/report-hour-types",
    async () => {
      const result = await apiFetch<PaginatedResult<ReportHourType>>(
        "/api/report-hour-types"
      );
      return result.data;
    },
    LOOKUP_TTL_MS
  );
}
