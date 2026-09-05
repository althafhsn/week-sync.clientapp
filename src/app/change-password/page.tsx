"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { destinationFor } from "@/components/auth/AuthGate";
import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { hydrated, signedIn, role, currentUser, changePassword, signOut } =
    useStore();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const needsChange = hydrated && signedIn && !!currentUser?.mustChangePassword;

  useEffect(() => {
    if (!hydrated) return;
    if (!signedIn) {
      router.replace("/login");
      return;
    }
    if (currentUser && !currentUser.mustChangePassword) {
      router.replace(destinationFor(role));
    }
  }, [hydrated, signedIn, currentUser, role, router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Use at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    changePassword(newPassword);
    toast.success("Password updated.");
    router.push(destinationFor(role));
  }

  if (!needsChange) {
    return (
      <div className="text-muted-foreground flex min-h-svh items-center justify-center text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <AuthShowcasePanel />

      <div className="relative flex min-h-svh items-center justify-center px-5 py-10 sm:px-8">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Set a new password
            </h1>
            <p className="text-muted-foreground text-sm">
              You&apos;re signed in as {currentUser?.name} with a temporary
              password. Choose a new one to continue to your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11"
              />
            </div>

            <Button type="submit" className="h-11 w-full">
              Update password &amp; continue
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            className="h-9 w-full"
            onClick={() => {
              signOut();
              router.push("/login");
            }}
          >
            Sign out instead
          </Button>
        </div>
      </div>
    </div>
  );
}
