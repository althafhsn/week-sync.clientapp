"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { PageActions } from "@/components/PageActions";
import { UserEditorCard, type UserDraft } from "@/components/admin/UserEditorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { generateTempPassword } from "@/lib/password";
import { getErrorMessage } from "@/lib/utils";
import { usePaginatedCrud } from "@/lib/use-paginated-crud";
import { listRoles } from "@/lib/api/roles-client";
import { listUserStatuses } from "@/lib/api/user-statuses-client";
import { listTeams } from "@/lib/api/teams-client";
import { createTeamMember, deleteTeamMember } from "@/lib/api/team-members-client";
import {
  createUser,
  deleteUser,
  listUsers,
  listUsersPage,
  updateUser,
} from "@/lib/api/users-client";
import type { Role, Team, User, UserStatus } from "@/lib/api/types";

const INCLUDE = ["role", "userStatus"];
const PENDING_APPROVAL = "Pending Approval";

function blankDraft(defaultRoleId: number | null): UserDraft {
  return {
    id: null,
    name: "",
    email: "",
    jobTitle: "",
    password: generateTempPassword(),
    roleId: defaultRoleId,
    teamId: null,
    mustChangePassword: true,
    isActive: true,
  };
}

function draftFromUser(user: User, teams: Team[]): UserDraft {
  const currentTeam = teams.find((t) =>
    (t.teamMembers ?? []).some((tm) => tm.userId === user.id)
  );
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    jobTitle: user.jobTitle ?? "",
    password: "",
    roleId: user.roleId,
    teamId: currentTeam?.id ?? null,
    mustChangePassword: user.mustChangePassword,
    isActive: user.isActive,
  };
}

function membershipIdFor(teams: Team[], userId: string): string | null {
  for (const team of teams) {
    const membership = (team.teamMembers ?? []).find((tm) => tm.userId === userId);
    if (membership) return membership.id;
  }
  return null;
}

function UserCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function UsersPage() {
  const {
    items: users,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    loading,
    setLoading,
    pageCount,
    load: loadUsers,
    stepBackIfLastRow,
  } = usePaginatedCrud<User>({
    initialPageSize: "9",
    loadPage: (pageToLoad, size) => listUsersPage(pageToLoad, size, INCLUDE),
    loadAll: () => listUsers(INCLUDE),
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  usePageHeader({
    title: "Users",
    description: "Invite team members and managers, and assign roles.",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      loadUsers(page, pageSize),
      listRoles(),
      listUserStatuses(),
      listTeams(["members"]),
    ])
      .then(([, roleList, statusList, teamList]) => {
        if (cancelled) return;
        setRoles(roleList);
        setUserStatuses(statusList);
        setTeams(teamList);
      })
      .catch((error) => toast.error(getErrorMessage(error, "Failed to load users.")))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, loadUsers, setLoading]);

  async function handleSave() {
    if (
      !draft ||
      !draft.name.trim() ||
      !draft.email.trim() ||
      draft.roleId == null ||
      saving
    ) {
      return;
    }
    setSaving(true);
    try {
      const saved = draft.id
        ? await updateUser(
            draft.id,
            {
              name: draft.name.trim(),
              email: draft.email.trim(),
              jobTitle: draft.jobTitle.trim() || undefined,
              roleId: draft.roleId,
              mustChangePassword: draft.mustChangePassword,
              isActive: draft.isActive,
              ...(draft.password ? { password: draft.password } : {}),
            },
            INCLUDE
          )
        : await createUser(
            {
              name: draft.name.trim(),
              email: draft.email.trim(),
              jobTitle: draft.jobTitle.trim() || undefined,
              password: draft.password,
              roleId: draft.roleId,
              mustChangePassword: draft.mustChangePassword,
            },
            INCLUDE
          );

      const existingMembershipId = membershipIdFor(teams, saved.id);
      const existingTeamId = teams.find((t) =>
        (t.teamMembers ?? []).some((tm) => tm.userId === saved.id)
      )?.id ?? null;
      let nextTeams = teams;
      if (existingTeamId !== draft.teamId) {
        if (existingMembershipId) {
          await deleteTeamMember(existingMembershipId);
          nextTeams = nextTeams.map((t) =>
            t.id === existingTeamId
              ? { ...t, teamMembers: (t.teamMembers ?? []).filter((tm) => tm.id !== existingMembershipId) }
              : t
          );
        }
        if (draft.teamId) {
          const membership = await createTeamMember({ teamId: draft.teamId, userId: saved.id });
          nextTeams = nextTeams.map((t) =>
            t.id === draft.teamId
              ? { ...t, teamMembers: [...(t.teamMembers ?? []), membership] }
              : t
          );
        }
        setTeams(nextTeams);
      }

      await loadUsers(page, pageSize);
      setDraft(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save user."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      await stepBackIfLastRow();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete user."));
    }
  }

  async function handleDecision(id: string, statusName: "Approved" | "Rejected") {
    const status = userStatuses.find((s) => s.name === statusName);
    if (!status) {
      toast.error(`"${statusName}" status is not configured.`);
      return;
    }
    setDecidingId(id);
    try {
      await updateUser(id, { userStatusId: status.id }, INCLUDE);
      await loadUsers(page, pageSize);
      toast.success(
        statusName === "Approved" ? "User approved." : "Signup request rejected."
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update approval status."));
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageActions>
        <Button
          size="sm"
          onClick={() => setDraft(blankDraft(roles[0]?.id ?? null))}
          className="flex items-center gap-2 py-4"
          disabled={loading || roles.length === 0}
        >
          <Plus className="size-4" />
          Add user
        </Button>
      </PageActions>

      {draft ? (
        <UserEditorCard
          draft={draft}
          roles={roles}
          teams={teams}
          saving={saving}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={handleSave}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: pageSize === "all" ? 9 : Number(pageSize) }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))
          : users.map((user) => {
              const isPending = user.userStatus?.name === PENDING_APPROVAL;
              const userTeam = teams.find((t) =>
                (t.teamMembers ?? []).some((tm) => tm.userId === user.id)
              );
              return (
                <Card key={user.id}>
                  <CardContent className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold">
                        {user.name}
                      </p>
                      {isPending ? (
                        <span className="bg-warning/15 text-warning shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                          Pending approval
                        </span>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </p>
                    {user.jobTitle ? (
                      <p className="text-muted-foreground truncate text-xs">
                        {user.jobTitle}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground text-xs">
                      {user.role?.name ?? "Unknown role"} ·{" "}
                      {user.isActive ? "Active" : "Disabled"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Team: {userTeam?.name ?? "Unassigned"}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleDecision(user.id, "Approved")}
                            disabled={decidingId === user.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecision(user.id, "Rejected")}
                            disabled={decidingId === user.id}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDraft(draftFromUser(user, teams))}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user.id)}
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
          pageSizeOptions={["5", "9", "10", "25", "50", "all"]}
          onPageSizeChange={setPageSize}
          total={total}
        />
      ) : null}
    </div>
  );
}
