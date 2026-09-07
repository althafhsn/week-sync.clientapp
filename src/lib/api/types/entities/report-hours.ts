import type { ReportHourType } from "../lookups/report-hour-type";

export interface ReportHours {
  id: string;
  reportId: string;
  reportHourTypeId: number;
  hours: string; // Prisma Decimal serializes as a string, e.g. "4.50"
  // present only when requested via ?include=
  reportHourType?: ReportHourType;
}
