import { STATUS_LABEL, type ReportStatus } from "@/lib/types";
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

// Keyed by lowercased status name so it works with the real task-statuses
// lookup ("In Progress", "Blocked", "Carried Over") rather than a fixed enum.
const TASK_STATUS_CLASSES: Record<string, string> = {
  completed: "bg-success/15 text-success dark:bg-success/25",
  "in progress": "bg-info/15 text-info dark:bg-info/25",
  blocked: "bg-destructive/10 text-destructive dark:bg-destructive/25",
  "carried over":
    "bg-muted text-muted-foreground dark:bg-white/10 dark:text-foreground/80",
};

export function TaskStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        TASK_STATUS_CLASSES[status.toLowerCase()] ??
          "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {status}
    </span>
  );
}

// Keyed by lowercased priority name for the same reason — the real
// priority-types lookup ("Medium", "High", "Critical") drives this now.
const PRIORITY_CLASSES: Record<string, string> = {
  low: "bg-muted text-muted-foreground dark:bg-white/10 dark:text-foreground/80",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-warning/25 text-warning-foreground dark:bg-warning/25 dark:text-warning",
  critical: "bg-destructive/15 text-destructive dark:bg-destructive/25",
};

// Keyed by lowercased status name so it works for any {id, name} lookup
// row from the real API (e.g. "Proposed", "Active", "Archived"), not just
// the demo string-union enum.
const PROJECT_STATUS_CLASSES: Record<string, string> = {
  proposed: "bg-info/15 text-info dark:bg-info/25",
  active: "bg-success/15 text-success dark:bg-success/25",
  archived:
    "bg-muted text-muted-foreground dark:bg-white/10 dark:text-foreground/80",
};

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        PROJECT_STATUS_CLASSES[status.toLowerCase()] ??
          "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {status}
    </span>
  );
}

export function PriorityTag({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center rounded px-1.5 text-[0.7rem] font-medium whitespace-nowrap",
        PRIORITY_CLASSES[priority.toLowerCase()] ??
          "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {priority}
    </span>
  );
}
