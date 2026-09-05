"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const MANAGER_ROUTE_PREFIXES = ["/team", "/projects", "/users"];
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
  const { hydrated, signedIn, role, currentUser } = useStore();

  const mustChangePassword = hydrated && signedIn && !!currentUser?.mustChangePassword;
  const roleMismatch =
    hydrated && signedIn && !mustChangePassword && !routeMatchesRole(pathname, role);

  useEffect(() => {
    if (!hydrated) return;
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
  }, [hydrated, signedIn, mustChangePassword, roleMismatch, role, router]);

  if (!hydrated) {
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
