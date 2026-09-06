export interface Task {
  id: string;
  reportVersionId: string;
  name: string;
  priorityTypeId: string;
  taskStatusId: string;
  planned: number | null;
  actual: number | null;
  plannedHour: number | null;
  actualHour: number | null;
  deliverable: string | null;
}
