"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { PageActions } from "@/components/PageActions";
import {
  ProjectEditorCard,
  type ProjectDraft,
} from "@/components/admin/ProjectEditorCard";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createProject,
  deleteProject,
  listProjects,
  listProjectsPage,
  updateProject,
} from "@/lib/api/projects-client";
import { getErrorMessage } from "@/lib/utils";
import { usePaginatedCrud } from "@/lib/use-paginated-crud";
import { listProjectStatuses } from "@/lib/api/project-statuses-client";
import { listUsers } from "@/lib/api/users-client";
import { listTeams } from "@/lib/api/teams-client";
import type { Project, ProjectStatus, Team, User } from "@/lib/api/types";

const INCLUDE = ["users", "teams", "projectStatus"];

function blankDraft(defaultStatusId: number | null): ProjectDraft {
  return {
    id: null,
    name: "",
    description: "",
    projectStatusId: defaultStatusId,
    isActive: true,
    memberIds: [],
    teamIds: [],
  };
}

function draftFromProject(project: Project): ProjectDraft {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    projectStatusId: project.projectStatusId,
    isActive: project.isActive,
    memberIds: (project.userProjects ?? []).map((up) => up.userId),
    teamIds: (project.teamProjects ?? []).map((tp) => tp.teamId),
  };
}

function ProjectCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const {
    items: projects,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    loading,
    setLoading,
    pageCount,
    load: loadProjects,
    stepBackIfLastRow,
  } = usePaginatedCrud<Project>({
    initialPageSize: "6",
    loadPage: (pageToLoad, size) => listProjectsPage(pageToLoad, size, INCLUDE),
    loadAll: () => listProjects(INCLUDE),
  });
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<ProjectDraft | null>(null);

  usePageHeader({
    title: "Projects",
    description: "Manage the projects and categories teams report against.",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      loadProjects(page, pageSize),
      listUsers(),
      listProjectStatuses(),
      listTeams(),
    ])
      .then(([, userList, statusList, teamList]) => {
        if (cancelled) return;
        setUsers(userList);
        setStatuses(statusList);
        setTeams(teamList);
      })
      .catch((error) =>
        toast.error(getErrorMessage(error, "Failed to load projects."))
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, loadProjects, setLoading]);

  async function handleSave() {
    if (!draft || !draft.name.trim() || draft.projectStatusId == null || saving) {
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        description: draft.description || undefined,
        projectStatus: { id: draft.projectStatusId },
        isActive: draft.isActive,
        userProjects: draft.memberIds.map((id) => ({ user: { id } })),
        teamProjects: draft.teamIds.map((id) => ({ team: { id } })),
      };
      if (draft.id) {
        await updateProject(draft.id, payload, INCLUDE);
      } else {
        await createProject(payload, INCLUDE);
      }
      await loadProjects(page, pageSize);
      setDraft(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save project."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject(id);
      await stepBackIfLastRow();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete project."));
    }
  }

  return (
    <div className="space-y-6">
      <PageActions>
        <Button
          size="sm"
          onClick={() => setDraft(blankDraft(statuses[0]?.id ?? null))}
          className="flex items-center gap-2 py-4"
          disabled={loading || statuses.length === 0}
        >
          <Plus className="size-4" />
          New project
        </Button>
      </PageActions>

      {draft ? (
        <ProjectEditorCard
          draft={draft}
          statuses={statuses}
          users={users}
          teams={teams}
          saving={saving}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={handleSave}
        />
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: pageSize === "all" ? 6 : Number(pageSize) }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const memberCount = project.userProjects?.length ?? 0;
            return (
              <Card key={project.id}>
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold">
                      {project.name}
                    </p>
                    <ProjectStatusBadge
                      status={project.projectStatus?.name ?? "Unknown"}
                      className="shrink-0"
                    />
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {project.description}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {memberCount} member{memberCount === 1 ? "" : "s"} assigned
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDraft(draftFromProject(project))}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading ? (
        <PaginationControls
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          pageSize={pageSize}
          pageSizeOptions={["5", "6", "10", "25", "50", "all"]}
          onPageSizeChange={setPageSize}
          total={total}
        />
      ) : null}
    </div>
  );
}
