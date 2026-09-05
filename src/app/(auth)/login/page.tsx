"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, UserRound } from "lucide-react";

import { destinationFor } from "@/components/auth/AuthGate";
import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";
import { DemoAccountCard } from "@/components/auth/DemoAccountCard";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { DEMO_PASSWORD, seedUsers } from "@/lib/demo-data";
import type { User } from "@/lib/types";

const DEMO_SHORTCUT_EMAILS = ["nasra@northwind.io", "dilani@northwind.io"];

const demoAccounts = DEMO_SHORTCUT_EMAILS.map(
  (email) => seedUsers.find((user) => user.email === email)!
);

export default function LoginPage() {
  const router = useRouter();
  const { users, setMemberId, signIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSignIn(user: User) {
    if (user.role === "member") {
      setMemberId(user.id);
    }
    signIn(user.role);
    router.push(
      user.mustChangePassword ? "/change-password" : destinationFor(user.role)
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const match = users.find(
      (user) => user.email === email.trim().toLowerCase()
    );

    if (!match || match.password !== password) {
      toast.error("Those credentials don't match an account.");
      return;
    }

    handleSignIn(match);
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
              Welcome back. Enter your details or use a demo account below.
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

            <Button type="submit" className="h-11 w-full">
              Sign in
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            New here?{" "}
            <a href="/signup" className="text-foreground font-medium underline underline-offset-4">
              Create an account
            </a>
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Or try a demo account
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {demoAccounts.map((user) => (
              <DemoAccountCard
                key={user.id}
                icon={user.role === "manager" ? Briefcase : UserRound}
                name={user.name}
                blurb={`${user.title} · ${user.team}`}
                email={user.email}
                password={DEMO_PASSWORD}
                onEnter={() => handleSignIn(user)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
