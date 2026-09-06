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
import { loginWithApi } from "@/lib/api/auth-client";
import type { Role, User } from "@/lib/types";

const MANAGER_ROLE_NAME = "manager";

export default function LoginPage() {
  const router = useRouter();
  const { setMemberId, setManagerId, upsertUser, signIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reason") === "session_expired") {
      toast.error("Your session has expired. Please sign in again.");
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const apiUser = await loginWithApi(email.trim(), password);
      const role: Role =
        apiUser.role?.name.toLowerCase() === MANAGER_ROLE_NAME
          ? "manager"
          : "member";

      const user: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role,
        title: apiUser.jobTitle ?? apiUser.role?.name ?? "",
        team: "",
        joinedAt: new Date().toISOString(),
        password: "",
        mustChangePassword: apiUser.mustChangePassword,
      };

      upsertUser(user);
      if (role === "manager") {
        setManagerId(user.id);
      } else {
        setMemberId(user.id);
      }
      signIn(role);
      router.push(
        user.mustChangePassword ? "/change-password" : destinationFor(role)
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Those credentials don't match an account."
      );
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Sign in to Weekly Review Hub
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back. Enter your details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11"
              />
            </div>

            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            New here?{" "}
            <a href="/signup" className="text-foreground font-medium underline underline-offset-4">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
