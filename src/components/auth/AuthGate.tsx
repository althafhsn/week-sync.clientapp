"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/store";
import type { Role } from "@/lib/types";

function destinationFor(role: Role) {
  return role === "manager" ? "/team" : "/dashboard";
}

/**
 * Wrap protected page content with this. Redirects to /login once the
 * persisted auth state has rehydrated and there's no signed-in user.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const signedIn = useAuthStore((state) => state.signedIn);

  useEffect(() => {
    if (hydrated && !signedIn) {
      router.replace("/login");
    }
  }, [hydrated, signedIn, router]);

  if (!hydrated || !signedIn) {
    return null;
  }

  return <>{children}</>;
}

export { destinationFor };
