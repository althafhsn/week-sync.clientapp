import type { ReportVersion } from "./report-version";

export interface Report {
  id: string;
  userId: string;
  projectId: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  reportVersions?: ReportVersion[];
}
