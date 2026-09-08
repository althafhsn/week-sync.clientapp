"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { signupWithApi } from "@/lib/api/signup-client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("Please fill in every field.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await signupWithApi({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create your account."
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
          {submitted ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="text-success mx-auto size-10" />
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Request submitted
                </h1>
                <p className="text-muted-foreground text-sm">
                  Your account request has been submitted. A manager will
                  review and approve it before you can sign in.
                </p>
              </div>
              <a
                href="/login"
                className="text-foreground inline-block font-medium underline underline-offset-4"
              >
                Back to sign in
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Create your account
                </h1>
                <p className="text-muted-foreground text-sm">
                  Request access to Weekly Review Hub — a manager will
                  approve your account before you can sign in.
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
                  <PasswordInput
                    id="password"
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
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="h-11 w-full" disabled={submitting}>
                  {submitting ? "Submitting…" : "Request access"}
                </Button>
              </form>

              <p className="text-muted-foreground text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="text-foreground font-medium underline underline-offset-4">
                  Sign in
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
