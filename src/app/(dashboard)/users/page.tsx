"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { PageActions } from "@/components/PageActions";
import { UserEditorCard, type UserDraft } from "@/components/admin/UserEditorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { generateTempPassword } from "@/lib/password";
import { listRoles } from "@/lib/api/roles-client";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from "@/lib/api/users-client";
import type { Role, User } from "@/lib/api/types";

const INCLUDE = ["role"];

function blankDraft(defaultRoleId: number | null): UserDraft {
  return {
    id: null,
    name: "",
    email: "",
    jobTitle: "",
    password: generateTempPassword(),
    roleId: defaultRoleId,
    mustChangePassword: true,
    isActive: true,
  };
}

function draftFromUser(user: User): UserDraft {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    jobTitle: user.jobTitle ?? "",
    password: "",
    roleId: user.roleId,
    mustChangePassword: user.mustChangePassword,
    isActive: user.isActive,
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
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
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<UserDraft | null>(null);

  usePageHeader({
    title: "Users",
    description: "Invite team members and managers, and assign roles.",
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([listUsers(INCLUDE), listRoles()])
      .then(([userList, roleList]) => {
        if (cancelled) return;
        setUsers(userList);
        setRoles(roleList);
      })
      .catch((error) => toast.error(errorMessage(error, "Failed to load users.")))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === saved.id);
        return exists
          ? prev.map((u) => (u.id === saved.id ? saved : u))
          : [...prev, saved];
      });
      setDraft(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save user."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete user."));
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
          saving={saving}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={handleSave}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <UserCardSkeleton key={i} />)
          : users.map((user) => (
              <Card key={user.id}>
                <CardContent className="space-y-2">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
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
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDraft(draftFromUser(user))}
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
            ))}
      </div>
    </div>
  );
}
