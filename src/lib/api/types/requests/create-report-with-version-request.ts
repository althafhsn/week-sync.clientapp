import type { CreateReportVersionInput } from "./create-report-version-input";

export interface CreateReportWithVersionRequest {
  userId: string;
  projectId: string;
  version: CreateReportVersionInput;
}
