"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import type { Team, User } from "@/lib/api/types";

export interface TeamDraft {
  id: string | null;
  name: string;
  isActive: boolean;
  memberIds: string[];
}

export function TeamEditorCard({
  draft,
  users,
  allTeams,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  draft: TeamDraft;
  users: User[];
  /** Every team's current membership, used to keep a user from being picked
   * for more than one team at a time. */
  allTeams: Team[];
  saving: boolean;
  onChange: (draft: TeamDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function toggleMember(id: string) {
    const memberIds = draft.memberIds.includes(id)
      ? draft.memberIds.filter((m) => m !== id)
      : [...draft.memberIds, id];
    onChange({ ...draft, memberIds });
  }

  const selectedMembers = users.filter((u) => draft.memberIds.includes(u.id));

  // A user already on some other team can't be picked for this one - map
  // them to the name of the team they're already in, excluding this draft's
  // own team so its current members stay selectable.
  const otherTeamByUserId = new Map<string, string>();
  for (const team of allTeams) {
    if (team.id === draft.id) continue;
    for (const member of team.teamMembers ?? []) {
      otherTeamByUserId.set(member.userId, team.name);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{draft.id ? "Edit team" : "New team"}</CardTitle>
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
          <Label>Active</Label>
          <div className="flex h-10 items-center gap-2">
            <Switch
              checked={draft.isActive}
              onCheckedChange={(checked) => onChange({ ...draft, isActive: checked })}
            />
            <span className="text-muted-foreground text-sm">
              {draft.isActive ? "Team enabled" : "Team disabled"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Members</Label>
          <p className="text-muted-foreground text-sm">
            Anyone on this team automatically gets access to every project
            assigned to the team.
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
            {saving ? "Saving…" : "Save team"}
          </Button>
        </div>
      </CardContent>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign members</DialogTitle>
            <DialogDescription>
              Search the directory and select everyone who belongs to this
              team.
            </DialogDescription>
          </DialogHeader>
          <Command className="h-72 rounded-lg border border-border">
            <CommandInput placeholder="Search by name or email…" />
            <CommandList>
              <CommandEmpty>No members found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => {
                  const selected = draft.memberIds.includes(user.id);
                  const otherTeam = otherTeamByUserId.get(user.id);
                  return (
                    <CommandItem
                      key={user.id}
                      value={`${user.name} ${user.email}`}
                      onSelect={() => toggleMember(user.id)}
                      data-checked={selected}
                      disabled={!!otherTeam}
                    >
                      <span className="flex-1">
                        {user.name}
                        <span className="text-muted-foreground ml-1.5 text-xs">
                          {user.email}
                        </span>
                        {otherTeam ? (
                          <span className="text-muted-foreground ml-1.5 text-xs italic">
                            Already in {otherTeam}
                          </span>
                        ) : null}
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
    </Card>
  );
}
