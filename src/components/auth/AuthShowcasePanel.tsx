import { CalendarCheck2, FolderKanban, Users } from "lucide-react";

const STATS = [
  { label: "Active members", value: "48", icon: Users },
  { label: "Live projects", value: "12", icon: FolderKanban },
  { label: "Reports this week", value: "126", icon: CalendarCheck2 },
];

export function AuthShowcasePanel() {
  return (
    <div className="hidden lg:flex lg:flex-col lg:justify-between h-full w-full border-r border-border bg-secondary text-foreground px-10 py-12 xl:px-14">
      <div className="text-lg font-semibold tracking-tight">
        Weekly Review Hub
      </div>

      <div className="max-w-md space-y-4">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
          One clear rhythm for weekly reporting and review.
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Submit weekly updates, track blockers, and keep managers and teams
          in sync — without another spreadsheet.
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <Icon className="text-primary size-5" />
            <dd className="mt-3 text-2xl font-semibold tracking-tight">
              {value}
            </dd>
            <dt className="text-muted-foreground text-sm">{label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
