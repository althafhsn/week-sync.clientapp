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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateTempPassword } from "@/lib/password";
import type { Role, User } from "@/lib/types";

export function UserEditorCard({
  user,
  onChange,
  onCancel,
  onSave,
}: {
  user: User;
  onChange: (user: User) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [reveal, setReveal] = useState(false);

  function handleGenerate() {
    onChange({
      ...user,
      password: generateTempPassword(),
      mustChangePassword: true,
    });
    setReveal(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name ? "Edit user" : "New user"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={user.name}
              onChange={(e) => onChange({ ...user, name: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={user.email}
              onChange={(e) => onChange({ ...user, email: e.target.value })}
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              items={[
                { value: "member", label: "Team member" },
                { value: "manager", label: "Manager" },
              ]}
              value={user.role}
              onValueChange={(value) =>
                onChange({ ...user, role: value as Role })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Team member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>                                                                    
          <div className="space-y-1.5">
            <Label>Team</Label>
            <Input
              value={user.team}
              onChange={(e) => onChange({ ...user, team: e.target.value })}
              className="h-10"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Job title</Label>
            <Input
              value={user.title}
              onChange={(e) => onChange({ ...user, title: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Temporary password</Label>
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
                  The user signs in with this password and must set their own
                  before they can reach their dashboard.
                </TooltipContent>
              </Tooltip>
            </div>
            <InputGroup className="h-10">
              <InputGroupInput
                type={reveal ? "text" : "password"}
                value={user.password}
                onChange={(e) =>
                  onChange({
                    ...user,
                    password: e.target.value,
                    mustChangePassword: true,
                  })
                }
                placeholder="Generate or type a temporary password"
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
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="h-10" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="h-10" onClick={onSave}>
            Save user
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
