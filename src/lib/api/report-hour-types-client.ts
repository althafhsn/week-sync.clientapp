import { makeLookupClient } from "@/lib/api/lookup-client-factory";
import type { ReportHourType } from "@/lib/api/types";

export const listReportHourTypes = makeLookupClient<ReportHourType>("/api/report-hour-types");
