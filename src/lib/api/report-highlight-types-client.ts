import { makeLookupClient } from "@/lib/api/lookup-client-factory";
import type { ReportHighlightType } from "@/lib/api/types";

export const listReportHighlightTypes = makeLookupClient<ReportHighlightType>(
  "/api/report-highlight-types"
);
