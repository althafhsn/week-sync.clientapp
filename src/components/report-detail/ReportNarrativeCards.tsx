import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ACHIEVEMENT_TYPE_LABEL,
  BLOCKER_TYPE_LABEL,
  type WeeklyReport,
} from "@/lib/types";

function KeyTag() {
  return (
    <span className="bg-warning/25 text-warning-foreground inline-flex h-5 shrink-0 items-center rounded px-1.5 text-[0.7rem] font-medium">
      Key
    </span>
  );
}

export function AchievementsBlockersGrid({ report }: { report: WeeklyReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.achievements.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No achievements recorded.
            </p>
          ) : (
            report.achievements.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {ACHIEVEMENT_TYPE_LABEL[entry.type]}:
                </span>
                <p className="text-sm">{entry.description || "—"}</p>
                {entry.isKey ? <KeyTag /> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blockers &amp; risks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.blockers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No blockers recorded.
            </p>
          ) : (
            report.blockers.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {BLOCKER_TYPE_LABEL[entry.type]}:
                </span>
                <p className="text-sm">{entry.description || "—"}</p>
                {entry.isKey ? <KeyTag /> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function NextWeekCard({ report }: { report: WeeklyReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next week</CardTitle>
      </CardHeader>
      <CardContent>
        {report.nextWeekTasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No plan recorded.</p>
        ) : (
          <ol className="list-decimal space-y-1 pl-4 text-sm">
            {report.nextWeekTasks.map((task) => (
              <li key={task.id}>{task.description || "—"}</li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
