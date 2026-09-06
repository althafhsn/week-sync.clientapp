"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { DateField } from "@/components/DateField";
import { EntryListField } from "@/components/report-editor/EntryListField";
import { NextWeekTaskList } from "@/components/report-editor/NextWeekTaskList";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { emptyReport, weekLabel, weeks } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { listProjects } from "@/lib/api/projects-client";
import { listPriorityTypes } from "@/lib/api/priority-types-client";
import { listTaskStatuses } from "@/lib/api/task-statuses-client";
import { listReportHighlightTypes } from "@/lib/api/report-highlight-types-client";
import { listReportHourTypes } from "@/lib/api/report-hour-types-client";
import { listReportStatuses } from "@/lib/api/report-statuses-client";
import { createReportWithVersion } from "@/lib/api/reports-client";
import type {
  CreateReportHoursInput,
  CreateReportWithVersionRequest,
  Project as ApiProject,
  PriorityType,
  ReportHighlightType,
  ReportHourType,
  ReportStatus as ApiReportStatus,
  TaskStatus as ApiTaskStatus,
} from "@/lib/api/types";
import type {
  HighlightEntry,
  HoursByType,
  Project,
  ReportTask,
  WeeklyReport,
} from "@/lib/types";

const ASSIGNED_PROJECTS_INCLUDE = ["users", "projectStatus"];

// Mirrors a real backend project into the demo Project shape so the
// existing lookups (report tables, review pages, etc.) that resolve
// report.projectId against the demo store's projects list keep working
// unchanged, the same trick used for the logged-in user at login time.
function toDemoProject(project: ApiProject): Project {
  return {
    id: project.id,
    name: project.name,
    category: "",
    description: project.description ?? "",
    status: "active",
    memberIds: (project.userProjects ?? []).map((up) => up.userId),
  };
}

const HOUR_FIELDS: Array<{
  key: keyof HoursByType;
  label: string;
  realName: string;
}> = [
  { key: "development", label: "Development", realName: "Development" },
  { key: "testing", label: "Testing", realName: "Testing" },
  { key: "meetings", label: "Meetings", realName: "Meeting" },
  { key: "documentation", label: "Documentation", realName: "Documentation" },
];

