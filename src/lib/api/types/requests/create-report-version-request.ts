export interface CreateReportVersionRequest {
  reportId: string;
  reportStatusId: string;
  notes?: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  links?: string;
}
