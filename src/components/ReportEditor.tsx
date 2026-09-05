"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { TaskRow } from "@/components/report-editor/TaskRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { emptyReport, weeks } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import type { HoursByType, ReportTask, WeeklyReport } from "@/lib/types";

const HOUR_FIELDS: Array<{ key: keyof HoursByType; label: string }> = [
  { key: "development", label: "Development" },
  { key: "testing", label: "Testing" },
  { key: "meetings", label: "Meetings" },
  { key: "documentation", label: "Documentation" },
];

function makeTask(): ReportTask {
  return {
    id: `t-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    priority: "medium",
    plannedPct: 100,
    actualPct: 0,
    status: "in_progress",
    plannedHours: 0,
    timeSpent: 0,
    deliverable: "",
  };
}

export function ReportEditor({ existing }: { existing?: WeeklyReport }) {
  const router = useRouter();
  const { currentUser, projects, saveReport, submitReport } = useStore();

  const assignedProjects = projects.filter(
    (p) =>
      p.status === "active" &&
      currentUser &&
      p.memberIds.includes(currentUser.id)
  );

  const [report, setReport] = useState<WeeklyReport>(() =>
    existing
      ? structuredClone(existing)
      : emptyReport(currentUser?.id ?? "", assignedProjects[0]?.id ?? "")
  );

  const wasNeedsCorrection = existing?.status === "needs_correction";

  function patch(partial: Partial<WeeklyReport>) {
    setReport((prev) => ({ ...prev, ...partial }));
  }

  function patchHours(key: keyof HoursByType, value: number) {
    setReport((prev) => ({ ...prev, hours: { ...prev.hours, [key]: value } }));
  }

  function updateTask(id: string, task: ReportTask) {
    setReport((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? task : t)),
    }));
  }

  function addTask() {
    setReport((prev) => ({ ...prev, tasks: [...prev.tasks, makeTask()] }));
  }

  function removeTask(id: string) {
    setReport((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }

  function validate() {
    const projectValid = assignedProjects.some((p) => p.id === report.projectId);
    if (!projectValid) {
      toast.error("Select a valid project before saving.");
      return false;
    }
    if (report.tasks.some((t) => !t.name.trim())) {
      toast.error("Every task needs a name.");
      return false;
    }
    return true;
  }

  function handleSaveDraft() {
    if (!validate()) return;
    saveReport(report);
    toast.success("Draft saved.");
    router.push(`/reports/${report.id}`);
  }

  function handleSubmit() {
    if (!validate()) return;
    saveReport(report);
    submitReport(report.id);
    toast.success(
      wasNeedsCorrection ? "Report resubmitted for review." : "Report submitted for review."
    );
    router.push(`/reports/${report.id}`);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Reporting week</Label>
            <Select
              value={report.weekStart}
              onValueChange={(value) => {
                const week = weeks.find((w) => w.start === value);
                if (week) patch({ weekStart: week.start, weekEnd: week.end });
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((w) => (
                  <SelectItem key={w.start} value={w.start}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Project</Label>
            {assignedProjects.length === 0 ? (
              <p className="text-destructive text-sm">
                You have no active assigned projects — ask your manager to
                assign one before creating a report.
              </p>
            ) : (
              <Select
                value={report.projectId}
                onValueChange={(value) => patch({ projectId: value as string })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignedProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work completed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" variant="outline" size="sm" onClick={addTask}>
            <Plus className="size-4" />
            Add task
          </Button>
          {report.tasks.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              index={i}
              onChange={(next) => updateTask(task.id, next)}
              onRemove={() => removeTask(task.id)}
              disableRemove={report.tasks.length <= 1}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress &amp; plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tasks planned for next week</Label>
            <Textarea
              rows={4}
              value={report.nextWeekTasks}
              onChange={(e) => patch({ nextWeekTasks: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Achievements / highlights</Label>
            <Textarea
              rows={3}
              value={report.achievements}
              onChange={(e) => patch({ achievements: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Key achievement</Label>
            <Input
              value={report.keyAchievement}
              onChange={(e) => patch({ keyAchievement: e.target.value })}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risks &amp; effort</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Blockers / challenges</Label>
            <Textarea
              rows={3}
              value={report.blockers}
              onChange={(e) => patch({ blockers: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Key blocker</Label>
            <Input
              value={report.keyBlocker}
              onChange={(e) => patch({ keyBlocker: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Hours by type</Label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {HOUR_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-normal">
                    {field.label}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={report.hours[field.key]}
                    onChange={(e) =>
                      patchHours(field.key, Number(e.target.value))
                    }
                    className="h-10"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={report.notes}
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Links</Label>
            <Input
              value={report.links}
              onChange={(e) => patch({ links: e.target.value })}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={handleSaveDraft}
        >
          Save draft
        </Button>
        <Button type="button" className="h-11" onClick={handleSubmit}>
          {wasNeedsCorrection ? "Resubmit for review" : "Submit for review"}
        </Button>
      </div>
    </div>
  );
}
