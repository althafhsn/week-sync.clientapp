"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberField } from "@/components/ui/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PriorityType, TaskStatus as ApiTaskStatus } from "@/lib/api/types";
import type { ReportTask } from "@/lib/types";

export function TaskRow({
  task,
  index,
  priorityTypes,
  taskStatuses,
  onChange,
  onRemove,
  disableRemove,
}: {
  task: ReportTask;
  index: number;
  priorityTypes: PriorityType[];
  taskStatuses: ApiTaskStatus[];
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
            items={priorityTypes.map((p) => ({ value: p.id, label: p.name }))}
            value={task.priorityTypeId}
            onValueChange={(value) => {
              const selected = priorityTypes.find((p) => p.id === value);
              if (selected) {
                patch({
                  priorityTypeId: selected.id,
                  priorityName: selected.name,
                });
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue>{task.priorityName || "Select a priority"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {priorityTypes.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            items={taskStatuses.map((s) => ({ value: s.id, label: s.name }))}
            value={task.taskStatusId}
            onValueChange={(value) => {
              const selected = taskStatuses.find((s) => s.id === value);
              if (selected) {
                patch({ taskStatusId: selected.id, statusName: selected.name });
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue>{task.statusName || "Select a status"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {taskStatuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Planned %</Label>
          <NumberField
            min={0}
            max={100}
            value={task.plannedPct}
            onChange={(value) => patch({ plannedPct: value })}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Actual %</Label>
          <NumberField
            min={0}
            max={100}
            value={task.actualPct}
            onChange={(value) => patch({ actualPct: value })}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Planned hrs</Label>
          <NumberField
            min={0}
            value={task.plannedHours}
            onChange={(value) => patch({ plannedHours: value })}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Time spent</Label>
          <NumberField
            min={0}
            value={task.timeSpent}
            onChange={(value) => patch({ timeSpent: value })}
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
