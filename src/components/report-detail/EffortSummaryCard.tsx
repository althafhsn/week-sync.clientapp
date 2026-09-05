import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { totalHours, type HoursByType } from "@/lib/types";

const HOUR_LABELS: Array<{ key: keyof HoursByType; label: string }> = [
  { key: "development", label: "Development" },
  { key: "testing", label: "Testing" },
  { key: "meetings", label: "Meetings" },
  { key: "documentation", label: "Documentation" },
];

export function EffortSummaryCard({
  hours,
  title = "Effort summary",
}: {
  hours: HoursByType;
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-2xl font-semibold tracking-tight">
          {totalHours(hours)}h
        </p>
        <div className="space-y-1.5">
          {HOUR_LABELS.map(({ key, label }) => (
            <div
              key={key}
              className="text-muted-foreground flex items-center justify-between text-sm"
            >
              <span>{label}</span>
              <span className="text-foreground">{hours[key]}h</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
