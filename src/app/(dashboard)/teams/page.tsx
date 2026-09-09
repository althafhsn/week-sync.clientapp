"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("12");
  const [users, setUsers] = useState<User[]>([]);
  // Every team's membership, independent of `teams`' pagination — the editor
  // needs the full picture to know which users already belong to some other
  // team, not just the ones on the current page.
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<TeamDraft | null>(null);

  usePageHeader({
    title: "Teams",
    description: "Group users into teams and share project access across them.",
  });

  const pageCount =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(total / Number(pageSize)));

  const loadTeams = useCallback((pageToLoad: number, size: string) => {
    if (size === "all") {
      return listTeams(INCLUDE).then((data) => {
        setTeams(data);
        setTotal(data.length);
      });
    }
    return listTeamsPage(pageToLoad, Number(size), INCLUDE).then((result) => {
      setTeams(result.data);
      setTotal(result.count);
    });
  }, []);

  // Any page-size change invalidates the current page number.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([loadTeams(page, pageSize), listUsers(), listTeams(INCLUDE)])
      .then(([, userList, allTeamsList]) => {
        if (cancelled) return;
        setUsers(userList);
        setAllTeams(allTeamsList);
      })
      .catch((error) => toast.error(errorMessage(error, "Failed to load teams.")))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, loadTeams]);

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
      toast.error(errorMessage(error, "Failed to save team."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTeam(id);
      const targetPage =
        pageSize !== "all" && teams.length === 1 && page > 1 ? page - 1 : page;
      if (targetPage !== page) {
        setPage(targetPage);
      } else {
        await loadTeams(targetPage, pageSize);
      }
      await listTeams(INCLUDE).then(setAllTeams);
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
