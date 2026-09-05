"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { Header } from "@/components/app-shell/Header";
import { SidebarNav } from "@/components/app-shell/SidebarNav";
import { useStore } from "@/lib/store";

export interface PageHeaderValue {
  title: string;
  description?: string;
}

const DEFAULT_HEADER: PageHeaderValue = { title: "Weekly Review Hub" };

const SetPageHeaderContext = createContext<
  ((value: PageHeaderValue) => void) | null
>(null);

/**
 * Pages call this to push their title/description up into the persistent
 * shell header, instead of rendering their own header markup. Action
 * buttons belong in the page body (see PageActions), not here.
 */
export function usePageHeader(value: PageHeaderValue) {
  const setHeader = useContext(SetPageHeaderContext);
  if (!setHeader) {
    throw new Error("usePageHeader must be used within AppShell");
  }

  const { title, description } = value;

  useEffect(() => {
    // Pushes this page's header content up to the shell. setHeader is the
    // stable useState setter from AppShell, so this only re-runs when the
    // page's own header content actually changes.
    setHeader({ title, description });
  }, [setHeader, title, description]);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role } = useStore();
  const [header, setHeader] = useState<PageHeaderValue>(DEFAULT_HEADER);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <SetPageHeaderContext.Provider value={setHeader}>
      <div className="flex min-h-svh">
        <aside className="border-border bg-secondary hidden w-64 shrink-0 border-r lg:block">
          <div className="sticky top-0 h-svh">
            <SidebarNav role={role} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            header={header}
            mobileNavOpen={mobileNavOpen}
            onMobileNavOpenChange={setMobileNavOpen}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </SetPageHeaderContext.Provider>
  );
}
