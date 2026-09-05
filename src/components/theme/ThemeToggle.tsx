"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, SunMoon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  return (
    <>
      {/* Mobile: a single button that flips directly between light/dark. */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="order-1 size-8 rounded-full sm:hidden"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {mounted ? (
          resolvedTheme === "dark" ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )
        ) : null}
      </Button>

      {/* sm and up: full Light/Dark/System picker. */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden size-9 rounded-full sm:flex"
              aria-label="Toggle theme"
            >
              {mounted ? <SunMoon className="size-4.5" /> : null}
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={theme ?? "system"}
            onValueChange={(value) => setTheme(value as string)}
          >
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon className="size-4" />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
