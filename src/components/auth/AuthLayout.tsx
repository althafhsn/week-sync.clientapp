import type { ReactNode } from "react";

import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Shared outer shell for the auth pages (login, signup, change-password): a
 * showcase panel, a top-right theme toggle, and a centered max-w-sm column
 * for the page's own form content.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <AuthShowcasePanel />

      <div className="relative flex min-h-svh items-center justify-center px-5 py-10 sm:px-8">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-8">{children}</div>
      </div>
    </div>
  );
}
