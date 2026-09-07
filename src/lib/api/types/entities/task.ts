import type { PriorityType } from "../lookups/priority-type";
import type { TaskStatus } from "../lookups/task-status";

export interface Task {
  id: string;
  reportId: string;
  name: string;
  priorityTypeId: number;
  taskStatusId: number;
  planned: number | null;
  actual: number | null;
  plannedHour: number | null;
  actualHour: number | null;
  deliverable: string | null;
  // present only when requested via ?include=
  priorityType?: PriorityType;
  taskStatus?: TaskStatus;
}
