"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { destinationFor } from "@/components/auth/AuthGate";
import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { Role, User } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const { setMemberId, signIn, upsertUser } = useStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("member");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("Please fill in every field.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    const newUser: User = {
      id: `u-${Math.random().toString(36).slice(2, 9)}`,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      title: role === "manager" ? "Manager" : "Team Member",
      team: "Unassigned",
      joinedAt: new Date().toISOString(),
      password,
      mustChangePassword: false,
    };

    if (role === "member") {
      upsertUser(newUser);
      setMemberId(newUser.id);
    }
    signIn(role);
    router.push(destinationFor(role));
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
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Set up access to Weekly Review Hub in under a minute.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Jordan Rivera"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="role">I am a</Label>
              <Select
                items={[
                  { value: "member", label: "Team member" },
                  { value: "manager", label: "Manager" },
                ]}
                value={role}
                onValueChange={(value) => setRole(value as Role)}
              >
                <SelectTrigger id="role" className="h-11 w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Team member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="h-11 w-full">
              Create account
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-foreground font-medium underline underline-offset-4">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
