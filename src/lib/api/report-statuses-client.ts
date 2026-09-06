import { apiFetch } from "@/lib/api/client-fetch";
import type { PaginatedResult, ReportStatus } from "@/lib/api/types";

export async function listReportStatuses(): Promise<ReportStatus[]> {
  const result = await apiFetch<PaginatedResult<ReportStatus>>(
    "/api/report-statuses"
  );
  return result.data;
}
