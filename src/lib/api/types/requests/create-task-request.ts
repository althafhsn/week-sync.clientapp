export interface CreateTaskRequest {
  reportVersionId: string;
  name: string;
  priorityTypeId: number;
  taskStatusId: number;
  planned?: number;
  actual?: number;
  plannedHour?: number;
  actualHour?: number;
  deliverable?: string;
}
