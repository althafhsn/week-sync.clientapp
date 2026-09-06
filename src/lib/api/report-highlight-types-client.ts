import { apiFetch } from "@/lib/api/client-fetch";
import type { PaginatedResult, ReportHighlightType } from "@/lib/api/types";

export async function listReportHighlightTypes(): Promise<ReportHighlightType[]> {
  const result = await apiFetch<PaginatedResult<ReportHighlightType>>(
    "/api/report-highlight-types"
  );
  return result.data;
}
