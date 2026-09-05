"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { destinationFor } from "@/components/auth/AuthGate";
import { useStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { hydrated, signedIn, role, currentUser } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!signedIn) {
      router.replace("/login");
      return;
    }
    router.replace(
      currentUser?.mustChangePassword ? "/change-password" : destinationFor(role)
    );
  }, [hydrated, signedIn, role, currentUser, router]);

  return null;
}
