"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { PageActions } from "@/components/PageActions";
import { TeamEditorCard, type TeamDraft } from "@/components/admin/TeamEditorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/lib/use-pagination";
import {
  createTeam,
  deleteTeam,
  listTeams,
  updateTeam,
} from "@/lib/api/teams-client";
import { listUsers } from "@/lib/api/users-client";
import type { Team, User } from "@/lib/api/types";

const INCLUDE = ["members"];

function blankDraft(): TeamDraft {
  return {
    id: null,
    name: "",
    isActive: true,
    memberIds: [],
  };
}

function draftFromTeam(team: Team): TeamDraft {
  return {
    id: team.id,
    name: team.name,
    isActive: team.isActive,
    memberIds: (team.teamMembers ?? []).map((tm) => tm.userId),
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function TeamCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<TeamDraft | null>(null);

  usePageHeader({
    title: "Teams",
    description: "Group users into teams and share project access across them.",
  });

  const { page, setPage, pageCount, pageItems: pagedTeams } = usePagination(teams, 9);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listTeams(INCLUDE), listUsers()])
      .then(([teamList, userList]) => {
        if (cancelled) return;
        setTeams(teamList);
        setUsers(userList);
      })
      .catch((error) => toast.error(errorMessage(error, "Failed to load teams.")))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!draft || !draft.name.trim() || saving) {
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        isActive: draft.isActive,
        teamMembers: draft.memberIds.map((id) => ({ user: { id } })),
      };
      const saved = draft.id
        ? await updateTeam(draft.id, payload, INCLUDE)
        : await createTeam(payload, INCLUDE);
      setTeams((prev) => {
        const exists = prev.some((t) => t.id === saved.id);
        return exists
          ? prev.map((t) => (t.id === saved.id ? saved : t))
          : [...prev, saved];
      });
      setDraft(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save team."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTeam(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete team."));
    }
  }

  return (
    <div className="space-y-6">
      <PageActions>
        <Button
          size="sm"
          onClick={() => setDraft(blankDraft())}
          className="flex items-center gap-2 py-4"
          disabled={loading}
        >
          <Plus className="size-4" />
          New team
        </Button>
      </PageActions>

      {draft ? (
        <TeamEditorCard
          draft={draft}
          users={users}
          saving={saving}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={handleSave}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <TeamCardSkeleton key={i} />)
          : pagedTeams.map((team) => {
              const memberCount = team.teamMembers?.length ?? 0;
              return (
                <Card key={team.id}>
                  <CardContent className="space-y-2">
                    <p className="truncate text-sm font-semibold">{team.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {memberCount} member{memberCount === 1 ? "" : "s"} ·{" "}
                      {team.isActive ? "Active" : "Disabled"}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDraft(draftFromTeam(team))}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(team.id)}
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

      {!loading ? (
        <PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
