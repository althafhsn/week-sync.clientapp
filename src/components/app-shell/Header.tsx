"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarNav } from "@/components/app-shell/SidebarNav";
import { useStore } from "@/lib/store";
import type { PageHeaderValue } from "@/components/AppShell";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "");
}

export function Header({
  header,
  mobileNavOpen,
  onMobileNavOpenChange,
}: {
  header: PageHeaderValue;
  mobileNavOpen: boolean;
  onMobileNavOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { role, currentUser, signOut } = useStore();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky top-0 z-30 border-b">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet open={mobileNavOpen} onOpenChange={onMobileNavOpenChange}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0 lg:hidden"
              aria-label="Open navigation"
              onClick={() => onMobileNavOpenChange(true)}
            >
              <Menu className="size-4.5" />
            </Button>
            <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarNav role={role} onNavigate={() => onMobileNavOpenChange(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {header.title}
            </h1>
            {header.description ? (
              <p className="text-muted-foreground truncate text-sm">
                {header.description}
              </p>
            ) : null}
          </div>
        </div>

        {header.actions ? (
          <div className="flex flex-wrap items-center gap-2">
            {header.actions}
          </div>
        ) : null}

        <div className="ml-auto flex items-center gap-3">
          {currentUser ? (
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-medium">
                {currentUser.name}
              </p>
              <p className="text-muted-foreground text-xs leading-tight">
                {currentUser.title}
              </p>
            </div>
          ) : null}

          <Avatar>
            <AvatarFallback>
              {currentUser ? initialsOf(currentUser.name) : "?"}
            </AvatarFallback>
          </Avatar>

          <ThemeToggle />

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 sm:size-9"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOut className="size-4.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
