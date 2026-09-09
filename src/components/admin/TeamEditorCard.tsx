"use client";

import { UserPlus } from "lucide-react";

import { EntityPickerField } from "@/components/admin/EntityPickerField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  function toggleMember(id: string) {
    const memberIds = draft.memberIds.includes(id)
      ? draft.memberIds.filter((m) => m !== id)
      : [...draft.memberIds, id];
    onChange({ ...draft, memberIds });
  }

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

        <EntityPickerField
          label="Members"
          description="Anyone on this team automatically gets access to every project assigned to the team."
          items={users}
          selectedIds={draft.memberIds}
          getId={(u) => u.id}
          getLabel={(u) => u.name}
          getSecondaryLabel={(u) => u.email}
          getSearchValue={(u) => `${u.name} ${u.email}`}
          getDisabledReason={(u) => {
            const otherTeam = otherTeamByUserId.get(u.id);
            return otherTeam ? `Already in ${otherTeam}` : undefined;
          }}
          onToggle={toggleMember}
          emptyChipsText="No members assigned"
          manageButtonLabel="Manage members"
          manageButtonIcon={<UserPlus className="size-4" />}
          dialogTitle="Assign members"
          dialogDescription="Search the directory and select everyone who belongs to this team."
          searchPlaceholder="Search by name or email…"
          emptyResultsText="No members found."
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
            {saving ? "Saving…" : "Save team"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
