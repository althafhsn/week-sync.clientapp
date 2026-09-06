import type { ReportHighlightCategory } from "../enums";

export interface UpdateReportHighlightTypeRequest {
  name?: string;
  category?: ReportHighlightCategory;
}
