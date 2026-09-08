"use client";

import { useState } from "react";
import { CheckCircle2, CircleSlash, UserPlus, Users2 } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);

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

  const selectedMembers = users.filter((u) => draft.memberIds.includes(u.id));
  const selectedTeams = teams.filter((t) => draft.teamIds.includes(t.id));
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

        <div className="space-y-1.5">
          <Label>Assigned team members</Label>
          <p className="text-muted-foreground text-sm">
            Search and select the members allowed to create reports for this
            project.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-full border border-input px-3 py-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {selectedMembers.length === 0 ? (
                <span className="text-muted-foreground px-1 text-sm">
                  No members assigned
                </span>
              ) : (
                selectedMembers.map((m) => (
                  <span
                    key={m.id}
                    className="bg-secondary text-secondary-foreground inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium"
                  >
                    {m.name}
                  </span>
                ))
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => setPickerOpen(true)}
            >
              <UserPlus className="size-4" />
              Manage members
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Assigned teams</Label>
          <p className="text-muted-foreground text-sm">
            Everyone on an assigned team can create reports for this project,
            in addition to the individually assigned members above.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-full border border-input px-3 py-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {selectedTeams.length === 0 ? (
                <span className="text-muted-foreground px-1 text-sm">
                  No teams assigned
                </span>
              ) : (
                selectedTeams.map((t) => (
                  <span
                    key={t.id}
                    className="bg-secondary text-secondary-foreground inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium"
                  >
                    {t.name}
                  </span>
                ))
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => setTeamPickerOpen(true)}
            >
              <Users2 className="size-4" />
              Manage teams
            </Button>
          </div>
        </div>

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

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign team members</DialogTitle>
            <DialogDescription>
              Search the directory and select everyone who can submit reports
              for this project.
            </DialogDescription>
          </DialogHeader>
          <Command className="h-72 rounded-lg border border-border">
            <CommandInput placeholder="Search by name or email…" />
            <CommandList>
              <CommandEmpty>No members found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => {
                  const selected = draft.memberIds.includes(user.id);
                  return (
                    <CommandItem
                      key={user.id}
                      value={`${user.name} ${user.email}`}
                      onSelect={() => toggleMember(user.id)}
                      data-checked={selected}
                    >
                      <span className="flex-1">
                        {user.name}
                        <span className="text-muted-foreground ml-1.5 text-xs">
                          {user.email}
                        </span>
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          <DialogFooter>
            <Button type="button" onClick={() => setPickerOpen(false)}>
              Done — {selectedMembers.length} selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={teamPickerOpen} onOpenChange={setTeamPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign teams</DialogTitle>
            <DialogDescription>
              Every member of a selected team will be able to submit reports
              for this project.
            </DialogDescription>
          </DialogHeader>
          <Command className="h-72 rounded-lg border border-border">
            <CommandInput placeholder="Search by team name…" />
            <CommandList>
              <CommandEmpty>No teams found.</CommandEmpty>
              <CommandGroup>
                {teams.map((team) => {
                  const selected = draft.teamIds.includes(team.id);
                  return (
                    <CommandItem
                      key={team.id}
                      value={team.name}
                      onSelect={() => toggleTeam(team.id)}
                      data-checked={selected}
                    >
                      <span className="flex-1">{team.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          <DialogFooter>
            <Button type="button" onClick={() => setTeamPickerOpen(false)}>
              Done — {selectedTeams.length} selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
