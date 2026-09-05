"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { usePageHeader } from "@/components/AppShell";
import { PageActions } from "@/components/PageActions";
import { ProjectEditorCard } from "@/components/admin/ProjectEditorCard";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import type { Project } from "@/lib/types";

function blankProject(): Project {
  return {
    id: `p-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    category: "",
    description: "",
    status: "proposed",
    memberIds: [],
  };
}

export default function ProjectsPage() {
  const { projects, members, upsertProject, deleteProject } = useStore();
  const [draft, setDraft] = useState<Project | null>(null);

  usePageHeader({
    title: "Projects",
    description: "Manage the projects and categories teams report against.",
  });

  function handleSave() {
    if (!draft || !draft.name.trim()) return;
    upsertProject(draft);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <PageActions>
        <Button size="sm" onClick={() => setDraft(blankProject())} className="flex items-center gap-2 py-4">
          <Plus className="size-4" />
          New project
        </Button>
      </PageActions>

      {draft ? (
        <ProjectEditorCard
          project={draft}
          members={members}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={handleSave}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {project.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {project.category}
                  </p>
                </div>
                <ProjectStatusBadge status={project.status} className="shrink-0" />
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {project.description}
              </p>
              <p className="text-muted-foreground text-xs">
                {project.memberIds.length} member
                {project.memberIds.length === 1 ? "" : "s"} assigned
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDraft(project)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
