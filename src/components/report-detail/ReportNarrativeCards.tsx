import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyReport } from "@/lib/types";

export function AchievementsBlockersGrid({ report }: { report: WeeklyReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">
            {report.achievements || "No achievements recorded."}
          </p>
          {report.keyAchievement ? (
            <p className="text-success text-sm font-medium">
              Key achievement: {report.keyAchievement}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blockers &amp; risks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">
            {report.blockers || "No blockers recorded."}
          </p>
          {report.keyBlocker ? (
            <p className="text-warning text-sm font-medium">
              Key blocker: {report.keyBlocker}
            </p>
          ) : null}
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
        <p className="text-sm whitespace-pre-wrap">
          {report.nextWeekTasks || "No plan recorded."}
        </p>
      </CardContent>
    </Card>
  );
}
