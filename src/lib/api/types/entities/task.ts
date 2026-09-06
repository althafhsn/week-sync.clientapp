export interface Task {
  id: string;
  reportVersionId: string;
  name: string;
  priorityTypeId: number;
  taskStatusId: number;
  planned: number | null;
  actual: number | null;
  plannedHour: number | null;
  actualHour: number | null;
  deliverable: string | null;
}
