"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock3 } from "lucide-react";

import { destinationFor } from "@/components/auth/AuthGate";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useStore } from "@/lib/store";
import { getErrorMessage } from "@/lib/utils";
import { loginWithApi } from "@/lib/api/auth-client";
import { apiUserToUser } from "@/lib/api/mappers";
import type { Role } from "@/lib/types";

// Substring shared with the backend's login-rejection message for a signup
// that hasn't been approved yet — used to show the same "awaiting approval"
// panel as the signup page instead of a generic error toast.
const PENDING_APPROVAL_HINT = "awaiting manager approval";

export default function LoginPage() {
  const router = useRouter();
  const { setMemberId, setManagerId, upsertUser, signIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

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
      const user = apiUserToUser(apiUser);
      const role: Role = user.role;

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
      const message = getErrorMessage(
        error,
        "Those credentials don't match an account."
      );
      if (message.toLowerCase().includes(PENDING_APPROVAL_HINT)) {
        setPendingApproval(true);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      {pendingApproval ? (
        <div className="space-y-4 text-center">
          <Clock3 className="text-warning mx-auto size-10" />
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Awaiting approval
            </h1>
            <p className="text-muted-foreground text-sm">
              Your account request has been submitted and is waiting on a
              manager to approve it. You&apos;ll be able to sign in as
              soon as it&apos;s approved.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={() => setPendingApproval(false)}
          >
            Back to sign in
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Sign in to Week Sync
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
              <PasswordInput
                id="password"
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
        </>
      )}
    </AuthLayout>
  );
}
