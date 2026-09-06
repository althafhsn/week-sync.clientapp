import type { ReportHighlightCategory } from "../enums";

export interface ReportHighlightType {
  id: number;
  name: string;
  category: ReportHighlightCategory;
}
