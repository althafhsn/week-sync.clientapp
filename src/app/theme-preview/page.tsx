import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const SWATCHES = [
  { name: "background", className: "bg-background text-foreground border" },
  { name: "card", className: "bg-card text-card-foreground border" },
  { name: "primary", className: "bg-primary text-primary-foreground" },
  { name: "primary-soft", className: "bg-primary-soft text-foreground" },
  { name: "secondary", className: "bg-secondary text-secondary-foreground" },
  { name: "muted", className: "bg-muted text-muted-foreground" },
  { name: "accent", className: "bg-accent text-accent-foreground" },
  {
    name: "destructive",
    className: "bg-destructive text-destructive-foreground",
  },
  { name: "success", className: "bg-success text-success-foreground" },
  { name: "warning", className: "bg-warning text-warning-foreground" },
  { name: "info", className: "bg-info text-info-foreground" },
];

const CHART_SWATCHES = [
  { name: "chart-1", className: "bg-chart-1" },
  { name: "chart-2", className: "bg-chart-2" },
  { name: "chart-3", className: "bg-chart-3" },
  { name: "chart-4", className: "bg-chart-4" },
  { name: "chart-5", className: "bg-chart-5" },
];

export default function ThemePreviewPage() {
  return (
    <div className="min-h-svh px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Theme preview
          </h1>
          <ThemeToggle />
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SWATCHES.map(({ name, className }) => (
            <div
              key={name}
              className={`flex h-16 items-center justify-center rounded-lg text-xs font-medium ${className}`}
            >
              {name}
            </div>
          ))}
        </section>

        <section className="flex gap-3">
          {CHART_SWATCHES.map(({ name, className }) => (
            <div key={name} className="flex-1 space-y-1">
              <div className={`h-10 rounded-md ${className}`} />
              <p className="text-muted-foreground text-center text-xs">
                {name}
              </p>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </section>

        <section className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </section>

        <section
          className="rounded-lg border bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-card-foreground text-sm font-medium">
            shadow-card
          </p>
          <p className="text-muted-foreground text-sm">
            A subtle card elevation using an indigo-tinted shadow.
          </p>
        </section>

        <section
          className="rounded-lg border bg-card p-6"
          style={{ boxShadow: "var(--shadow-panel)" }}
        >
          <p className="text-card-foreground text-sm font-medium">
            shadow-panel
          </p>
          <p className="text-muted-foreground text-sm">
            A deeper panel elevation for overlays and popovers.
          </p>
        </section>

        <section className="rounded-lg bg-sidebar p-6 text-sidebar-foreground">
          <p className="text-sm font-medium">sidebar (stays dark)</p>
          <p className="text-sidebar-foreground/70 text-sm">
            The sidebar panel keeps its dark indigo styling in both light
            and dark mode.
          </p>
        </section>
      </div>
    </div>
  );
}
