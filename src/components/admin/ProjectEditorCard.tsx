"use client";

import { CheckCircle2, CircleSlash, UserPlus, Users2 } from "lucide-react";

import { EntityPickerField } from "@/components/admin/EntityPickerField";
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
import type { ProjectStatus, Team, User } from "@/lib/api/types";

export interface ProjectDraft {
  id: string | null;
  name: string;
  description: string;
  projectStatusId: number | null;
  isActive: boolean;
  memberIds: string[];
  teamIds: string[];
}

export function ProjectEditorCard({
  draft,
  statuses,
  users,
  teams,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  draft: ProjectDraft;
  statuses: ProjectStatus[];
  users: User[];
  teams: Team[];
  saving: boolean;
  onChange: (draft: ProjectDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  function toggleMember(id: string) {
    const memberIds = draft.memberIds.includes(id)
      ? draft.memberIds.filter((m) => m !== id)
      : [...draft.memberIds, id];
    onChange({ ...draft, memberIds });
  }

  function toggleTeam(id: string) {
    const teamIds = draft.teamIds.includes(id)
      ? draft.teamIds.filter((t) => t !== id)
      : [...draft.teamIds, id];
    onChange({ ...draft, teamIds });
  }

  const activeStatusName = statuses.find(
    (s) => s.id === draft.projectStatusId
  )?.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{draft.id ? "Edit project" : "New project"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={draft.description}
            onChange={(e) =>
              onChange({ ...draft, description: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            items={statuses.map((s) => ({ value: s.id, label: s.name }))}
            value={draft.projectStatusId}
            onValueChange={(value) =>
              onChange({ ...draft, projectStatusId: value ?? draft.projectStatusId })
            }
          >
            <SelectTrigger className="h-10 w-full sm:w-56">
              <SelectValue>{activeStatusName ?? "Select a status"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeStatusName?.toLowerCase() === "active" ? (
            <p className="text-success flex items-center gap-1.5 text-xs font-medium">
              <CheckCircle2 className="size-3.5" />
              Available for new reports
            </p>
          ) : (
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <CircleSlash className="size-3.5" />
              Not available for new reports — only Active projects can be
              selected when a member creates one.
            </p>
          )}
        </div>

        <EntityPickerField
          label="Assigned team members"
          description="Search and select the members allowed to create reports for this project."
          items={users}
          selectedIds={draft.memberIds}
          getId={(u) => u.id}
          getLabel={(u) => u.name}
          getSecondaryLabel={(u) => u.email}
          getSearchValue={(u) => `${u.name} ${u.email}`}
          onToggle={toggleMember}
          emptyChipsText="No members assigned"
          manageButtonLabel="Manage members"
          manageButtonIcon={<UserPlus className="size-4" />}
          dialogTitle="Assign team members"
          dialogDescription="Search the directory and select everyone who can submit reports for this project."
          searchPlaceholder="Search by name or email…"
          emptyResultsText="No members found."
        />

        <EntityPickerField
          label="Assigned teams"
          description="Everyone on an assigned team can create reports for this project, in addition to the individually assigned members above."
          items={teams}
          selectedIds={draft.teamIds}
          getId={(t) => t.id}
          getLabel={(t) => t.name}
          getSearchValue={(t) => t.name}
          onToggle={toggleTeam}
          emptyChipsText="No teams assigned"
          manageButtonLabel="Manage teams"
          manageButtonIcon={<Users2 className="size-4" />}
          dialogTitle="Assign teams"
          dialogDescription="Every member of a selected team will be able to submit reports for this project."
          searchPlaceholder="Search by team name…"
          emptyResultsText="No teams found."
        />

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" className="h-10" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save project"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
