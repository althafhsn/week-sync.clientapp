"use client";

import { useState } from "react";
import { Eye, EyeOff, Info, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateTempPassword } from "@/lib/password";
import type { Role, Team, UserStatus } from "@/lib/api/types";

export interface UserDraft {
  id: string | null;
  name: string;
  email: string;
  jobTitle: string;
  password: string; // new temp password; blank on edit means "leave unchanged"
  roleId: number | null;
  teamId: string | null;
  userStatusId: number | null;
  mustChangePassword: boolean;
  isActive: boolean;
}

const NO_TEAM = "__none__";

export function UserEditorCard({
  draft,
  roles,
  teams,
  statuses,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  draft: UserDraft;
  roles: Role[];
  teams: Team[];
  statuses: UserStatus[];
  saving: boolean;
  onChange: (draft: UserDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [reveal, setReveal] = useState(false);
  const isEdit = draft.id !== null;

  function handleGenerate() {
    onChange({
      ...draft,
      password: generateTempPassword(),
      mustChangePassword: true,
    });
    setReveal(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit user" : "New user"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => onChange({ ...draft, email: e.target.value })}
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Job title</Label>
          <Input
            value={draft.jobTitle}
            onChange={(e) => onChange({ ...draft, jobTitle: e.target.value })}
            className="h-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              items={roles.map((r) => ({ value: r.id, label: r.name }))}
              value={draft.roleId}
              onValueChange={(value) =>
                onChange({ ...draft, roleId: value ?? draft.roleId })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue>
                  {roles.find((r) => r.id === draft.roleId)?.name ?? "Select a role"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Approval status</Label>
            <Select
              items={statuses.map((s) => ({ value: s.id, label: s.name }))}
              value={draft.userStatusId}
              onValueChange={(value) =>
                onChange({ ...draft, userStatusId: value ?? draft.userStatusId })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue>
                  {statuses.find((s) => s.id === draft.userStatusId)?.name ??
                    "Select a status"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Active</Label>
          <div className="flex h-10 items-center gap-2">
            <Switch
              checked={draft.isActive}
              onCheckedChange={(checked) =>
                onChange({ ...draft, isActive: checked })
              }
            />
            <span className="text-muted-foreground text-sm">
              {draft.isActive ? "Account enabled" : "Account disabled"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Team</Label>
          <Select
            items={[
              { value: NO_TEAM, label: "No team" },
              ...teams.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={draft.teamId ?? NO_TEAM}
            onValueChange={(value) =>
              onChange({ ...draft, teamId: value === NO_TEAM ? null : value })
            }
          >
            <SelectTrigger className="h-10 w-full sm:w-56">
              <SelectValue>
                {teams.find((t) => t.id === draft.teamId)?.name ?? "No team"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TEAM}>No team</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Assigning a team gives this user access to every project shared
            with that team.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label>{isEdit ? "Reset password" : "Temporary password"}</Label>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="About the temporary password"
                  />
                }
              >
                <Info className="size-3.5 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                {isEdit
                  ? "Leave blank to keep the current password. Setting one forces the user to change it at next sign-in."
                  : "The user signs in with this password and must set their own before they can reach their dashboard."}
              </TooltipContent>
            </Tooltip>
          </div>
          <InputGroup className="h-10">
            <InputGroupInput
              type={reveal ? "text" : "password"}
              value={draft.password}
              onChange={(e) =>
                onChange({
                  ...draft,
                  password: e.target.value,
                  mustChangePassword: e.target.value ? true : draft.mustChangePassword,
                })
              }
              placeholder={reveal ? "Password" : "••••••••"}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      aria-label={reveal ? "Hide password" : "Show password"}
                      onClick={() => setReveal((v) => !v)}
                    />
                  }
                >
                  {reveal ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {reveal ? "Hide password" : "Show password"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      aria-label="Generate password"
                      onClick={handleGenerate}
                    />
                  }
                >
                  <RefreshCw className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Generate a temporary password</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
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
            {saving ? "Saving…" : "Save user"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
