import { PriorityTag, StatusBadge, TaskStatusBadge } from "@/components/StatusBadge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WeeklyReport } from "@/lib/types";

export function ReportWorkCard({
  report,
  title = "Work completed",
}: {
  report: WeeklyReport;
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <StatusBadge status={report.status} />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {report.tasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">
                {task.name || "Untitled task"}
              </p>
              <PriorityTag priority={task.priority} />
              <TaskStatusBadge status={task.status} />
            </div>
            {task.deliverable ? (
              <p className="text-muted-foreground mt-1 text-sm">
                {task.deliverable}
              </p>
            ) : null}
            <p className="text-muted-foreground mt-2 text-xs">
              {task.actualPct}% / {task.plannedPct}% planned ·{" "}
              {task.timeSpent}h / {task.plannedHours}h planned
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
