import {
  ClipboardList,
  FilePlus2,
  FolderKanban,
  History,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MEMBER_NAV: NavItem[] = [
  { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/reports/new", label: "New Report", icon: FilePlus2 },
  { href: "/reports", label: "Report History", icon: History },
  { href: "/settings", label: "Account Settings", icon: Settings },
];

const MANAGER_NAV: NavItem[] = [
  { href: "/team", label: "Team Dashboard", icon: LayoutDashboard },
  { href: "/team/reports", label: "Team Reports", icon: ClipboardList },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Account Settings", icon: Settings },
];

export function navForRole(role: Role): NavItem[] {
  return role === "manager" ? MANAGER_NAV : MEMBER_NAV;
}

/**
 * The active item is the one with the longest matching href, so a nested
 * route like "/team/reports" doesn't also light up "/team".
 */
export function activeHrefFor(pathname: string, items: NavItem[]) {
  let best: NavItem | null = null;
  for (const item of items) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (!best || item.href.length > best.href.length)) {
      best = item;
    }
  }
  return best?.href ?? null;
}
