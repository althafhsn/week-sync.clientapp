"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const MANAGER_ROUTE_PREFIXES = ["/team", "/projects", "/users", "/teams"];
const MEMBER_ROUTE_PREFIXES = ["/dashboard", "/reports"];

export function destinationFor(role: Role) {
  return role === "manager" ? "/team" : "/dashboard";
}

function routeMatchesRole(pathname: string, role: Role) {
  const isManagerRoute = MANAGER_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isMemberRoute = MEMBER_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isManagerRoute) return role === "manager";
  if (isMemberRoute) return role === "member";
  return true;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, signedIn, dataLoaded, role, currentUser } = useStore();
  const ready = hydrated && (!signedIn || dataLoaded);

  const mustChangePassword = ready && signedIn && !!currentUser?.mustChangePassword;
  const roleMismatch =
    ready && signedIn && !mustChangePassword && !routeMatchesRole(pathname, role);

  useEffect(() => {
    if (!ready) return;
    if (!signedIn) {
      router.replace("/login");
      return;
    }
    if (mustChangePassword) {
      router.replace("/change-password");
      return;
    }
    if (roleMismatch) {
      router.replace(destinationFor(role));
    }
  }, [ready, signedIn, mustChangePassword, roleMismatch, role, router]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground text-sm">
        Loading your workspace…
      </div>
    );
  }

  if (!signedIn || mustChangePassword || roleMismatch) {
    return null;
  }

  return <>{children}</>;
}
