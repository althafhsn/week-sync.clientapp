"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { usePageHeader } from "@/components/AppShell";
import { UserEditorCard } from "@/components/admin/UserEditorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateTempPassword } from "@/lib/password";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";

function blankUser(): User {
  return {
    id: `u-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    email: "",
    role: "member",
    title: "",
    team: "",
    joinedAt: new Date().toISOString().slice(0, 10),
    password: generateTempPassword(),
    mustChangePassword: true,
  };
}

export default function UsersPage() {
  const { users, upsertUser, deleteUser } = useStore();
  const [draft, setDraft] = useState<User | null>(null);

  usePageHeader({
    title: "Users",
    description: "Invite team members and managers, and assign roles.",
    actions: (
      <Button size="sm" onClick={() => setDraft(blankUser())}>
        <Plus className="size-4" />
        Add user
      </Button>
    ),
  });

  function handleSave() {
    if (!draft || !draft.name.trim() || !draft.email.trim() || !draft.password) {
      return;
    }
    upsertUser(draft);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      {draft ? (
        <UserEditorCard
          user={draft}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={handleSave}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="space-y-2">
              <Link
                href={`/team/members/${user.id}`}
                className="block truncate text-sm font-semibold hover:underline"
              >
                {user.name}
              </Link>
              <p className="text-muted-foreground truncate text-xs">
                {user.title}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {user.email}
              </p>
              <p className="text-muted-foreground text-xs">
                {user.team} · {user.role === "manager" ? "Manager" : "Team member"}
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDraft(user)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteUser(user.id)}
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
