export interface CreateReportTaskInput {
  name: string;
  priorityTypeId: number;
  taskStatusId: number;
  planned?: number;
  actual?: number;
  plannedHour?: number;
  actualHour?: number;
  deliverable?: string;
}
