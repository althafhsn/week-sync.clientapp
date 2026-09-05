"use client";

import { useState } from "react";
import { CheckCircle2, CircleSlash, UserPlus } from "lucide-react";

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
import { PROJECT_STATUS_LABEL, type Project, type ProjectStatus, type User } from "@/lib/types";

const PROJECT_STATUSES = Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[];

export function ProjectEditorCard({
  project,
  members,
  onChange,
  onCancel,
  onSave,
}: {
  project: Project;
  members: User[];
  onChange: (project: Project) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function toggleMember(id: string) {
    const memberIds = project.memberIds.includes(id)
      ? project.memberIds.filter((m) => m !== id)
      : [...project.memberIds, id];
    onChange({ ...project, memberIds });
  }

  const selectedMembers = members.filter((m) =>
    project.memberIds.includes(m.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name ? "Edit project" : "New project"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={project.name}
              onChange={(e) => onChange({ ...project, name: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input
              value={project.category}
              onChange={(e) =>
                onChange({ ...project, category: e.target.value })
              }
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={project.description}
            onChange={(e) =>
              onChange({ ...project, description: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={project.status}
            onValueChange={(value) =>
              onChange({ ...project, status: value as ProjectStatus })
            }
          >
            <SelectTrigger className="h-10 w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {PROJECT_STATUS_LABEL[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {project.status === "active" ? (
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

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="h-10" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="h-10" onClick={onSave}>
            Save project
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
            <CommandInput placeholder="Search by name, email, or team…" />
            <CommandList>
              <CommandEmpty>No members found.</CommandEmpty>
              <CommandGroup>
                {members.map((member) => {
                  const selected = project.memberIds.includes(member.id);
                  return (
                    <CommandItem
                      key={member.id}
                      value={`${member.name} ${member.email} ${member.team}`}
                      onSelect={() => toggleMember(member.id)}
                      data-checked={selected}
                    >
                      <span className="flex-1">
                        {member.name}
                        <span className="text-muted-foreground ml-1.5 text-xs">
                          {member.team}
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
    </Card>
  );
}
