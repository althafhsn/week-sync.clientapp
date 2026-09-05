import {
  PRIORITY_LABEL,
  PROJECT_STATUS_LABEL,
  STATUS_LABEL,
  TASK_STATUS_LABEL,
  type ProjectStatus,
  type ReportStatus,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<ReportStatus, string> = {
  approved: "bg-success/15 text-success dark:bg-success/25",
  submitted: "bg-info/15 text-info dark:bg-info/25",
  needs_correction:
    "bg-warning/25 text-warning-foreground dark:bg-warning/25 dark:text-warning",
  draft: "bg-muted text-muted-foreground dark:bg-white/10 dark:text-foreground/80",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        STATUS_CLASSES[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
  completed: "bg-success/15 text-success dark:bg-success/25",
  in_progress: "bg-info/15 text-info dark:bg-info/25",
  blocked: "bg-destructive/10 text-destructive dark:bg-destructive/25",
  carried_over:
    "bg-muted text-muted-foreground dark:bg-white/10 dark:text-foreground/80",
};

export function TaskStatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        TASK_STATUS_CLASSES[status],
        className
      )}
    >
      {TASK_STATUS_LABEL[status]}
    </span>
  );
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground dark:bg-white/10 dark:text-foreground/80",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-warning/25 text-warning-foreground dark:bg-warning/25 dark:text-warning",
  critical: "bg-destructive/15 text-destructive dark:bg-destructive/25",
};

const PROJECT_STATUS_CLASSES: Record<ProjectStatus, string> = {
  proposed: "bg-info/15 text-info dark:bg-info/25",
  active: "bg-success/15 text-success dark:bg-success/25",
  archived:
    "bg-muted text-muted-foreground dark:bg-white/10 dark:text-foreground/80",
};

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        PROJECT_STATUS_CLASSES[status],
        className
      )}
    >
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityTag({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center rounded px-1.5 text-[0.7rem] font-medium whitespace-nowrap",
        PRIORITY_CLASSES[priority],
        className
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
