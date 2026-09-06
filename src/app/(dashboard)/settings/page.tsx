"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser, updateUser } from "@/lib/api/users-client";
import { useStore } from "@/lib/store";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function SettingsPage() {
  const { currentUser, updateProfile, reset } = useStore();

  usePageHeader({
    title: "Account settings",
    description: "Update your profile details.",
  });

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    getUser(currentUser.id)
      .then((user) => {
        if (cancelled) return;
        setName(user.name);
        setJobTitle(user.jobTitle ?? "");
        setEmail(user.email);
      })
      .catch((error) =>
        toast.error(errorMessage(error, "Failed to load your profile."))
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  async function handleSave() {
    if (!currentUser || !name.trim() || saving) return;
    setSaving(true);
    try {
      const saved = await updateUser(currentUser.id, {
        name: name.trim(),
        jobTitle: jobTitle.trim() || undefined,
      });
      // Keep the local mirror (used by the header/dashboard greeting) in sync.
      updateProfile({ name: saved.name, title: saved.jobTitle ?? "" });
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update your profile."));
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    reset();
    toast.success("Demo data reset.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Job title</Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={email} disabled className="h-10" />
              </div>
              <Button
                className="h-10 w-full sm:w-auto"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Reports, projects team assignments, and reviews in this app still
            run on seeded demo data. Resetting restores the original seeded
            state for those areas.
          </p>
          <Button
            variant="outline"
            className="h-10 w-full sm:w-auto"
            onClick={handleReset}
          >
            Reset prototype data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
