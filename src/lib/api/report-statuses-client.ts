import { makeLookupClient } from "@/lib/api/lookup-client-factory";
import type { ReportStatus } from "@/lib/api/types";

export const listReportStatuses = makeLookupClient<ReportStatus>("/api/report-statuses");