function makeTask(
  priorityTypes: PriorityType[],
  taskStatuses: ApiTaskStatus[]
): ReportTask {
  const priority = priorityTypes.find((p) => p.name === "Medium") ?? priorityTypes[0];
  const status = taskStatuses.find((s) => s.name === "In Progress") ?? taskStatuses[0];
  return {
    id: `t-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    priorityTypeId: priority?.id ?? 0,
    priorityName: priority?.name ?? "",
    plannedPct: 100,
    actualPct: 0,
    taskStatusId: status?.id ?? 0,
    statusName: status?.name ?? "",
    plannedHours: 0,
    timeSpent: 0,
    deliverable: "",
  };
}

function makeHighlightEntry(
  types: ReportHighlightType[],
  isKey: boolean,
  idPrefix: string
): HighlightEntry {
  const type = types[0];
  return {
    id: `${idPrefix}-${Math.random().toString(36).slice(2, 8)}`,
    reportHighlightTypeId: type?.id ?? 0,
    typeName: type?.name ?? "",
    description: "",
    isKey,
  };
}

export function ReportEditor({ existing }: { existing?: WeeklyReport }) {
  const router = useRouter();
  const { currentUser, saveReport, submitReport, upsertProject } = useStore();

  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [priorityTypes, setPriorityTypes] = useState<PriorityType[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<ApiTaskStatus[]>([]);
  const [highlightTypes, setHighlightTypes] = useState<ReportHighlightType[]>([]);
  const [reportHourTypes, setReportHourTypes] = useState<ReportHourType[]>([]);
  const [reportStatuses, setReportStatuses] = useState<ApiReportStatus[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const achievementTypes = highlightTypes.filter((t) => t.category === "ACHIEVEMENT");
  const blockerTypes = highlightTypes.filter((t) => t.category === "BLOCKER");

  const [report, setReport] = useState<WeeklyReport>(() =>
    existing
      ? structuredClone(existing)
      : emptyReport(currentUser?.id ?? "", "")
  );

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    Promise.all([
      listProjects(ASSIGNED_PROJECTS_INCLUDE, { userId: currentUser.id }),
      listPriorityTypes(),
      listTaskStatuses(),
      listReportHighlightTypes(),
      listReportHourTypes(),
      listReportStatuses(),
    ])
      .then(([realProjects, priorities, statuses, highlights, hourTypes, statusList]) => {
        if (cancelled) return;
        const active = realProjects
          .filter((p) => p.projectStatus?.name.toLowerCase() === "active")
          .map(toDemoProject);
        active.forEach(upsertProject);
        setAssignedProjects(active);
        setPriorityTypes(priorities);
        setTaskStatuses(statuses);
        setHighlightTypes(highlights);
        setReportHourTypes(hourTypes);
        setReportStatuses(statusList);
        if (!existing && active.length > 0) {
          setReport((prev) =>
            prev.projectId ? prev : { ...prev, projectId: active[0].id }
          );
        }
      })
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load the report form's data."
        )
      )
      .finally(() => {
        if (!cancelled) setLoadingLookups(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const [weekMode, setWeekMode] = useState<"preset" | "custom">(() =>
    weeks.some((w) => w.start === report.weekStart && w.end === report.weekEnd)
      ? "preset"
      : "custom"
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
    setReport((prev) => ({
      ...prev,
      tasks: [...prev.tasks, makeTask(priorityTypes, taskStatuses)],
    }));
  }

  function removeTask(id: string) {
    setReport((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }

  function validate() {
    if (!report.weekStart || !report.weekEnd) {
      toast.error("Select both a week start and end date.");
      return false;
    }
    if (report.weekEnd < report.weekStart) {
      toast.error("The week end date can't be before the start date.");
      return false;
    }
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

  // Builds the real backend's nested create payload from the current local
  // report state. Only meaningful for a brand-new report — there's no
  // confirmed "update" endpoint yet, so editing/resubmitting an existing
  // report (see the `existing` guard at each call site) stays local-only
  // for now rather than risk creating a duplicate report on the backend.
  function buildCreatePayload(statusName: string): CreateReportWithVersionRequest | null {
    const status = reportStatuses.find((s) => s.name === statusName);
    if (!currentUser || !status) return null;

    const hours: CreateReportHoursInput[] = HOUR_FIELDS.map((field) => {
      const hourType = reportHourTypes.find((t) => t.name === field.realName);
      return { reportHourTypeId: hourType?.id ?? 0, hours: report.hours[field.key] };
    }).filter((h) => h.reportHourTypeId !== 0);

    return {
      userId: currentUser.id,
      projectId: report.projectId,
      version: {
        reportStatusId: status.id,
        notes: report.notes || undefined,
        startDate: report.weekStart,
        endDate: report.weekEnd,
        links: report.links || undefined,
        tasks: report.tasks.map((t) => ({
          name: t.name,
          priorityTypeId: t.priorityTypeId,
          taskStatusId: t.taskStatusId,
          planned: t.plannedPct,
          actual: t.actualPct,
          plannedHour: t.plannedHours,
          actualHour: t.timeSpent,
          deliverable: t.deliverable || undefined,
        })),
        nextWeekTasks: report.nextWeekTasks
          .filter((t) => t.description.trim())
          .map((t) => ({ description: t.description })),
        highlights: [...report.achievements, ...report.blockers].map((e) => ({
          reportHighlightTypeId: e.reportHighlightTypeId,
          isKey: e.isKey,
        })),
        hours,
      },
    };
  }

  async function handleSaveDraft() {
    if (!validate() || submitting) return;

    if (!existing) {
      const payload = buildCreatePayload("Draft");
      if (!payload) {
        toast.error("Could not prepare the report — try reloading the page.");
        return;
      }
      setSubmitting(true);
      try {
        await createReportWithVersion(payload);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save the report.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }

    saveReport(report);
    toast.success("Draft saved.");
    router.push(`/reports/${report.id}`);
  }

  async function handleSubmit() {
    if (!validate() || submitting) return;

    if (!existing) {
      const payload = buildCreatePayload("Submitted");
      if (!payload) {
        toast.error("Could not prepare the report — try reloading the page.");
        return;
      }
      setSubmitting(true);
      try {
        await createReportWithVersion(payload);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to submit the report."
        );
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }

    saveReport(report);
    submitReport(report.id);
    toast.success(
      wasNeedsCorrection ? "Report resubmitted for review." : "Report submitted for review."
    );
    router.push(`/reports/${report.id}`);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Reporting period</Label>
            <div className="bg-muted flex h-10 w-full items-center gap-1 rounded-lg p-1 sm:max-w-xs">
              <Button
                type="button"
                size="sm"
                variant={weekMode === "preset" ? "default" : "ghost"}
                className="h-8 flex-1"
                onClick={() => setWeekMode("preset")}
              >
                Preset week
              </Button>
              <Button
                type="button"
                size="sm"
                variant={weekMode === "custom" ? "default" : "ghost"}
                className="h-8 flex-1"
                onClick={() => setWeekMode("custom")}
              >
                Custom date range
              </Button>
            </div>
          </div>

          {weekMode === "preset" ? (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Week</Label>
              <Select
                items={weeks.map((w) => ({
                  value: w.start,
                  label: weekLabel(w.start, w.end),
                }))}
                value={report.weekStart}
                onValueChange={(value) => {
                  const week = weeks.find((w) => w.start === value);
                  if (week) patch({ weekStart: week.start, weekEnd: week.end });
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue>
                    {weekLabel(report.weekStart, report.weekEnd)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((w) => (
                    <SelectItem key={w.start} value={w.start}>
                      {weekLabel(w.start, w.end)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Week start</Label>
                <DateField
                  value={report.weekStart}
                  onChange={(weekStart) => patch({ weekStart })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Week end</Label>
                <DateField
                  value={report.weekEnd}
                  minDate={report.weekStart}
                  onChange={(weekEnd) => patch({ weekEnd })}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Project</Label>
            {loadingLookups ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : assignedProjects.length === 0 ? (
              <p className="text-destructive text-sm">
                You have no active assigned projects — ask your manager to
                assign one before creating a report.
              </p>
            ) : (
              <Select
                items={assignedProjects.map((p) => ({ value: p.id, label: p.name }))}
                value={report.projectId}
                onValueChange={(value) => patch({ projectId: value as string })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue>
                    {assignedProjects.find((p) => p.id === report.projectId)?.name ??
                      "Select a project"}
                  </SelectValue>
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
              priorityTypes={priorityTypes}
              taskStatuses={taskStatuses}
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
            <NextWeekTaskList
              items={report.nextWeekTasks}
              onChange={(nextWeekTasks) => patch({ nextWeekTasks })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Achievements / Highlights</Label>
            <EntryListField
              items={report.achievements}
              typeOptions={achievementTypes}
              addLabel="Add"
              keyLabel="key Achievement"
              onChange={(achievements) => patch({ achievements })}
              makeEntry={() =>
                makeHighlightEntry(
                  achievementTypes,
                  report.achievements.length === 0,
                  "ach"
                )
              }
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
            <EntryListField
              items={report.blockers}
              typeOptions={blockerTypes}
              addLabel="Add "
              keyLabel="key Issue"
              onChange={(blockers) => patch({ blockers })}
              makeEntry={() =>
                makeHighlightEntry(
                  blockerTypes,
                  report.blockers.length === 0,
                  "blk"
                )
              }
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
          disabled={loadingLookups || submitting}
        >
          {submitting ? "Saving…" : "Save draft"}
        </Button>
        <Button
          type="button"
          className="h-11"
          onClick={handleSubmit}
          disabled={loadingLookups || submitting}
        >
          {submitting
            ? "Submitting…"
            : wasNeedsCorrection
              ? "Resubmit for review"
              : "Submit for review"}
        </Button>
      </div>
    </div>
  );
}
