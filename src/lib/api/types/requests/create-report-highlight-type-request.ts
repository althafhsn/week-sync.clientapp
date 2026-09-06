import type { ReportHighlightCategory } from "../enums";

export interface CreateReportHighlightTypeRequest {
  name: string;
  category: ReportHighlightCategory;
}
