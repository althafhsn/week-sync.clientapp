"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { currentUser, updateProfile, reset } = useStore();

  usePageHeader({
    title: "Account settings",
    description: "Update your profile and manage the prototype's demo data.",
  });

  const [name, setName] = useState(currentUser?.name ?? "");
  const [title, setTitle] = useState(currentUser?.title ?? "");
  const [team, setTeam] = useState(currentUser?.team ?? "");

  useEffect(() => {
    // Resyncs the draft fields whenever the signed-in identity changes
    // (e.g. after "Reset prototype data"), so the form doesn't keep
    // showing stale values from a user that no longer applies.
    if (!currentUser) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(currentUser.name);
    setTitle(currentUser.title);
    setTeam(currentUser.team);
  }, [currentUser]);

  function handleSave() {
    updateProfile({ name, title, team });
    toast.success("Profile updated.");
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Team</Label>
            <Input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={currentUser?.email ?? ""} disabled className="h-10" />
          </div>
          <Button className="h-10" onClick={handleSave}>
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            This is a prototype — all data lives in your browser&apos;s local
            storage. Resetting restores the original seeded users, projects,
            and reports.
          </p>
          <Button variant="outline" className="h-10" onClick={handleReset}>
            Reset prototype data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
