import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type DemoAccountCardProps = {
  icon: LucideIcon;
  name: string;
  blurb: string;
  email: string;
  password: string;
  onEnter: () => void;
};

export function DemoAccountCard({
  icon: Icon,
  name,
  blurb,
  email,
  password,
  onEnter,
}: DemoAccountCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4.5 text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-muted-foreground text-sm">{blurb}</p>
          <p className="text-muted-foreground/80 mt-1 text-xs break-all">
            {email} &middot; {password}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onEnter}
        className="h-11 w-full shrink-0 sm:h-9 sm:w-auto"
      >
        Enter
      </Button>
    </div>
  );
}
