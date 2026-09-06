export interface CreateReportVersionRequest {
  reportId: string;
  reportStatusId: number;
  notes?: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  links?: string;
}
