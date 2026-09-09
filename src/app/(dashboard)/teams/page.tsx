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
import {
  createTeam,
  deleteTeam,
  listTeams,
  listTeamsPage,
  updateTeam,
} from "@/lib/api/teams-client";
import { listUsers } from "@/lib/api/users-client";
import { getErrorMessage } from "@/lib/utils";
import { usePaginatedCrud } from "@/lib/use-paginated-crud";
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
  const {
    items: teams,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    loading,
    setLoading,
    pageCount,
    load: loadTeams,
    stepBackIfLastRow,
  } = usePaginatedCrud<Team>({
    initialPageSize: "12",
    loadPage: (pageToLoad, size) => listTeamsPage(pageToLoad, size, INCLUDE),
    loadAll: () => listTeams(INCLUDE),
  });
  const [users, setUsers] = useState<User[]>([]);
  // Every team's membership, independent of `teams`' pagination — the editor
  // needs the full picture to know which users already belong to some other
  // team, not just the ones on the current page.
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<TeamDraft | null>(null);

  usePageHeader({
    title: "Teams",
    description: "Group users into teams and share project access across them.",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([loadTeams(page, pageSize), listUsers(), listTeams(INCLUDE)])
      .then(([, userList, allTeamsList]) => {
        if (cancelled) return;
        setUsers(userList);
        setAllTeams(allTeamsList);
      })
      .catch((error) => toast.error(getErrorMessage(error, "Failed to load teams.")))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, loadTeams, setLoading]);

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
      if (draft.id) {
        await updateTeam(draft.id, payload, INCLUDE);
      } else {
        await createTeam(payload, INCLUDE);
      }
      await Promise.all([loadTeams(page, pageSize), listTeams(INCLUDE).then(setAllTeams)]);
      setDraft(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save team."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTeam(id);
      await stepBackIfLastRow();
      await listTeams(INCLUDE).then(setAllTeams);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete team."));
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
          allTeams={allTeams}
          saving={saving}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={handleSave}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: pageSize === "all" ? 12 : Number(pageSize) }).map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))
          : teams.map((team) => {
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
        <PaginationControls
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          pageSize={pageSize}
          pageSizeOptions={["5", "10", "12", "25", "50", "all"]}
          onPageSizeChange={setPageSize}
          total={total}
        />
      ) : null}
    </div>
  );
}
