export interface ReportHours {
  id: string;
  reportVersionId: string;
  reportHourTypeId: string;
  hours: string; // Prisma Decimal serializes as a string, e.g. "4.50"
}
