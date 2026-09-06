export interface ReportHours {
  id: string;
  reportVersionId: string;
  reportHourTypeId: number;
  hours: string; // Prisma Decimal serializes as a string, e.g. "4.50"
}
