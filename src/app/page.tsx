"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { destinationFor } from "@/components/auth/AuthGate";
import { useAuthStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const signedIn = useAuthStore((state) => state.signedIn);
  const role = useAuthStore((state) => state.currentUser?.role);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(signedIn && role ? destinationFor(role) : "/login");
  }, [hydrated, signedIn, role, router]);

  return null;
}
