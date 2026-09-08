import { fetchAllPages } from "@/lib/api/pagination-fetch";
import { cached, LOOKUP_TTL_MS } from "@/lib/api/request-cache";
import type { ReportHourType } from "@/lib/api/types";

export async function listReportHourTypes(): Promise<ReportHourType[]> {
  return cached(
    "/api/report-hour-types",
    () => fetchAllPages<ReportHourType>("/api/report-hour-types"),
    LOOKUP_TTL_MS
  );
}
