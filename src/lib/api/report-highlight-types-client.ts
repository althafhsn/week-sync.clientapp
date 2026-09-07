import { apiFetch } from "@/lib/api/client-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { PaginatedResult, ReportHighlightType } from "@/lib/api/types";

export async function listReportHighlightTypes(): Promise<ReportHighlightType[]> {
  return cached(
    "/api/report-highlight-types",
    async () => {
      const result = await apiFetch<PaginatedResult<ReportHighlightType>>(
        "/api/report-highlight-types"
      );
      return result.data;
    },
    LOOKUP_TTL_MS
  );
}
