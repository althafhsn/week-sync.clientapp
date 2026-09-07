import type { ReportHighlightType } from "../lookups/report-highlight-type";

export interface ReportHighlight {
  id: string;
  reportId: string;
  reportHighlightTypeId: number;
  description: string | null;
  isKey: boolean;
  // present only when requested via ?include=
  reportHighlightType?: ReportHighlightType;
}
