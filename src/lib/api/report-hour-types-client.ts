import { apiFetch } from "@/lib/api/client-fetch";
import type { PaginatedResult, ReportHourType } from "@/lib/api/types";

export async function listReportHourTypes(): Promise<ReportHourType[]> {
  const result = await apiFetch<PaginatedResult<ReportHourType>>(
    "/api/report-hour-types"
  );
  return result.data;
}
