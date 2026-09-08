import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { ReportStatus } from "@/lib/api/types";

export async function listReportStatuses(): Promise<ReportStatus[]> {
  return cached(
    "/api/report-statuses",
    () => fetchAllPages<ReportStatus>("/api/report-statuses"),
    LOOKUP_TTL_MS
  );
}
