import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { ReportHighlightType } from "@/lib/api/types";

export async function listReportHighlightTypes(): Promise<ReportHighlightType[]> {
  return cached(
    "/api/report-highlight-types",
    () => fetchAllPages<ReportHighlightType>("/api/report-highlight-types"),
    LOOKUP_TTL_MS
  );
}
