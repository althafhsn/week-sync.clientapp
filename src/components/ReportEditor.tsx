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
import { emptyReport } from "@/lib/demo-data";
import { apiProjectToProject, apiReportToWeeklyReport } from "@/lib/api/mappers";
import { useStore } from "@/lib/store";
import { listProjects } from "@/lib/api/projects-client";
import { listPriorityTypes } from "@/lib/api/priority-types-client";
import { listTaskStatuses } from "@/lib/api/task-statuses-client";
import { listReportHighlightTypes } from "@/lib/api/report-highlight-types-client";
import { listReportHourTypes } from "@/lib/api/report-hour-types-client";
import { listReportStatuses } from "@/lib/api/report-statuses-client";
import { createReportWithVersion, updateReport } from "@/lib/api/reports-client";
import type {
  CreateReportHoursInput,
  CreateReportWithVersionRequest,
  PriorityType,
  ReportHighlightType,
  ReportHourType,
  ReportStatus as ApiReportStatus,
  TaskStatus as ApiTaskStatus,
  UpdateReportRequest,
} from "@/lib/api/types";
import type {
  HighlightEntry,
  HoursByType,
  ReportTask,
  WeeklyReport,
} from "@/lib/types";

const ASSIGNED_PROJECTS_INCLUDE = ["users", "projectStatus"];

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
  const { currentUser, upsertReport, upsertProject } = useStore();

  const [assignedProjects, setAssignedProjects] = useState<
    ReturnType<typeof apiProjectToProject>[]
  >([]);
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
          .map(apiProjectToProject);
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

  const wasNeedsCorrection = existing?.status === "needs_correction";

  function patch(partial: Partial<WeeklyReport>) {
    setReport((prev) => ({ ...prev, ...partial }));
  }

  function patchHours(key: keyof HoursByType, value: number) {
    const clamped = Number.isNaN(value) ? 0 : Math.max(0, value);
    setReport((prev) => ({ ...prev, hours: { ...prev.hours, [key]: clamped } }));
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

  // Builds the real backend's nested payload fields from the current local
  // report state, shared between create (wrapped with userId/projectId) and
  // update (sent as-is against the existing report's id).
  function buildVersionFields(
    statusName: string
  ): (UpdateReportRequest & {
    reportStatusId: number;
    startDate: string;
    endDate: string;
  }) | null {
    const status = reportStatuses.find((s) => s.name === statusName);
    if (!status) return null;

    const hours: CreateReportHoursInput[] = HOUR_FIELDS.map((field) => {
      const hourType = reportHourTypes.find((t) => t.name === field.realName);
      return { reportHourTypeId: hourType?.id ?? 0, hours: report.hours[field.key] };
    }).filter((h) => h.reportHourTypeId !== 0);

    return {
      projectId: report.projectId,
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
      reportNextWeekTasks: report.nextWeekTasks
        .filter((t) => t.description.trim())
        .map((t) => ({ description: t.description })),
      reportHighlights: [...report.achievements, ...report.blockers].map((e) => ({
        reportHighlightTypeId: e.reportHighlightTypeId,
        description: e.description || undefined,
        isKey: e.isKey,
      })),
      reportHours: hours,
    };
  }

  async function saveWithStatus(statusName: string) {
    const fields = buildVersionFields(statusName);
    if (!fields || !currentUser) {
      toast.error("Could not prepare the report — try reloading the page.");
      return null;
    }

    const payload: CreateReportWithVersionRequest = {
      userId: currentUser.id,
      projectId: report.projectId,
      ...fields,
      tasks: fields.tasks ?? [],
      reportNextWeekTasks: fields.reportNextWeekTasks ?? [],
      reportHighlights: fields.reportHighlights ?? [],
      reportHours: fields.reportHours ?? [],
    };

    setSubmitting(true);
    try {
      const saved = existing
        ? await updateReport(existing.id, fields)
        : await createReportWithVersion(payload);
      const mapped = apiReportToWeeklyReport(saved);
      upsertReport(mapped);
      return mapped;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save the report.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    if (!validate() || submitting) return;
    const saved = await saveWithStatus("Draft");
    if (!saved) return;
    toast.success("Draft saved.");
    router.push(`/reports/${saved.id}`);
  }

  async function handleSubmit() {
    if (!validate() || submitting) return;
    const saved = await saveWithStatus("Submitted");
    if (!saved) return;
    toast.success(
      wasNeedsCorrection ? "Report resubmitted for review." : "Report submitted for review."
    );
    router.push(`/reports/${saved.id}`);
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
          </div>

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
