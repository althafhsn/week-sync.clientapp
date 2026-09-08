"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { activeHrefFor, navForRole } from "@/components/app-shell/nav-config";
import type { Role } from "@/lib/types";

export function SidebarNav({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navForRole(role);
  const activeHref = activeHrefFor(pathname, items);

  return (
    <div className="flex h-full flex-col">
      <Link
        href={items[0]?.href ?? "/"}
        onClick={onNavigate}
        className="flex items-center gap-2 px-5 py-5"
      >
        <Image
          src="/logo.svg"
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-lg"
        />
        <span className="text-sm font-semibold tracking-tight">
          Week Sync
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive = item.href === activeHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="text-muted-foreground border-border border-t px-5 py-4 text-xs">
        Weekly Review Hub
      </div>
    </div>
  );
}
