import { apiFetch } from "@/lib/api/client-fetch";
import type { CreateReportWithVersionRequest } from "@/lib/api/types";

export async function createReportWithVersion(
  payload: CreateReportWithVersionRequest
): Promise<unknown> {
  return apiFetch<unknown>("/api/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
