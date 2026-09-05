"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type ReportTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";

const PRIORITIES = Object.keys(PRIORITY_LABEL) as TaskPriority[];
const STATUSES = Object.keys(TASK_STATUS_LABEL) as TaskStatus[];

export function TaskRow({
  task,
  index,
  onChange,
  onRemove,
  disableRemove,
}: {
  task: ReportTask;
  index: number;
  onChange: (task: ReportTask) => void;
  onRemove: () => void;
  disableRemove: boolean;
}) {
  function patch(partial: Partial<ReportTask>) {
    onChange({ ...task, ...partial });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          Task {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disableRemove}
          onClick={onRemove}
          aria-label="Remove task"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label>Task name</Label>
        <Input
          value={task.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="e.g. Invoice PDF renderer"
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select
            items={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
            value={task.priority}
            onValueChange={(value) =>
              patch({ priority: value as TaskPriority })
            }
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            items={STATUSES.map((s) => ({ value: s, label: TASK_STATUS_LABEL[s] }))}
            value={task.status}
            onValueChange={(value) => patch({ status: value as TaskStatus })}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {TASK_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Planned %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={task.plannedPct}
            onChange={(e) => patch({ plannedPct: Number(e.target.value) })}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Actual %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={task.actualPct}
            onChange={(e) => patch({ actualPct: Number(e.target.value) })}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Planned hrs</Label>
          <Input
            type="number"
            min={0}
            value={task.plannedHours}
            onChange={(e) => patch({ plannedHours: Number(e.target.value) })}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Time spent</Label>
          <Input
            type="number"
            min={0}
            value={task.timeSpent}
            onChange={(e) => patch({ timeSpent: Number(e.target.value) })}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Deliverable / link</Label>
        <Input
          value={task.deliverable}
          onChange={(e) => patch({ deliverable: e.target.value })}
          placeholder="PR link, doc, or output"
          className="h-10"
        />
      </div>
    </div>
  );
}
