export interface CreateTaskRequest {
  reportVersionId: string;
  name: string;
  priorityTypeId: string;
  taskStatusId: string;
  planned?: number;
  actual?: number;
  plannedHour?: number;
  actualHour?: number;
  deliverable?: string;
}
